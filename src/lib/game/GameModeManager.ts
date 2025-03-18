import { GameState, Move, Position, ChessPiece, PieceType, PieceColor, GameOptions, GameCallbacks, PieceEvaluation, PositionEvaluation } from '@/types';
import { GameStateManager } from './GameStateManager';
import { socketClient } from '../socket';

export class GameModeManager {
  private gameState: GameStateManager;
  private mode: 'local' | 'ai' | 'multiplayer' = 'local';
  private difficulty: 'beginner' | 'intermediate' | 'expert' = 'beginner';
  private callbacks: GameCallbacks = {};
  private roomId?: string;

  constructor() {
    this.gameState = new GameStateManager();
  }

  async initializeGameMode(mode: 'local' | 'ai' | 'multiplayer', options?: GameOptions) {
    this.mode = mode;
    this.difficulty = options?.difficulty || 'beginner';

    if (mode === 'multiplayer' && options?.serverUrl) {
      socketClient.setCallbacks({
        onGameStateUpdate: (newState) => {
          this.gameState = new GameStateManager(newState);
          this.callbacks.onMove?.(newState);
        },
        onGameEnd: this.callbacks.onGameEnd,
        onError: this.callbacks.onError
      });

      socketClient.connect();
      this.roomId = Math.random().toString(36).substring(7);
      socketClient.joinRoom(this.roomId);
    }
  }

  setCallbacks(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  getGameState(): GameState {
    return this.gameState.getGameState();
  }

  async makeMove(from: Position, to: Position): Promise<boolean> {
    const success = this.gameState.makeMove(from, to);
    if (!success) return false;

    const newState = this.gameState.getGameState();
    this.callbacks.onMove?.(newState);

    if (this.mode === 'multiplayer' && this.roomId) {
      socketClient.makeMove(this.roomId, { 
        from, 
        to,
        piece: newState.board[from.layer][from.y][from.x]!
      });
    } else if (this.mode === 'ai' && newState.currentTurn === 'black') {
      await this.makeAIMove();
    }

    return true;
  }

  cleanup() {
    if (this.mode === 'multiplayer') {
      socketClient.disconnect();
    }
  }

  private async makeAIMove() {
    const move = this.getBestMove();
    if (move) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for better UX
      await this.makeMove(move.from, move.to);
    }
  }

  private getBestMove(): Move | null {
    const state = this.getGameState();
    const depth = this.getSearchDepth();
    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    const alpha = -Infinity;
    const beta = Infinity;

    const validMoves = this.getAllPossibleMoves(state, 'black');
    for (const move of validMoves) {
      const newState = this.applyMoveToState(state, move);
      const score = -this.minimax(newState, depth - 1, -beta, -alpha, true);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'beginner': return 2;
      case 'intermediate': return 3;
      case 'expert': return 4;
      default: return 2;
    }
  }

