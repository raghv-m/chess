import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { ChessEngine, type EngineSnapshot } from '@/lib/chess/engine';
import { GameState, type PieceColor, type Position } from '@/types/index';
import { getServiceClient } from '@/lib/supabase/server';

/**
 * Server-side game service: the single authority over online games.
 *
 * Every mutation follows the same shape:
 *   1. load the `games` row (service role — bypasses RLS),
 *   2. authenticate the caller's seat token against the stored SHA-256
 *      hashes (the raw token never leaves the player's browser storage),
 *   3. hydrate a fresh ChessEngine from the stored snapshot and let IT
 *      decide whether the move is legal and whose turn it is,
 *   4. persist the new snapshot + an append-only row in `moves`.
 *
 * Clients only ever receive the public view built by `buildState()` —
 * token hashes are never returned.
 */

export type GameStatus = 'waiting' | 'active' | 'finished';
export type SeatColor = PieceColor;

export interface MoveLogEntry {
  ply: number;
  from: Position;
  to: Position;
  promotion: string | null;
}

export interface PublicGameState {
  code: string;
  status: GameStatus;
  snapshot: EngineSnapshot;
  moves: MoveLogEntry[];
  /** The seat the presented token owns, or null for spectators. */
  yourSeat: SeatColor | null;
  seats: { white: boolean; black: boolean };
  drawOfferBy: SeatColor | null;
  winner: SeatColor | 'draw' | null;
  endReason: string | null;
  rematchCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export class GameError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface GameRow {
  code: string;
  status: GameStatus;
  snapshot: EngineSnapshot;
  white_token_hash: string | null;
  black_token_hash: string | null;
  draw_offer_by: SeatColor | null;
  winner: SeatColor | 'draw' | null;
  end_reason: string | null;
  rematch_code: string | null;
  created_at: string;
  updated_at: string;
}

// ─── tokens & codes ──────────────────────────────────────────────────────────

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L lookalikes

function generateCode(): string {
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function hashesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function seatForToken(row: GameRow, token: string | null | undefined): SeatColor | null {
  if (!token) return null;
  const hash = hashToken(token);
  if (row.white_token_hash && hashesEqual(hash, row.white_token_hash)) return 'white';
  if (row.black_token_hash && hashesEqual(hash, row.black_token_hash)) return 'black';
  return null;
}

function requireSeat(row: GameRow, token: string | null | undefined): SeatColor {
  const seat = seatForToken(row, token);
  if (!seat) {
    throw new GameError(401, 'Missing or invalid player token for this game.');
  }
  return seat;
}

function otherColor(color: SeatColor): SeatColor {
  return color === 'white' ? 'black' : 'white';
}

// ─── persistence helpers ─────────────────────────────────────────────────────

async function loadGameRow(code: string): Promise<GameRow> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) throw new GameError(500, `Database error: ${error.message}`);
  if (!data) throw new GameError(404, 'Game not found.');
  return data as GameRow;
}

async function loadMoves(code: string): Promise<MoveLogEntry[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('moves')
    .select('ply, from_sq, to_sq, promotion')
    .eq('code', code)
    .order('ply', { ascending: true });

  if (error) throw new GameError(500, `Database error: ${error.message}`);
  return (data ?? []).map((row) => ({
    ply: row.ply as number,
    from: row.from_sq as Position,
    to: row.to_sq as Position,
    promotion: (row.promotion as string | null) ?? null
  }));
}

