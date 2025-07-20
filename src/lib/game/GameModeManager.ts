import type {
  GameState,
  GameResult,
  Move,
  Position,
  ChessPiece,
  PieceType,
  GameOptions,
  GameCallbacks,
  PieceColor
} from '@/types';
import { socketClient } from '../socket';
import { ChessAI } from '../ai/ChessAI';

interface PieceInitData extends ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
  id: string;
}

export class GameModeManager {
  private gameState: GameState;
  private mode: 'local' | 'ai' | 'multiplayer';
  private difficulty: 'beginner' | 'intermediate' | 'expert';
  private callbacks: GameCallbacks = {};
  private roomId: string | null = null;
  private ai: ChessAI;

  constructor() {
    this.gameState = this.createInitialGameState();
    this.mode = 'local';
    this.difficulty = 'beginner';
    this.ai = new ChessAI('intermediate');
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

    // Initialize pieces collection from the board
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[layer][y][x];
          if (piece) {
            pieces.push(piece);
          }
        }
      }
    }

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
        hasMoved: false,
        id: `wp${x}`
      };
      board[0][1][x] = whitePawn;

      const blackPawn: PieceInitData = {
        type: 'pawn',
        color: 'black',
        position: { layer: 0, y: 6, x },
        hasMoved: false,
        id: `bp${x}`
      };
      board[0][6][x] = blackPawn;
    }

    // Initialize other pieces
    const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    pieces.forEach((type, x) => {
      const whitePiece: PieceInitData = {
        type,
        color: 'white',
        position: { layer: 0, y: 0, x },
        hasMoved: false,
        id: `w${type}${x}`
      };
      board[0][0][x] = whitePiece;

      const blackPiece: PieceInitData = {
        type,
        color: 'black',
        position: { layer: 0, y: 7, x },
        hasMoved: false,
        id: `b${type}${x}`
      };
      board[0][7][x] = blackPiece;
    });
  }

  async initializeGameMode(mode: 'local' | 'ai' | 'multiplayer', options?: GameOptions): Promise<void> {
    try {
      this.mode = mode;
      if (options?.difficulty) {
        this.difficulty = options.difficulty;
      }
      this.gameState = this.createInitialGameState();

      if (mode === 'multiplayer') {
        const roomId = Math.random().toString(36).substring(7);
        const playerId = Math.random().toString(36).substring(7);
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
          },
          onGameStart: (data) => {
            console.log('Game started:', data);
            // Extract opponent info from the game start data
            const opponentId = data.players.find(id => id !== playerId);
            if (opponentId) {
              this.callbacks.onGameStart?.({ id: opponentId, username: `Player ${opponentId.slice(0, 4)}` });
            }
          },
          onPlayerJoined: (data) => {
            console.log('Player joined:', data);
          },
          onPlayerLeft: (data) => {
            console.log('Player left:', data);
          }
        }, roomId);

        socketClient.setPlayerId(playerId);
        socketClient.connect();
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
        piece: updatedPiece
      };
      this.gameState.moveHistory.push(move);

      // Switch turns
      this.gameState.currentTurn = this.gameState.currentTurn === 'white' ? 'black' : 'white';

      // Update game state
      this.updateGameState();

      // Notify callbacks
      this.callbacks.onMove?.(this.gameState);

      if (this.mode === 'multiplayer' && this.roomId) {
        socketClient.makeMove(this.roomId, move, this.gameState);
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
    try {
      // Set AI difficulty based on current difficulty setting
      this.ai.setDifficulty(this.difficulty);
      
      // Get the best move from the AI
      const aiMove = await this.ai.getNextMove(this.gameState);
      
      if (aiMove) {
        await this.makeMove(aiMove.from, aiMove.to);
      }
    } catch (error) {
      console.error('AI move error:', error);
      // Fallback to random move if AI fails
      const validMoves = this.getAllValidMoves('black');
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        await this.makeMove(randomMove.from, randomMove.to);
      }
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
    const moves: Position[] = [];
    const { x, y, layer } = piece.position;

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? 1 : -1;
        // Forward move
        if (y + direction >= 0 && y + direction < 8) {
          moves.push({ x, y: y + direction, layer });
          // Initial double move
          if (!piece.hasMoved && y + 2 * direction >= 0 && y + 2 * direction < 8) {
            moves.push({ x, y: y + 2 * direction, layer });
          }
        }
        // Captures
        for (const dx of [-1, 1]) {
          if (x + dx >= 0 && x + dx < 8 && y + direction >= 0 && y + direction < 8) {
            moves.push({ x: x + dx, y: y + direction, layer });
          }
        }
        break;

      case 'rook':
        // Horizontal and vertical moves
        for (let i = 0; i < 8; i++) {
          if (i !== x) moves.push({ x: i, y, layer });
          if (i !== y) moves.push({ x, y: i, layer });
        }
        break;

      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dx, dy] of knightMoves) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            moves.push({ x: newX, y: newY, layer });
          }
        }
        break;

      case 'bishop':
        // Diagonal moves
        for (let i = 1; i < 8; i++) {
          for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const newX = x + i * dx;
            const newY = y + i * dy;
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
              moves.push({ x: newX, y: newY, layer });
            }
          }
        }
        break;

      case 'queen':
        // Combine rook and bishop moves
        for (let i = 0; i < 8; i++) {
          if (i !== x) moves.push({ x: i, y, layer });
          if (i !== y) moves.push({ x, y: i, layer });
        }
        for (let i = 1; i < 8; i++) {
          for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const newX = x + i * dx;
            const newY = y + i * dy;
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
              moves.push({ x: newX, y: newY, layer });
            }
          }
        }
        break;

      case 'king':
        // One square in any direction
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
              moves.push({ x: newX, y: newY, layer });
            }
          }
        }
        break;
    }

    // Add layer transitions
    if (layer === 0) moves.push({ x, y, layer: 1 });
    else if (layer === 1) {
      moves.push({ x, y, layer: 0 });
      moves.push({ x, y, layer: 2 });
    }
    else if (layer === 2) moves.push({ x, y, layer: 1 });

    return moves;
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
    return validMoves.some(validMove => 
      validMove.layer === to.layer && validMove.x === to.x && validMove.y === to.y
    );
  }

  private wouldResultInCheck(piece: ChessPiece, move: Position): boolean {
    // Create a temporary copy of the game state
    const tempBoard = JSON.parse(JSON.stringify(this.gameState.board));
    const originalPos = piece.position;
    
    // Make the move on the temporary board
    this.gameState.board[piece.position.layer][piece.position.y][piece.position.x] = null;
    piece.position = move;
    this.gameState.board[move.layer][move.y][move.x] = piece;
    
    // Check if the king is in check
    const isInCheck = this.isKingInCheck(piece.color);
    
    // Restore the original state
    this.gameState.board = tempBoard;
    piece.position = originalPos;
    
    return isInCheck;
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
    // Find the king
    const king = this.gameState.pieces.find(p => p.type === 'king' && p.color === color);
    if (!king) return false;

    // Check if any opponent piece can attack the king
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.gameState.pieces.some(piece => {
      if (piece.color !== opponentColor) return false;
      const moves = this.getPossibleMoves(piece);
      return moves.some(move =>
        move.x === king.position.x &&
        move.y === king.position.y &&
        move.layer === king.position.layer
      );
    });
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