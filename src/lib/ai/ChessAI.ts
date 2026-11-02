import { ChessEngine } from '../chess/engine';
import { GameState as EngineGameState, LayerIndex, Position, PieceType } from '@/types/index';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface AIMove {
  from: Position;
  to: Position;
}

/**
 * Computer opponent. Works directly on a ChessEngine, so it only ever
 * considers moves the real rules allow. Search is negamax with alpha-beta
 * pruning; each difficulty only changes search depth (and, for beginners,
 * how often it plays a random legal move).
 */
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 0,
};

const MATE = 100000;

export class ChessAI {
  private difficulty: Difficulty;

  constructor(difficulty: Difficulty = 'intermediate') {
    this.difficulty = difficulty;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  /** Pick a move for the side to move in `engine`. Returns null if there is none. */
  chooseMove(engine: ChessEngine): AIMove | null {
    const moves = this.legalMoves(engine);
    if (moves.length === 0) return null;

    if (this.difficulty === 'beginner' && Math.random() < 0.25) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const depth = this.depth();
    let best: AIMove = moves[0];
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of this.orderMoves(engine, moves)) {
      const child = this.clone(engine);
      child.makeMove(move.from, move.to);
      const score = -this.negamax(child, depth - 1, -beta, -alpha);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
      alpha = Math.max(alpha, score);
    }
    return best;
  }

  private depth(): number {
    switch (this.difficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'expert': return 3;
    }
  }

  private negamax(engine: ChessEngine, depth: number, alpha: number, beta: number): number {
    const state = engine.getGameState();
    if (state === EngineGameState.WHITE_WINS || state === EngineGameState.BLACK_WINS) {
      // The side to move has been checkmated. Prefer quicker mates by subtracting depth.
      return -MATE - depth;
    }
    if (state === EngineGameState.STALEMATE || state === EngineGameState.DRAW) {
      return 0;
    }
    if (depth <= 0) {
      return this.evaluate(engine);
    }

    const moves = this.legalMoves(engine);
    if (moves.length === 0) {
      return 0;
    }

    let best = -Infinity;
    for (const move of this.orderMoves(engine, moves)) {
      const child = this.clone(engine);
      child.makeMove(move.from, move.to);
      const score = -this.negamax(child, depth - 1, -beta, -alpha);
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return best;
  }

  /** Material plus a small bonus for central squares, from the side to move's view. */
  private evaluate(engine: ChessEngine): number {
    const me = engine.getCurrentPlayer();
    const board = engine.getBoard();
    let score = 0;
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[layer][y][x];
          if (!piece) continue;
          const sign = piece.color === me ? 1 : -1;
          const centre = 3.5 - Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5));
          score += sign * (PIECE_VALUES[piece.type] + centre * 4);
        }
      }
    }
    return score;
  }

  private legalMoves(engine: ChessEngine): AIMove[] {
    const moves: AIMove[] = [];
    const board = engine.getBoard();
    const me = engine.getCurrentPlayer();
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[layer][y][x];
          if (!piece || piece.color !== me) continue;
          const from: Position = { x, y, layer: layer as LayerIndex };
          for (const to of engine.getValidMoves(from)) {
            moves.push({ from, to });
          }
        }
      }
    }
    return moves;
  }

  /** Captures first, so alpha-beta prunes more. */
  private orderMoves(engine: ChessEngine, moves: AIMove[]): AIMove[] {
    const board = engine.getBoard();
    const captureValue = (m: AIMove) => {
      const target = board[m.to.layer][m.to.y][m.to.x];
      return target ? PIECE_VALUES[target.type] : 0;
    };
    return [...moves].sort((a, b) => captureValue(b) - captureValue(a));
  }

  private clone(engine: ChessEngine): ChessEngine {
    return ChessEngine.fromSnapshot(engine.toSnapshot());
  }
}