function buildState(row: GameRow, moves: MoveLogEntry[], yourSeat: SeatColor | null): PublicGameState {
  return {
    code: row.code,
    status: row.status,
    snapshot: row.snapshot,
    moves,
    yourSeat,
    seats: {
      white: row.white_token_hash != null,
      black: row.black_token_hash != null
    },
    drawOfferBy: row.draw_offer_by,
    winner: row.winner,
    endReason: row.end_reason,
    rematchCode: row.rematch_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function currentState(row: GameRow, token: string | null | undefined): Promise<PublicGameState> {
  const moves = await loadMoves(row.code);
  return buildState(row, moves, seatForToken(row, token));
}

/** Unconditional update by code; returns the fresh row. */
async function saveRow(code: string, patch: Partial<GameRow>): Promise<GameRow> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('games')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('code', code);
  if (error) throw new GameError(500, `Database error: ${error.message}`);
  return loadGameRow(code);
}

function outcomeFor(engineState: GameState): {
  status: GameStatus;
  winner: SeatColor | 'draw' | null;
  endReason: string | null;
} {
  switch (engineState) {
    case GameState.WHITE_WINS:
      return { status: 'finished', winner: 'white', endReason: 'checkmate' };
    case GameState.BLACK_WINS:
      return { status: 'finished', winner: 'black', endReason: 'checkmate' };
    case GameState.STALEMATE:
      return { status: 'finished', winner: 'draw', endReason: 'stalemate' };
    case GameState.DRAW:
      return { status: 'finished', winner: 'draw', endReason: 'insufficient_material' };
    default:
      return { status: 'active', winner: null, endReason: null };
  }
}

// ─── input validation ────────────────────────────────────────────────────────

function asPosition(value: unknown): Position | null {
  if (typeof value !== 'object' || value === null) return null;
  const p = value as Record<string, unknown>;
  const { x, y, layer } = p;
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(layer)) return null;
  if ((x as number) < 0 || (x as number) > 7) return null;
  if ((y as number) < 0 || (y as number) > 7) return null;
  if ((layer as number) < 0 || (layer as number) > 2) return null;
  return { x: x as number, y: y as number, layer: layer as 0 | 1 | 2 };
}

const PROMOTION_PIECES = ['queen', 'rook', 'bishop', 'knight'] as const;
type PromotionPiece = (typeof PROMOTION_PIECES)[number];

function asPromotion(value: unknown): PromotionPiece | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && (PROMOTION_PIECES as readonly string[]).includes(value)) {
    return value as PromotionPiece;
  }
  throw new GameError(400, 'Invalid promotion piece.');
}

// ─── public operations ───────────────────────────────────────────────────────

export async function createGame(): Promise<{
  code: string;
  token: string;
  seat: SeatColor;
  state: PublicGameState;
}> {
  const supabase = getServiceClient();
  const token = generateToken();
  const snapshot = new ChessEngine().toSnapshot();
  const now = new Date().toISOString();

  // Room codes are random; on the (rare) primary-key collision, retry.
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateCode();
    const row: GameRow = {
      code,
      status: 'waiting',
      snapshot,
      white_token_hash: hashToken(token),
      black_token_hash: null,
      draw_offer_by: null,
      winner: null,
      end_reason: null,
      rematch_code: null,
      created_at: now,
      updated_at: now
    };

    const { error } = await supabase.from('games').insert(row);
    if (!error) {
      return { code, token, seat: 'white', state: buildState(row, [], 'white') };
    }
    if (error.code !== '23505') {
      throw new GameError(500, `Database error: ${error.message}`);
    }
  }
  throw new GameError(500, 'Could not allocate a room code. Try again.');
}

export async function getGame(
  code: string,
  token: string | null | undefined
): Promise<PublicGameState> {
  const row = await loadGameRow(code);
  return currentState(row, token);
}

export async function joinGame(
  code: string,
  token: string | null | undefined
): Promise<{ seat: SeatColor; token: string | null; state: PublicGameState }> {
  const row = await loadGameRow(code);

  // Already seated (e.g. the creator reopening their own link): no-op.
  const existingSeat = seatForToken(row, token);
  if (existingSeat) {
    return { seat: existingSeat, token: null, state: await currentState(row, token) };
  }

  if (row.status !== 'waiting' || row.black_token_hash) {
    throw new GameError(409, 'This game already has two players.');
  }

  const blackToken = generateToken();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('games')
    .update({
      black_token_hash: hashToken(blackToken),
      status: 'active' as GameStatus,
      updated_at: new Date().toISOString()
    })
    .eq('code', code)
    .eq('status', 'waiting')
    .is('black_token_hash', null)
    .select('code');

  if (error) throw new GameError(500, `Database error: ${error.message}`);
  if (!data || data.length === 0) {
    // Lost a race for the black seat.
    throw new GameError(409, 'This game already has two players.');
  }

  const fresh = await loadGameRow(code);
  return { seat: 'black', token: blackToken, state: await currentState(fresh, blackToken) };
}

