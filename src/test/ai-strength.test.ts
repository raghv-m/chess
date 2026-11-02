/**
 * Measures how strong each difficulty is, by playing levels against each other.
 * Slow, so it only runs when AI_MATCH=1 is set:
 *   AI_MATCH=1 npx jest src/test/ai-strength.test.ts --coverage=false
 * Results are written to /tmp/ai-strength.json.
 */
import * as fs from 'fs';
import { ChessEngine } from '@/lib/chess/engine';
import { ChessAI, Difficulty } from '@/lib/ai/ChessAI';
import { GameState } from '@/types/index';

const run = process.env.AI_MATCH === '1' ? describe : describe.skip;

// Deterministic pseudo-random so every run plays the same openings.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function legalMovesOf(engine: ChessEngine) {
  const moves: { from: any; to: any }[] = [];
  const board = engine.getBoard();
  const me = engine.getCurrentPlayer();
  for (let layer = 0; layer < 3; layer++) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = board[layer][y][x];
    if (!p || p.color !== me) continue;
    const from = { x, y, layer: layer as 0 | 1 | 2 };
    for (const to of engine.getValidMoves(from)) moves.push({ from, to });
  }
  return moves;
}

interface GameResult { winner: 'a' | 'b' | 'draw'; plies: number; reason: string; }

function playGame(a: Difficulty, b: Difficulty, seed: number, aIsWhite: boolean): { result: GameResult; timesA: number[]; timesB: number[] } {
  const engine = new ChessEngine();
  const r = rng(seed);
  // Varied start: 6 random plies, so games differ.
  for (let i = 0; i < 6 && !engine.isGameOver(); i++) {
    const moves = legalMovesOf(engine);
    if (moves.length === 0) break;
    const m = moves[Math.floor(r() * moves.length)];
    engine.makeMove(m.from, m.to);
  }
  const ai = { a: new ChessAI(a), b: new ChessAI(b) };
  const timesA: number[] = [];
  const timesB: number[] = [];
  const MAX_PLIES = 120;
  let plies = 0;
  while (!engine.isGameOver() && plies < MAX_PLIES) {
    const sideIsA = (engine.getCurrentPlayer() === 'white') === aIsWhite;
    const key = sideIsA ? 'a' : 'b';
    const t0 = Date.now();
    const choice = ai[key].chooseMove(engine);
    const dt = Date.now() - t0;
    (sideIsA ? timesA : timesB).push(dt);
    if (!choice) break;
    engine.makeMove(choice.from, choice.to);
    plies++;
  }
  let winner: 'a' | 'b' | 'draw' = 'draw';
  let reason = 'move cap';
  const st = engine.getGameState();
  if (st === GameState.WHITE_WINS || st === GameState.BLACK_WINS) {
    const whiteWon = st === GameState.WHITE_WINS;
    winner = whiteWon === aIsWhite ? 'a' : 'b';
    reason = 'checkmate';
  } else if (engine.isGameOver()) {
    reason = engine.getDrawReason() ?? 'draw';
  } else if (plies >= MAX_PLIES) {
    // Adjudicate by material when the cap is hit.
    const score = material(engine);
    const whiteAhead = score > 100 ? 'white' : score < -100 ? 'black' : null;
    if (whiteAhead) {
      winner = (whiteAhead === 'white') === aIsWhite ? 'a' : 'b';
      reason = 'move cap, material adjudication';
    }
  }
  return { result: { winner, plies, reason }, timesA, timesB };
}

function material(engine: ChessEngine): number {
  const values: Record<string, number> = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0 };
  const board = engine.getBoard();
  let s = 0;
  for (let l = 0; l < 3; l++) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = board[l][y][x];
    if (p) s += (p.color === 'white' ? 1 : -1) * values[p.type];
  }
  return s;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

run('AI strength', () => {
  jest.setTimeout(60 * 60 * 1000);
  test('levels play measurably different games', () => {
    const pairs: [Difficulty, Difficulty][] = [
      ['intermediate', 'beginner'],
      ['expert', 'intermediate'],
      ['expert', 'beginner'],
    ];
    const GAMES_PER_PAIR = Number(process.env.AI_GAMES ?? 4);
    const report: any[] = [];
    for (const [a, b] of pairs) {
      let wins = 0, losses = 0, draws = 0;
      const tA: number[] = [];
      const tB: number[] = [];
      const games: GameResult[] = [];
      for (let g = 0; g < GAMES_PER_PAIR; g++) {
        const aWhite = g % 2 === 0;
        const { result, timesA, timesB } = playGame(a, b, 1000 + g * 37, aWhite);
        games.push(result);
        if (result.winner === 'a') wins++; else if (result.winner === 'b') losses++; else draws++;
        tA.push(...timesA);
        tB.push(...timesB);
      }
      report.push({
        matchup: `${a} vs ${b}`,
        games: GAMES_PER_PAIR,
        [`${a}_wins`]: wins,
        [`${b}_wins`]: losses,
        draws,
        avgMsPerMove: { [a]: Math.round(avg(tA)), [b]: Math.round(avg(tB)) },
        results: games,
      });
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report[report.length - 1]));
    }
    fs.writeFileSync('/tmp/ai-strength.json', JSON.stringify(report, null, 2));
    expect(report.length).toBe(pairs.length);
  });
});
