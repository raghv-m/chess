import { GameState, GameResult, Move, Position, GameOptions, GameCallbacks, PieceEvaluation, PositionEvaluation } from '@/types';
import { GameModeManager } from './GameModeManager';

export class AnalysisManager extends GameModeManager {
  private moveHistory: Move[] = [];
  private evaluations: Map<string, PositionEvaluation> = new Map();

  async initializeGameMode(mode: string, options?: GameOptions): Promise<void> {
    super.initializeGameMode(mode, options);
    this.moveHistory = [];
    this.evaluations.clear();
    this.analyzePosition(this.gameState);
  }

  async makeMove(from: Position, to: Position): Promise<boolean> {
    const moveSuccess = await super.makeMove(from, to);
    if (moveSuccess) {
      const move = this.gameState.moveHistory[this.gameState.moveHistory.length - 1];
      this.moveHistory.push(move);
      this.analyzePosition(this.gameState);
    }
    return moveSuccess;
  }

  private analyzePosition(state: GameState): PositionEvaluation {
    const positionKey = this.getPositionKey(state);
    if (this.evaluations.has(positionKey)) {
      return this.evaluations.get(positionKey)!;
    }

    const evaluation: PositionEvaluation = {
      material: this.evaluateMaterial(state),
      position: this.evaluatePosition(state),
      mobility: this.evaluateMobility(state),
      kingSafety: this.evaluateKingSafety(state),
      centerControl: this.evaluateCenterControl(state),
      total: 0
    };

    evaluation.total = 
      evaluation.material + 
      evaluation.position * 0.1 + 
      evaluation.mobility * 0.1 + 
      evaluation.kingSafety * 0.2 + 
      evaluation.centerControl * 0.1;

    this.evaluations.set(positionKey, evaluation);
    return evaluation;
  }

  private getPositionKey(state: GameState): string {
    return JSON.stringify(state.board);
  }

  private evaluateMaterial(state: GameState): number {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };

    let score = 0;
    state.pieces.white.forEach(piece => {
      score += pieceValues[piece.type];
    });
    state.pieces.black.forEach(piece => {
      score -= pieceValues[piece.type];
    });

    return score;
  }

  private evaluatePosition(state: GameState): number {
    let score = 0;
    const centerSquares = [
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 4, y: 3 }, { x: 4, y: 4 }
    ];

    state.pieces.white.forEach(piece => {
      if (centerSquares.some(square => 
        square.x === piece.position.x && 
        square.y === piece.position.y && 
        piece.position.layer === 1
      )) {
        score += 0.5;
      }
    });

    state.pieces.black.forEach(piece => {
      if (centerSquares.some(square => 
        square.x === piece.position.x && 
        square.y === piece.position.y && 
        piece.position.layer === 1
      )) {
        score -= 0.5;
      }
    });

    return score;
  }

  private evaluateMobility(state: GameState): number {
    let whiteMoves = 0;
    let blackMoves = 0;

    state.pieces.white.forEach(piece => {
      whiteMoves += this.getValidMoves(piece.position).length;
    });

    state.pieces.black.forEach(piece => {
      blackMoves += this.getValidMoves(piece.position).length;
    });

    return whiteMoves - blackMoves;
  }

  private evaluateKingSafety(state: GameState): number {
    let score = 0;
    const whiteKing = state.pieces.white.find(p => p.type === 'king');
    const blackKing = state.pieces.black.find(p => p.type === 'king');

    if (whiteKing) {
      score += this.evaluateKingPosition(whiteKing.position, 'white', state);
    }

    if (blackKing) {
      score -= this.evaluateKingPosition(blackKing.position, 'black', state);
    }

    return score;
  }

  private evaluateKingPosition(position: Position, color: 'white' | 'black', state: GameState): number {
    let score = 0;

    // Evaluate pawn shield
    const direction = color === 'white' ? 1 : -1;
    const pawnShieldPositions = [
      { x: position.x - 1, y: position.y + direction },
      { x: position.x, y: position.y + direction },
      { x: position.x + 1, y: position.y + direction }
    ];

    pawnShieldPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8) {
        const piece = state.board[position.layer][pos.y][pos.x];
        if (piece?.type === 'pawn' && piece.color === color) {
          score += 0.2;
        }
      }
    });

    return score;
  }

  private evaluateCenterControl(state: GameState): number {
    let score = 0;
    const centerSquares = [
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 4, y: 3 }, { x: 4, y: 4 }
    ];

    centerSquares.forEach(square => {
      const whiteMoves = this.countAttacks(square, 'white', state);
      const blackMoves = this.countAttacks(square, 'black', state);
      score += whiteMoves - blackMoves;
    });

    return score;
  }

  private countAttacks(square: { x: number; y: number }, color: 'white' | 'black', state: GameState): number {
    let count = 0;
    state.pieces[color].forEach(piece => {
      const moves = this.getValidMoves(piece.position);
      if (moves.some(move => move.x === square.x && move.y === square.y)) {
        count++;
      }
    });
    return count;
  }

  getEvaluation(): PositionEvaluation {
    return this.analyzePosition(this.gameState);
  }

  getMoveHistory(): Move[] {
    return this.moveHistory;
  }

  undoLastMove(): boolean {
    if (this.moveHistory.length === 0) {
      return false;
    }

    // Implement move undoing logic here
    return true;
  }
} 