export async function makeMove(
  code: string,
  token: string | null | undefined,
  fromRaw: unknown,
  toRaw: unknown,
  promotionRaw: unknown
): Promise<PublicGameState> {
  const row = await loadGameRow(code);
  const seat = requireSeat(row, token);

  if (row.status === 'waiting') {
    throw new GameError(409, 'Waiting for an opponent to join before moving.');
  }
  if (row.status === 'finished') {
    throw new GameError(409, 'This game is already finished.');
  }

  const from = asPosition(fromRaw);
  const to = asPosition(toRaw);
  if (!from || !to) {
    throw new GameError(400, 'Move must include valid from/to squares.');
  }
  const promotion = asPromotion(promotionRaw);

  if (row.snapshot.currentPlayer !== seat) {
    throw new GameError(403, 'It is not your turn.');
  }

  // The engine is the referee: it re-checks turn order, piece ownership,
  // movement rules for the 3-layer variant, and king safety.
  const engine = ChessEngine.fromSnapshot(row.snapshot);
  const ok = engine.makeMove(from, to, promotion);
  if (!ok) {
    throw new GameError(422, 'Illegal move.');
  }

  const history = engine.getMoveHistory();
  const lastMove = history[history.length - 1];
  const ply = history.length;
  const newSnapshot = engine.toSnapshot();
  const outcome = outcomeFor(engine.getGameState());

  const supabase = getServiceClient();

  // Append the move first: the (code, ply) primary key makes a duplicated
  // submission fail instead of double-applying.
  const { error: moveError } = await supabase.from('moves').insert({
    code,
    ply,
    from_sq: lastMove.from,
    to_sq: lastMove.to,
    promotion: lastMove.promotionPiece ?? null
  });
  if (moveError) {
    if (moveError.code === '23505') {
      throw new GameError(409, 'That move was already recorded.');
    }
    throw new GameError(500, `Database error: ${moveError.message}`);
  }

  // Optimistic concurrency: only write if nobody else touched the row
  // since we loaded it.
  const { data: updated, error: updateError } = await supabase
    .from('games')
    .update({
      snapshot: newSnapshot,
      status: outcome.status,
      winner: outcome.winner,
      end_reason: outcome.endReason,
      draw_offer_by: null, // an offer never survives a change of position
      updated_at: new Date().toISOString()
    })
    .eq('code', code)
    .eq('updated_at', row.updated_at)
    .select('code');

  if (updateError || !updated || updated.length === 0) {
    // Roll back the move row we just appended.
    await supabase.from('moves').delete().eq('code', code).eq('ply', ply);
    if (updateError) throw new GameError(500, `Database error: ${updateError.message}`);
    throw new GameError(409, 'The game changed while your move was being saved. Refetch and try again.');
  }

  const fresh = await loadGameRow(code);
  return currentState(fresh, token);
}

export async function resignGame(
  code: string,
  token: string | null | undefined
): Promise<PublicGameState> {
  const row = await loadGameRow(code);
  const seat = requireSeat(row, token);

  if (row.status === 'finished') {
    return currentState(row, token); // idempotent
  }

  if (row.status === 'waiting') {
    // Only the creator can be seated in a waiting game.
    const fresh = await saveRow(code, {
      status: 'finished',
      winner: null,
      end_reason: 'abandoned',
      draw_offer_by: null
    });
    return currentState(fresh, token);
  }

  const fresh = await saveRow(code, {
    status: 'finished',
    winner: otherColor(seat),
    end_reason: 'resignation',
    draw_offer_by: null
  });
  return currentState(fresh, token);
}

export type DrawAction = 'offer' | 'accept' | 'decline' | 'withdraw';

