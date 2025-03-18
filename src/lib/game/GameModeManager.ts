import { GameState, GameResult, Move, Position, ChessPiece, PieceType, GameOptions, GameCallbacks, PieceColor } from '@/types';
import { socketClient } from '../socket';

interface PieceInitData {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export class GameModeManager {
  private gameState: GameState;
  private mode: 'local' | 'ai' | 'multiplayer';
  private difficulty: string;
  private callbacks: GameCallbacks = {};
  private roomId: string | null = null;

  constructor() {
    this.gameState = this.createInitialGameState();
    this.mode = 'local';
    this.difficulty = 'beginner';
  }

  private createInitialGameState(): GameState {
    // Initialize an 8x8x3 board
    const board = Array(3).fill(null).map(() =>
      Array(8).fill(null).map(() =>
        Array(8).fill(null)
      )
    );

    // Initialize pieces
    this.initializePieces(board);

    const whitePieces: ChessPiece[] = [];
    const blackPieces: ChessPiece[] = [];
    const pieces = {
      white: whitePieces,
      black: blackPieces,
      find: (predicate: (piece: ChessPiece) => boolean) => [...whitePieces, ...blackPieces].find(predicate),
      filter: (predicate: (piece: ChessPiece) => boolean) => [...whitePieces, ...blackPieces].filter(predicate),
      some: (predicate: (piece: ChessPiece) => boolean) => [...whitePieces, ...blackPieces].some(predicate),
      flatMap: <T>(callback: (piece: ChessPiece) => T[]) => [...whitePieces, ...blackPieces].flatMap(callback),
      push: (piece: ChessPiece) => {
        if (piece.color === 'white') {
          whitePieces.push(piece);
        } else {
          blackPieces.push(piece);
        }
      }
    };

    return {
      board,
      currentTurn: 'white',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      capturedPieces: { white: [], black: [] },
      moveHistory: [],
      moves: [],
      pieces
    };
  }

  private initializePieces(board: (ChessPiece | null)[][][]): void {
    // Initialize pawns
    for (let x = 0; x < 8; x++) {
      const whitePawn: PieceInitData = {
        type: 'pawn',
        color: 'white',
        position: { layer: 0, y: 1, x },
        hasMoved: false
      };
      board[0][1][x] = { ...whitePawn, id: `wp${x}` };

      const blackPawn: PieceInitData = {
        type: 'pawn',
        color: 'black',
        position: { layer: 0, y: 6, x },
        hasMoved: false
      };
      board[0][6][x] = { ...blackPawn, id: `bp${x}` };
    }

    // Initialize other pieces
    const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    pieces.forEach((type, x) => {
      const whitePiece: PieceInitData = {
        type,
        color: 'white',
        position: { layer: 0, y: 0, x },
        hasMoved: false
      };
      board[0][0][x] = { ...whitePiece, id: `w${type}${x}` };

      const blackPiece: PieceInitData = {
        type,
        color: 'black',
        position: { layer: 0, y: 7, x },
        hasMoved: false
      };
      board[0][7][x] = { ...blackPiece, id: `b${type}${x}` };
    });
  }

  async initializeGameMode(mode: 'local' | 'ai' | 'multiplayer', options?: GameOptions): Promise<void> {
    try {
      this.mode = mode;
      this.difficulty = options?.difficulty || 'beginner';
      this.gameState = this.createInitialGameState();

      if (mode === 'multiplayer') {
        const roomId = Math.random().toString(36).substring(7);
        this.roomId = roomId;
        
        socketClient.setCallbacks({
          onMove: (state: GameState) => {
            this.gameState = state;
            this.callbacks.onMove?.(this.gameState);
          },
          onGameEnd: (result: GameResult) => {
            this.callbacks.onGameEnd?.(result);
          },
          onError: (error: Error) => {
            this.callbacks.onError?.(error);
          }
        }, roomId);

        socketClient.connect();
        socketClient.joinRoom(roomId);
      }

      this.callbacks.onMove?.(this.gameState);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize game mode';
      this.handleError(new Error(errorMessage));
    }
  }