  private minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluatePosition(state).total;
    }

    const moves = this.getAllPossibleMoves(state, isMaximizing ? 'white' : 'black');
    
    if (moves.length === 0) {
      if (state.isCheckmate) {
        return isMaximizing ? -10000 : 10000;
      }
      return 0; // Stalemate
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;
    
    for (const move of moves) {
      const newState = this.applyMoveToState(state, move);
      const score = this.minimax(newState, depth - 1, alpha, beta, !isMaximizing);
      
      if (isMaximizing) {
        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, score);
      } else {
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, score);
      }
      
      if (beta <= alpha) {
        break;
      }
    }

    return bestScore;
  }

  private evaluatePosition(state: GameState): PositionEvaluation {
    const evaluation: PositionEvaluation = {
      material: 0,
      position: 0,
      mobility: 0,
      kingSafety: 0,
      centerControl: 0,
      total: 0
    };

    // Material evaluation
    state.pieces.white.forEach(piece => {
      evaluation.material += this.getPieceValue(piece);
    });
    state.pieces.black.forEach(piece => {
      evaluation.material -= this.getPieceValue(piece);
    });

    // Position evaluation
    state.pieces.white.forEach(piece => {
      evaluation.position += this.evaluatePiecePosition(piece).position;
    });
    state.pieces.black.forEach(piece => {
      evaluation.position -= this.evaluatePiecePosition(piece).position;
    });

    // Mobility evaluation
    evaluation.mobility = this.evaluateMobility(state);

    // King safety
    evaluation.kingSafety = this.evaluateKingSafety(state);

    // Center control
    evaluation.centerControl = this.evaluateCenterControl(state);

    // Calculate total score
    evaluation.total = 
      evaluation.material * 1.0 +
      evaluation.position * 0.1 +
      evaluation.mobility * 0.1 +
      evaluation.kingSafety * 0.2 +
      evaluation.centerControl * 0.1;

    return evaluation;
  }

  private getPieceValue(piece: ChessPiece): number {
    switch (piece.type) {
      case 'pawn': return 1;
      case 'knight': return 3;
      case 'bishop': return 3;
      case 'rook': return 5;
      case 'queen': return 9;
      case 'king': return 0; // King's value is handled separately
      default: return 0;
    }
  }

  private evaluatePiecePosition(piece: ChessPiece): PieceEvaluation {
    const evaluation: PieceEvaluation = {
      material: this.getPieceValue(piece),
      position: 0,
      mobility: 0,
      protection: 0,
      threats: 0
    };

    // Position evaluation based on piece type and board position
    switch (piece.type) {
      case 'pawn':
        evaluation.position = this.evaluatePawnPosition(piece);
        break;
      case 'knight':
        evaluation.position = this.evaluateKnightPosition(piece);
        break;
      case 'bishop':
        evaluation.position = this.evaluateBishopPosition(piece);
        break;
      case 'rook':
        evaluation.position = this.evaluateRookPosition(piece);
        break;
      case 'queen':
        evaluation.position = this.evaluateQueenPosition(piece);
        break;
      case 'king':
        evaluation.position = this.evaluateKingPosition(piece);
        break;
    }

    return evaluation;
  }

  private evaluatePawnPosition(piece: ChessPiece): number {
    const rank = piece.color === 'white' ? piece.position.y : 7 - piece.position.y;
    const file = piece.position.x;
    
    // Encourage pawns to advance
    let score = rank * 0.1;
    
    // Penalize doubled pawns
    if (this.gameState.getGameState().pieces
        .filter(p => p.type === 'pawn' && p.color === piece.color)
        .some(p => p.position.x === file && p.position.y !== piece.position.y)) {
      score -= 0.5;
    }
    
    // Bonus for center control
    if (file >= 2 && file <= 5) {
      score += 0.2;
    }
    
    return score;
  }

  private evaluateKnightPosition(piece: ChessPiece): number {
    const centerDistance = Math.abs(3.5 - piece.position.x) + Math.abs(3.5 - piece.position.y);
    return 0.5 - centerDistance * 0.1;
  }

  private evaluateBishopPosition(piece: ChessPiece): number {
    let score = 0;
    
    // Bonus for diagonal control
    const moves = this.gameState.getValidMoves(piece.position);
    score += moves.length * 0.1;
    
    // Penalty for blocked diagonals
    if (moves.length < 7) {
      score -= 0.3;
    }
    
    return score;
  }

  private evaluateRookPosition(piece: ChessPiece): number {
    let score = 0;
    
    // Bonus for open files
    const file = piece.position.x;
    const pawnsInFile = this.gameState.getGameState().pieces
      .filter(p => p.type === 'pawn' && p.position.x === file);
    
    if (pawnsInFile.length === 0) {
      score += 0.5; // Open file
    } else if (pawnsInFile.every(p => p.color !== piece.color)) {
      score += 0.3; // Semi-open file
    }
    
    return score;
  }

  private evaluateQueenPosition(piece: ChessPiece): number {
    const centerDistance = Math.abs(3.5 - piece.position.x) + Math.abs(3.5 - piece.position.y);
    return 0.3 - centerDistance * 0.05;
  }

  private evaluateKingPosition(piece: ChessPiece): number {
    let score = 0;
    const isEndgame = this.isEndgame();
    
    if (!isEndgame) {
      // Early game: prefer corners and edges
      if (piece.position.x === 0 || piece.position.x === 7) score += 0.3;
      if (piece.position.y === 0 || piece.position.y === 7) score += 0.3;
    } else {
      // Endgame: prefer center
      const centerDistance = Math.abs(3.5 - piece.position.x) + Math.abs(3.5 - piece.position.y);
      score += 0.5 - centerDistance * 0.1;
    }
    
    return score;
  }

  private evaluateMobility(state: GameState): number {
    let whiteMobility = 0;
    let blackMobility = 0;

    state.pieces.white.forEach(piece => {
      whiteMobility += this.gameState.getValidMoves(piece.position).length;
    });

    state.pieces.black.forEach(piece => {
      blackMobility += this.gameState.getValidMoves(piece.position).length;
    });

    return whiteMobility - blackMobility;
  }

  private evaluateKingSafety(state: GameState): number {
    let whiteKingSafety = 0;
    let blackKingSafety = 0;

    const whiteKing = state.pieces.find(p => p.type === 'king' && p.color === 'white');
    const blackKing = state.pieces.find(p => p.type === 'king' && p.color === 'black');

    if (whiteKing) {
      // Evaluate pawn shield
      const whitePawns = state.pieces.filter(p => 
        p.type === 'pawn' && 
        p.color === 'white' && 
        Math.abs(p.position.x - whiteKing.position.x) <= 1 &&
        p.position.y > whiteKing.position.y
      );
      whiteKingSafety += whitePawns.length * 0.5;

      // Penalty for open lines to king
      if (state.isCheck) whiteKingSafety -= 2;
    }

    if (blackKing) {
      // Evaluate pawn shield
      const blackPawns = state.pieces.filter(p => 
        p.type === 'pawn' && 
        p.color === 'black' && 
        Math.abs(p.position.x - blackKing.position.x) <= 1 &&
        p.position.y < blackKing.position.y
      );
      blackKingSafety += blackPawns.length * 0.5;

      // Penalty for open lines to king
      if (state.isCheck) blackKingSafety -= 2;
    }

    return whiteKingSafety - blackKingSafety;
  }

  private evaluateCenterControl(state: GameState): number {
    const centerSquares = [
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 4, y: 3 }, { x: 4, y: 4 }
    ];

    let whiteControl = 0;
    let blackControl = 0;

    centerSquares.forEach(square => {
      const piece = state.board[0][square.y][square.x];
      if (piece) {
        if (piece.color === 'white') whiteControl++;
        else blackControl++;
      }
    });

    return whiteControl - blackControl;
  }

  private isEndgame(): boolean {
    const state = this.gameState.getGameState();
    const queens = state.pieces.filter(p => p.type === 'queen');
    const minorPieces = state.pieces.filter(p => 
      p.type === 'knight' || p.type === 'bishop'
    );
    
    return queens.length === 0 || minorPieces.length <= 4;
  }

  private getAllPossibleMoves(state: GameState, color: PieceColor): Move[] {
    const moves: Move[] = [];
    state.pieces
      .filter(piece => piece.color === color)
      .forEach(piece => {
        const validPositions = this.gameState.getValidMoves(piece.position);
        validPositions.forEach(pos => {
          moves.push({
            from: piece.position,
            to: pos,
            piece,
            capturedPiece: state.board[pos.layer][pos.y][pos.x] || undefined
          });
        });
      });
    return moves;
  }

  private applyMoveToState(state: GameState, move: Move): GameState {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    
    // Update board
    newState.board[move.from.layer][move.from.y][move.from.x] = null;
    newState.board[move.to.layer][move.to.y][move.to.x] = {
      ...move.piece,
      position: move.to,
      hasMoved: true
    };

    // Update pieces array
    if (move.capturedPiece) {
      newState.pieces[move.capturedPiece.color] = newState.pieces[move.capturedPiece.color]
        .filter(p => p !== move.capturedPiece);
      newState.capturedPieces[move.capturedPiece.color].push(move.capturedPiece);
    }

    // Update current turn
    newState.currentTurn = newState.currentTurn === 'white' ? 'black' : 'white';

    return newState;
  }
} 