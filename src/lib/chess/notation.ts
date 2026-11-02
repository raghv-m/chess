import type { ChessEngine } from './engine';
import type { LayerIndex, Position } from '@/types/index';

/**
 * Coordinate notation for the three-layer board.
 * A square is file + rank + ':' + layer, with layers numbered 1 to 3.
 * Example: e2:1 is file e, rank 2, layer 1. A move is from + to, with an
 * optional promotion letter: "e2:1e4:1", "a7:2a8:2q".
 * Standard FEN and SAN do not describe this board, so this is the
 * notation the game uses. It is not FEN, PGN or SAN.
 */

const FILES = 'abcdefgh';
const PROMOTION_LETTERS: Record<string, 'queen' | 'rook' | 'bishop' | 'knight'> = {
  q: 'queen', r: 'rook', b: 'bishop', n: 'knight'
};
const LETTER_FOR: Record<string, string> = {
  queen: 'q', rook: 'r', bishop: 'b', knight: 'n'
};

export function squareToString(p: { x: number; y: number; layer: number }): string {
  return `${FILES[p.x]}${p.y + 1}:${p.layer + 1}`;
}

export function parseSquare(text: string): Position | null {
  const m = /^([a-h])([1-8]):([123])$/.exec(text);
  if (!m) return null;
  return {
    x: FILES.indexOf(m[1]),
    y: Number(m[2]) - 1,
    layer: (Number(m[3]) - 1) as LayerIndex
  };
}

export interface NotationMove {
  from: Position;
  to: Position;
  promotion?: 'queen' | 'rook' | 'bishop' | 'knight';
}

export function moveToString(move: { from: Position; to: Position; promotionPiece?: string }): string {
  const promo = move.promotionPiece ? LETTER_FOR[move.promotionPiece] ?? '' : '';
  return `${squareToString(move.from)}${squareToString(move.to)}${promo}`;
}

export function parseMoveString(text: string): NotationMove | null {
  const m = /^([a-h][1-8]:[123])([a-h][1-8]:[123])([qrbn])?$/i.exec(text.trim());
  if (!m) return null;
  const from = parseSquare(m[1].toLowerCase());
  const to = parseSquare(m[2].toLowerCase());
  if (!from || !to) return null;
  const promotion = m[3] ? PROMOTION_LETTERS[m[3].toLowerCase()] : undefined;
  return { from, to, promotion };
}

/**
 * Find the legal move the text describes in the engine's current position.
 * Returns null when the text is malformed or the move is not legal.
 * A promotion without a letter defaults to a queen, matching makeMove.
 */
export function findLegalMove(engine: ChessEngine, text: string): NotationMove | null {
  const parsed = parseMoveString(text);
  if (!parsed) return null;
  const piece = engine.getPieceAt(parsed.from);
  if (!piece || piece.color !== engine.getCurrentPlayer()) return null;
  const legal = engine.getValidMoves(parsed.from).some(
    t => t.x === parsed.to.x && t.y === parsed.to.y && t.layer === parsed.to.layer
  );
  if (!legal) return null;
  return parsed;
}

/** Numbered move list, for example "1. e2:1e4:1 e7:1e5:1 2. ...". */
export function moveListString(engine: ChessEngine): string {
  const parts: string[] = [];
  engine.getMoveHistory().forEach((move, i) => {
    if (i % 2 === 0) parts.push(`${Math.floor(i / 2) + 1}.`);
    parts.push(moveToString(move));
  });
  return parts.join(' ');
}