export async function drawAction(
  code: string,
  token: string | null | undefined,
  action: DrawAction
): Promise<PublicGameState> {
  const row = await loadGameRow(code);
  const seat = requireSeat(row, token);

  if (row.status !== 'active') {
    throw new GameError(409, 'Draw offers are only possible while the game is active.');
  }

  switch (action) {
    case 'offer': {
      if (row.draw_offer_by === seat) {
        return currentState(row, token); // already offered — idempotent
      }
      if (row.draw_offer_by) {
        throw new GameError(409, 'Your opponent has already offered a draw. Accept or decline it.');
      }
      const fresh = await saveRow(code, { draw_offer_by: seat });
      return currentState(fresh, token);
    }
    case 'accept': {
      if (row.draw_offer_by !== otherColor(seat)) {
        throw new GameError(409, 'There is no opponent draw offer to accept.');
      }
      const fresh = await saveRow(code, {
        status: 'finished',
        winner: 'draw',
        end_reason: 'draw_agreement',
        draw_offer_by: null
      });
      return currentState(fresh, token);
    }
    case 'decline': {
      if (row.draw_offer_by !== otherColor(seat)) {
        throw new GameError(409, 'There is no opponent draw offer to decline.');
      }
      const fresh = await saveRow(code, { draw_offer_by: null });
      return currentState(fresh, token);
    }
    case 'withdraw': {
      if (row.draw_offer_by !== seat) {
        throw new GameError(409, 'You have no draw offer to withdraw.');
      }
      const fresh = await saveRow(code, { draw_offer_by: null });
      return currentState(fresh, token);
    }
  }
}

export async function rematchGame(
  code: string,
  token: string | null | undefined
): Promise<{ code: string; state: PublicGameState }> {
  const row = await loadGameRow(code);
  requireSeat(row, token);

  if (row.status !== 'finished') {
    throw new GameError(409, 'Rematch is only available once the game has finished.');
  }

  if (row.rematch_code) {
    const target = await loadGameRow(row.rematch_code);
    return { code: target.code, state: await currentState(target, token) };
  }

  const supabase = getServiceClient();
  const snapshot = new ChessEngine().toSnapshot();
  const now = new Date().toISOString();

  // Colours swap: the old black player becomes white in the rematch.
  // Seat credentials carry over by hash, so each player's existing token
  // works for the new game — the client just copies its stored token to
  // the new code. If the old game never had a black player (abandoned
  // while waiting), fall back to a fresh game with the caller as white.
  const swapped = row.black_token_hash != null;
  const newRow: GameRow = {
    code: '', // assigned in the retry loop below
    status: swapped ? 'active' : 'waiting',
    snapshot,
    white_token_hash: swapped ? row.black_token_hash : row.white_token_hash,
    black_token_hash: swapped ? row.white_token_hash : null,
    draw_offer_by: null,
    winner: null,
    end_reason: null,
    rematch_code: null,
    created_at: now,
    updated_at: now
  };

  let inserted: GameRow | null = null;
  for (let attempt = 0; attempt < 8 && !inserted; attempt++) {
    const candidate: GameRow = { ...newRow, code: generateCode() };
    const { error } = await supabase.from('games').insert(candidate);
    if (!error) {
      inserted = candidate;
    } else if (error.code !== '23505') {
      throw new GameError(500, `Database error: ${error.message}`);
    }
  }
  if (!inserted) throw new GameError(500, 'Could not allocate a room code. Try again.');

  // Point the old game at the rematch — only if nobody beat us to it.
  const { data: pointed, error: pointError } = await supabase
    .from('games')
    .update({ rematch_code: inserted.code, updated_at: new Date().toISOString() })
    .eq('code', code)
    .is('rematch_code', null)
    .select('code');

  if (pointError) throw new GameError(500, `Database error: ${pointError.message}`);

  if (!pointed || pointed.length === 0) {
    // Another rematch was created first: drop ours and use theirs.
    await supabase.from('games').delete().eq('code', inserted.code);
    const freshOld = await loadGameRow(code);
    if (!freshOld.rematch_code) {
      throw new GameError(500, 'Rematch linking failed. Try again.');
    }
    const target = await loadGameRow(freshOld.rematch_code);
    return { code: target.code, state: await currentState(target, token) };
  }

  return { code: inserted.code, state: buildState(inserted, [], seatForToken(inserted, token)) };
}