  setCallbacks(callbacks: GameCallbacks): void {
    this.callbacks = callbacks;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  async makeMove(from: Position, to: Position): Promise<boolean> {
    try {
      if (!this.isValidMove(from, to)) {
        this.handleError(new Error('Invalid move'));
        return false;
      }

      // Make the move
      const piece = this.gameState.board[from.layer][from.y][from.x];
      if (!piece) return false;

      // Check for captured piece
      const capturedPiece = this.gameState.board[to.layer][to.y][to.x];
      if (capturedPiece) {
        this.gameState.capturedPieces[capturedPiece.color].push(capturedPiece);
      }

      // Update board
      const updatedPiece = {
        ...piece,
        position: to,
        hasMoved: true
      };
      this.gameState.board[to.layer][to.y][to.x] = updatedPiece;
      this.gameState.board[from.layer][from.y][from.x] = null;

      // Add move to history
      const move: Move = {
        from,
        to,
        piece: updatedPiece,
        captured: capturedPiece
      };
      this.gameState.moveHistory.push(move);

      // Switch turns
      this.gameState.currentTurn = this.gameState.currentTurn === 'white' ? 'black' : 'white';

      // Update game state
      this.updateGameState();

      // Notify callbacks
      this.callbacks.onMove?.(this.gameState);

      if (this.mode === 'multiplayer' && this.roomId) {
        socketClient.makeMove(this.roomId, move);
      } else if (this.mode === 'ai' && this.gameState.currentTurn === 'black') {
        // AI's turn
        setTimeout(() => this.makeAIMove(), 500);
      }

      return true;
    } catch (error) {
      this.handleError(new Error('Failed to make move'));
      return false;
    }
  }

  private async makeAIMove(): Promise<void> {
    // Simple AI implementation - random valid move
    const validMoves = this.getAllValidMoves('black');
    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      await this.makeMove(randomMove.from, randomMove.to);
    }
  }

  getValidMoves(position: Position): Position[] {
    const currentPiece = this.gameState.board[position.layer][position.y][position.x];
    if (!currentPiece) return [];

    // Get all possible moves based on piece type
    const possibleMoves = this.getPossibleMoves(currentPiece);

    // Filter out moves that would put or leave the king in check
    return possibleMoves.filter(move => !this.wouldResultInCheck(currentPiece, move));
  }

  private getPossibleMoves(piece: ChessPiece): Position[] {
    // Implementation of chess rules for each piece type
    // This is a placeholder - implement actual chess rules here
    return [];
  }

  private getAllValidMoves(color: PieceColor): { from: Position; to: Position }[] {
    const moves: { from: Position; to: Position }[] = [];
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const currentPiece = this.gameState.board[layer][y][x];
          if (currentPiece && currentPiece.color === color) {
            const validMoves = this.getValidMoves({ layer, y, x });
            validMoves.forEach(to => {
              moves.push({ from: { layer, y, x }, to });
            });
          }
        }
      }
    }
    return moves;
  }

  private isValidMove(from: Position, to: Position): boolean {
    const currentPiece = this.gameState.board[from.layer][from.y][from.x];
    if (!currentPiece || currentPiece.color !== this.gameState.currentTurn) return false;

    const validMoves = this.getValidMoves(from);
    return validMoves.some(move => 
      move.layer === to.layer && move.x === to.x && move.y === to.y
    );
  }

  private wouldResultInCheck(piece: ChessPiece, move: Position): boolean {
    // Implementation of check detection
    // This is a placeholder - implement actual check detection here
    return false;
  }

  private updateGameState(): void {
    const currentColor = this.gameState.currentTurn;
    const opponentColor = currentColor === 'white' ? 'black' : 'white';

    // Check if opponent's king is in check
    this.gameState.isCheck = this.isKingInCheck(opponentColor);

    // Check if opponent has any valid moves
    const hasValidMoves = this.getAllValidMoves(opponentColor).length > 0;

    if (!hasValidMoves) {
      if (this.gameState.isCheck) {
        // Checkmate
        this.gameState.isCheckmate = true;
        this.callbacks.onGameEnd?.({
          winner: currentColor,
          reason: 'checkmate'
        });
      } else {
        // Stalemate
        this.gameState.isStalemate = true;
        this.callbacks.onGameEnd?.({
          winner: undefined,
          reason: 'stalemate'
        });
      }
    }
  }

  private isKingInCheck(color: PieceColor): boolean {
    // Implementation of check detection
    // This is a placeholder - implement actual check detection here
    return false;
  }

  private handleError(error: Error): void {
    this.callbacks.onError?.(error);
  }

  cleanup(): void {
    if (this.mode === 'multiplayer') {
      socketClient.disconnect();
    }
  }
} 