import { ChessEngine } from '../chess/engine';
import { MultiplayerGameManager } from '../multiplayer/GameManager';
import { ChessAI } from '../ai/ChessAI';
import { Move, GameState, Position, ChatMessage, ChessPiece, PieceColor, PieceType } from '@/types';
import { User } from '../auth/types';
import { InMemoryDatabaseService } from '../auth/DatabaseService';

type GameMode = 'local' | 'ai' | 'multiplayer';

interface GameModeOptions {
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  serverUrl?: string;
  user?: User;
}

interface GameCallbacks {
  onGameStart?: (opponent: User) => void;
  onMove?: (move: Move) => void;
  onGameEnd?: (result: { winner?: User; reason: string }) => void;
  onError?: (error: string) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

export class GameModeManager {
  private readonly NUM_LAYERS = 1;
  private readonly BOARD_SIZE = 8;
  private gameState: GameState;
  private engine: ChessEngine;
  private multiplayerManager?: MultiplayerGameManager;
  private ai?: ChessAI;
  private gameMode: GameMode = 'local';
  private currentUser?: User;
  private callbacks: GameCallbacks = {};
  private isHandlingOpponentMove: boolean = false;
  private playerColor?: PieceColor;
  private aiDifficulty?: 'beginner' | 'intermediate' | 'expert';
  private currentPlayer: PieceColor = 'white';
  private ws?: WebSocket;
  private db: InMemoryDatabaseService;

  constructor() {
    this.engine = new ChessEngine();
    this.gameState = this.createInitialState();
    this.db = new InMemoryDatabaseService();
  }

  private createInitialState(): GameState {
    const board = Array(this.NUM_LAYERS).fill(null).map(() => 
      Array(this.BOARD_SIZE).fill(null).map(() => 
        Array(this.BOARD_SIZE).fill(null)
      )
    );

    const whitePieces: ChessPiece[] = [];
    const blackPieces: ChessPiece[] = [];
    const allPieces = () => [...whitePieces, ...blackPieces];

    return {
      board,
      currentTurn: 'white',
      isCheckmate: false,
      isStalemate: false,
      isCheck: false,
      moves: [],
      pieces: {
        white: whitePieces,
        black: blackPieces,
        find: (predicate: (p: ChessPiece) => boolean) => allPieces().find(predicate),
        filter: (predicate: (p: ChessPiece) => boolean) => allPieces().filter(predicate),
        some: (predicate: (p: ChessPiece) => boolean) => allPieces().some(predicate),
        flatMap: <T>(callback: (p: ChessPiece) => T[]) => allPieces().flatMap(callback),
        push: (piece: ChessPiece) => {
          if (piece.color === 'white') {
            whitePieces.push(piece);
          } else {
            blackPieces.push(piece);
          }
        }
      },
      capturedPieces: {
        white: [],
        black: []
      }
    };
  }

  public initializeGameMode(mode: GameMode, options: GameModeOptions = {}): void {
    this.gameMode = mode;
    this.currentUser = options.user;

    switch (mode) {
      case 'local':
        this.playerColor = 'white';
        break;
      case 'ai':
        this.playerColor = 'white';
        this.aiDifficulty = options.difficulty || 'beginner';
        this.ai = new ChessAI(this.aiDifficulty);
        break;
      case 'multiplayer':
        if (!options.user || !options.serverUrl) {
          throw new Error('User and server URL are required for multiplayer mode');
        }
        this.multiplayerManager = new MultiplayerGameManager(
          options.user,
          options.serverUrl,
          this.db
        );
        this.setupMultiplayerCallbacks();
        break;
    }

    this.gameState = this.createInitialState();
  }

  private setupMultiplayerCallbacks(): void {
    if (!this.multiplayerManager) return;

    this.multiplayerManager.setCallbacks({
      onGameStart: (opponent, color) => {
        this.callbacks.onGameStart?.(opponent);
        this.playerColor = color;
      },
      onMove: (move) => {
        if (!this.isHandlingOpponentMove) {
          this.isHandlingOpponentMove = true;
          this.engine.makeMove(move.from, move.to);
          this.callbacks.onMove?.(move);
          this.isHandlingOpponentMove = false;
        }
      },
      onGameEnd: (result) => {
        this.callbacks.onGameEnd?.(result);
      },
      onError: (error) => {
        this.callbacks.onError?.(error);
      },
      onChatMessage: (message) => {
        this.callbacks.onChatMessage?.(message);
      }
    });
  }

  private isValidMove(from: Position, to: Position): boolean {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.currentPlayer) return false;

    // Check if move is within board bounds
    if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7) return false;

    // Check if destination has a piece of the same color
    const targetPiece = this.getPieceAt(to);
    if (targetPiece && targetPiece.color === piece.color) return false;

