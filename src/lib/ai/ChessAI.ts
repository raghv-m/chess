import { ChessPiece, GameState, Move, Position } from '@/types';
import { ChessEngine } from '../chess/engine';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export class ChessAI {
  private engine: ChessEngine;
  private difficulty: Difficulty;
  private readonly PIECE_VALUES = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
  };

  constructor(difficulty: Difficulty = 'intermediate') {
    this.engine = new ChessEngine();
    this.difficulty = difficulty;
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  private getDepthForDifficulty(): number {
    switch (this.difficulty) {
      case 'beginner':
        return 2;
      case 'intermediate':
        return 3;
      case 'expert':
        return 4;
    }
  }

  public async getNextMove(gameState: GameState): Promise<Move | null> {
    const depth = this.getDepthForDifficulty();
    const moves = this.generateAllMoves(gameState);
    
    if (moves.length === 0) return null;

    // For beginner level, occasionally make random moves
    if (this.difficulty === 'beginner' && Math.random() < 0.3) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return this.createMove(gameState, randomMove.from, randomMove.to);
    }

    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const newState = this.simulateMove(gameState, move);
      const score = -this.minimax(newState, depth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = this.createMove(gameState, move.from, move.to);
      }
    }

    return bestMove;
  }

  private minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || state.isCheckmate || state.isStalemate) {
      return this.evaluatePosition(state);
    }

    const moves = this.generateAllMoves(state);
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const newState = this.simulateMove(state, move);
        const score = this.minimax(newState, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const newState = this.simulateMove(state, move);
        const score = this.minimax(newState, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  private evaluatePosition(state: GameState): number {
    let score = 0;

    // Material value
    for (let layer = 0; layer < state.board.length; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = state.board[layer][y][x];
          if (piece) {
            const value = this.PIECE_VALUES[piece.type] * (piece.color === 'white' ? 1 : -1);
            score += value;
          }
        }
      }
    }

    // Position evaluation
    score += this.evaluatePositionalFactors(state);

    // Layer control bonus
    score += this.evaluateLayerControl(state);

    // King safety
    score += this.evaluateKingSafety(state);

    return score;
  }

  private evaluatePositionalFactors(state: GameState): number {
    let score = 0;

    // Center control
    const centerSquares = [
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 4, y: 3 }, { x: 4, y: 4 }
    ];

    for (const square of centerSquares) {
      for (let layer = 0; layer < state.board.length; layer++) {
        const piece = state.board[layer][square.y][square.x];
        if (piece) {
          score += piece.color === 'white' ? 0.3 : -0.3;
        }
      }
    }

    return score;
  }

  private evaluateLayerControl(state: GameState): number {
    let score = 0;
    const middleLayer = 1;

    // Count pieces in middle layer
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = state.board[middleLayer][y][x];
        if (piece) {
          score += piece.color === 'white' ? 0.5 : -0.5;
        }
      }
    }

    return score;
  }

  private evaluateKingSafety(state: GameState): number {
    let score = 0;

    // Find kings
    const whiteKing = this.findKing(state, 'white');
    const blackKing = this.findKing(state, 'black');

    if (whiteKing) {
      score += this.calculateKingSafetyScore(state, whiteKing, 'white');
    }

    if (blackKing) {
      score -= this.calculateKingSafetyScore(state, blackKing, 'black');
    }

    return score;
  }

  private calculateKingSafetyScore(state: GameState, kingPos: Position, color: 'white' | 'black'): number {
    let score = 0;

    // Pawn shield
    const pawnDirection = color === 'white' ? 1 : -1;
    const pawnRow = kingPos.y + pawnDirection;
    
    if (pawnRow >= 0 && pawnRow < 8) {
      for (let x = Math.max(0, kingPos.x - 1); x <= Math.min(7, kingPos.x + 1); x++) {
        const piece = state.board[kingPos.layer][pawnRow][x];
        if (piece?.type === 'pawn' && piece.color === color) {
          score += 0.5;
        }
      }
    }

    // Piece protection
    const protectors = this.countProtectingPieces(state, kingPos, color);
    score += protectors * 0.3;

    return score;
  }

  private countProtectingPieces(state: GameState, kingPos: Position, color: 'white' | 'black'): number {
    let count = 0;

    // Check surrounding squares
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const x = kingPos.x + dx;
        const y = kingPos.y + dy;

        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const piece = state.board[kingPos.layer][y][x];
          if (piece && piece.color === color && piece.type !== 'king') {
            count++;
          }
        }
      }
    }

    return count;
  }

  private findKing(state: GameState, color: 'white' | 'black'): Position | null {
    for (let layer = 0; layer < state.board.length; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = state.board[layer][y][x];
          if (piece?.type === 'king' && piece.color === color) {
            return { layer, x, y };
          }
        }
      }
    }
    return null;
  }

  private generateAllMoves(state: GameState): { from: Position; to: Position }[] {
    const moves: { from: Position; to: Position }[] = [];
    const currentColor = state.currentTurn;

    for (let layer = 0; layer < state.board.length; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = state.board[layer][y][x];
          if (piece && piece.color === currentColor) {
            const validMoves = this.getValidMoves(state, { layer, x, y });
            moves.push(...validMoves.map(to => ({
              from: { layer, x, y },
              to
            })));
          }
        }
      }
    }

    return moves;
  }

  private getValidMoves(state: GameState, from: Position): Position[] {
    // This should use the same move validation logic as the chess engine
    // For now, returning an empty array as placeholder
    return [];
  }

  private simulateMove(state: GameState, move: { from: Position; to: Position }): GameState {
    // Create a deep copy of the state
    const newState: GameState = JSON.parse(JSON.stringify(state));
    
    // Move the piece
    const piece = newState.board[move.from.layer][move.from.y][move.from.x];
    newState.board[move.to.layer][move.to.y][move.to.x] = piece;
    newState.board[move.from.layer][move.from.y][move.from.x] = null;

    // Update current turn
    newState.currentTurn = newState.currentTurn === 'white' ? 'black' : 'white';

    return newState;
  }

  private createMove(state: GameState, from: Position, to: Position): Move {
    const piece = state.board[from.layer][from.y][from.x];
    const capturedPiece = state.board[to.layer][to.y][to.x];

    return {
      from,
      to,
      piece: piece!,
      capturedPiece: capturedPiece || undefined
    };
  }
} 