    // Path checking helper
    const isPathClear = (dx: number, dy: number): boolean => {
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
      const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

      for (let i = 1; i < steps; i++) {
        const x = from.x + stepX * i;
        const y = from.y + stepY * i;
        if (this.getPieceAt({ x, y, z: from.z })) return false;
      }
      return true;
    };

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRank = piece.color === 'white' ? 6 : 1;
        
        // Basic forward move
        if (dx === 0 && dy === direction && !targetPiece) {
          return true;
        }
        
        // Initial two-square move
        if (dx === 0 && from.y === startRank && dy === 2 * direction) {
          return !targetPiece && isPathClear(0, direction * 2);
        }
        
        // Capture moves
        if (absDx === 1 && dy === direction) {
          // Regular capture
          if (targetPiece && targetPiece.color !== piece.color) {
            return true;
          }
          
          // En passant
          const lastMove = this.gameState.lastMove;
          if (lastMove && lastMove.piece.type === 'pawn' &&
              Math.abs(lastMove.to.y - lastMove.from.y) === 2 &&
              lastMove.to.x === to.x &&
              lastMove.to.y === from.y) {
            return true;
          }
        }
        return false;
      }

      case 'knight':
        return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);

      case 'bishop':
        return absDx === absDy && isPathClear(dx, dy);

      case 'rook':
        return (dx === 0 || dy === 0) && isPathClear(dx, dy);

      case 'queen':
        return (dx === 0 || dy === 0 || absDx === absDy) && isPathClear(dx, dy);

      case 'king': {
        // Normal moves
        if (absDx <= 1 && absDy <= 1) return true;

        // Castling
        if (!piece.hasMoved && dy === 0 && absDx === 2) {
          const rookX = dx > 0 ? 7 : 0;
          const rook = this.getPieceAt({ x: rookX, y: from.y, z: from.z });
          if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;

          // Check if path is clear
          return isPathClear(dx, 0) && !this.isKingInCheck(piece.color);
        }
        return false;
      }

      default:
        return false;
    }
  }

  private isKingInCheck(color: PieceColor): boolean {
    // Find king position
    let kingPos: Position | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPieceAt({ x, y, z: 0 });
        if (piece?.type === 'king' && piece.color === color) {
          kingPos = { x, y, z: 0 };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;

    // Check if any opponent piece can capture the king
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPieceAt({ x, y, z: 0 });
        if (piece?.color === opponentColor) {
          if (this.isValidMove({ x, y, z: 0 }, kingPos)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private getPieceAt(pos: Position): ChessPiece | null {
    return this.gameState.board[pos.z][pos.y][pos.x];
  }

  private makeAIMove() {
    // Simple AI that makes random valid moves
    const pieces: Position[] = [];
    const moves: Position[] = [];

    // Find all pieces that can move
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPieceAt({ x, y, z: 0 });
        if (piece && piece.color === 'black') {
          // Find all valid moves for this piece
          for (let ty = 0; ty < 8; ty++) {
            for (let tx = 0; tx < 8; tx++) {
              if (this.isValidMove({ x, y, z: 0 }, { x: tx, y: ty, z: 0 })) {
                pieces.push({ x, y, z: 0 });
                moves.push({ x: tx, y: ty, z: 0 });
              }
            }
          }
        }
      }
    }

    // Make a random move
    if (pieces.length > 0) {
      const index = Math.floor(Math.random() * pieces.length);
      this.makeMove(pieces[index], moves[index]);
    }
  }

  public async makeMove(from: Position, to: Position): Promise<boolean> {
    if (this.isHandlingOpponentMove) return false;

    if (!this.isValidMove(from, to)) return false;

    const piece = this.getPieceAt(from);
    if (!piece) return false;

    const capturedPiece = this.getPieceAt(to);
    const move: Move = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined,
      isCheck: false,
      isCheckmate: false,
      isCastling: piece.type === 'king' && Math.abs(to.x - from.x) === 2,
      isEnPassant: piece.type === 'pawn' && Math.abs(from.x - to.x) === 1 && !capturedPiece
    };

    // Handle special moves
    if (move.isCastling) {
      const rookX = to.x > from.x ? 7 : 0;
      const newRookX = to.x > from.x ? to.x - 1 : to.x + 1;
      const rook = this.getPieceAt({ x: rookX, y: from.y, z: from.z });
      if (rook) {
        this.gameState.board[from.z][from.y][rookX] = null as unknown as ChessPiece;
        this.gameState.board[from.z][from.y][newRookX] = {
          ...rook,
          position: { x: newRookX, y: from.y, z: from.z },
          hasMoved: true
        };
      }
    }

    // Make the move
    this.gameState.board[from.z][from.y][from.x] = null as unknown as ChessPiece;
    this.gameState.board[to.z][to.y][to.x] = {
      ...piece,
      position: to,
      hasMoved: true
    };

    // Update game state
    this.gameState.lastMove = move;
    this.gameState.currentTurn = this.gameState.currentTurn === 'white' ? 'black' : 'white';
    this.gameState.moves.push(move);

    // Check for check/checkmate
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    this.gameState.isCheck = this.isKingInCheck(opponentColor);
    move.isCheck = this.gameState.isCheck;

    // Handle move based on game mode
    switch (this.gameMode) {
      case 'multiplayer':
        if (this.multiplayerManager) {
          return this.multiplayerManager.makeMove(from, to);
        }
        break;

      case 'ai':
        if (this.ai) {
          this.callbacks.onMove?.(move);
          const aiMove = await this.ai.getNextMove(this.gameState);
          if (aiMove) {
            return this.makeMove(aiMove.from, aiMove.to);
          }
        }
        break;

      case 'local':
        this.callbacks.onMove?.(move);
        return true;
    }

    return false;
  }

  public sendChatMessage(message: string): void {
    if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
      this.multiplayerManager.sendChatMessage(message);
    } else if (this.gameMode === 'ai') {
      // AI responses
      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        userId: 'ai',
        username: 'AI',
        message: this.getAIResponse(message),
        timestamp: Date.now(),
        isAI: true
      };
      this.callbacks.onChatMessage?.(aiResponse);
    } else if (this.ws) {
      this.ws.send(JSON.stringify({ type: 'chat', message }));
    }
  }

  private getAIResponse(message: string): string {
    const state = this.engine.getGameState();
    
    // Check for common player messages
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('good game') || lowerMessage.includes('gg')) {
      return "Thanks for the game! It was a pleasure playing with you.";
    }
    if (lowerMessage.includes('draw')) {
      return "I'll consider your draw offer based on the current position.";
    }
    
    // Game state based responses
    if (state.isCheckmate) {
      return "Good game! Would you like to play again?";
    } else if (state.isCheck) {
      return "Check! Be careful with your next move.";
    } else {
      return "I'm analyzing the position and thinking about my next move...";
    }
  }

  public resign(): void {
    if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
      this.multiplayerManager.resign();
    } else if (this.gameMode === 'ai') {
      this.callbacks.onGameEnd?.({
        winner: {
          id: 'ai',
          username: 'AI',
          email: ''
        },
        reason: 'resignation'
      });
    }
  }

  public offerDraw(): void {
    if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
      this.multiplayerManager.offerDraw();
    } else if (this.gameMode === 'ai') {
      // AI always accepts draw offers
      this.callbacks.onGameEnd?.({
        winner: undefined,
        reason: 'draw'
      });
    } else if (this.ws) {
      this.ws.send(JSON.stringify({ type: 'drawOffer' }));
    }
  }

  public setCallbacks(callbacks: GameCallbacks): void {
    this.callbacks = callbacks;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public cleanup(): void {
    if (this.multiplayerManager) {
      this.multiplayerManager.cleanup();
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  private setupWebSocket(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'gameStart':
          this.callbacks.onGameStart?.(data.opponent);
          break;
        case 'move':
          this.makeMove(data.from, data.to);
          break;
        case 'chat':
          this.callbacks.onChatMessage?.(data.message);
          break;
        case 'error':
          this.callbacks.onError?.(data.message);
          break;
      }
    };

    this.ws.onclose = () => {
      this.callbacks.onError?.('Connection closed');
    };

    this.ws.onerror = () => {
      this.callbacks.onError?.('WebSocket error occurred');
    };
  }

  private createPiece(type: PieceType, color: PieceColor, x: number, y: number): ChessPiece {
    return {
      type,
      color,
      position: { x, y, z: 0 },
      hasMoved: false,
      id: `${color}-${type}-${x}-${y}`
    };
  }

  private isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.BOARD_SIZE &&
      position.y >= 0 &&
      position.y < this.BOARD_SIZE &&
      position.z >= 0 &&
      position.z < this.NUM_LAYERS
    );
  }

  private getValidMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { x, y, z } = piece.position;

    // Add valid moves based on piece type
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? 1 : -1;
        const startRank = piece.color === 'white' ? 1 : 6;

        // Forward move
        if (this.isValidPosition({ x, y: y + direction, z })) {
          moves.push({ x, y: y + direction, z });
        }

        // Initial two-square move
        if (y === startRank && this.isValidPosition({ x, y: y + 2 * direction, z })) {
          moves.push({ x, y: y + 2 * direction, z });
        }

        // Diagonal captures
        [-1, 1].forEach(dx => {
          const newPos = { x: x + dx, y: y + direction, z };
          if (this.isValidPosition(newPos)) {
            moves.push(newPos);
          }
        });
        break;

      // Add other piece move logic here...
    }

    return moves;
  }
} 