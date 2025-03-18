import { io, Socket } from 'socket.io-client';
import { ChessEngine } from '../chess/engine';
import { Move, GameState, Position, ChatMessage } from '@/types/index';
import { User, DatabaseService } from '../auth/types';

interface GameCallbacks {
  onGameStart?: (opponent: User, color: 'white' | 'black') => void;
  onMove?: (move: Move) => void;
  onGameEnd?: (result: { winner?: User; reason: string }) => void;
  onError?: (error: string) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onDrawOffer?: (fromUser: User) => void;
}

export class MultiplayerGameManager {
  private socket: Socket;
  private engine: ChessEngine;
  private callbacks: GameCallbacks = {};
  private gameId?: string;
  private opponent?: User;
  private playerColor?: 'white' | 'black';

  constructor(
    private currentUser: User,
    private serverUrl: string,
    private db: DatabaseService
  ) {
    this.engine = new ChessEngine();
    this.socket = io(serverUrl);
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.socket.emit('auth', { userId: this.currentUser.id });
    });

    this.socket.on('game_start', (data: { gameId: string; opponent: User; color: 'white' | 'black' }) => {
      this.gameId = data.gameId;
      this.opponent = data.opponent;
      this.playerColor = data.color;
      this.callbacks.onGameStart?.(data.opponent, data.color);
    });

    this.socket.on('opponent_move', (data: { move: Move; gameState: GameState }) => {
      // Get pieces before making the move
      const piece = this.engine.getPieceAt(data.move.from);
      if (!piece) {
        this.callbacks.onError?.('Invalid move: no piece at source position');
        return;
      }

      // Get captured piece and handle null/undefined conversion
      const capturedPiece = this.engine.getPieceAt(data.move.to);
      const captured = capturedPiece ?? undefined;

      if (this.engine.makeMove(data.move.from, data.move.to)) {
        const move: Move = {
          from: data.move.from,
          to: data.move.to,
          piece,
          captured
        };
        this.callbacks.onMove?.(move);
      } else {
        this.callbacks.onError?.('Invalid move received');
      }
    });

    this.socket.on('chat_message', (message: ChatMessage) => {
      this.callbacks.onChatMessage?.(message);
    });

    this.socket.on('draw_offer', (fromUser: User) => {
      this.callbacks.onDrawOffer?.(fromUser);
    });

    this.socket.on('game_end', (result: { winner?: User; reason: string }) => {
      this.callbacks.onGameEnd?.(result);
      this.updatePlayerStats(result);
    });

    this.socket.on('error', (error: string) => {
      this.callbacks.onError?.(error);
    });
  }

  public async makeMove(from: Position, to: Position): Promise<boolean> {
    if (!this.gameId || !this.playerColor) {
      this.callbacks.onError?.('No active game');
      return false;
    }

    if (this.engine.getGameState().currentTurn !== this.playerColor) {
      this.callbacks.onError?.('Not your turn');
      return false;
    }

    // Get pieces before making the move
    const piece = this.engine.getPieceAt(from);
    if (!piece) {
      this.callbacks.onError?.('No piece at source position');
      return false;
    }

    // Get captured piece and handle null/undefined conversion
    const capturedPiece = this.engine.getPieceAt(to);
    const captured = capturedPiece ?? undefined;

    if (this.engine.makeMove(from, to)) {
      const move: Move = {
        from,
        to,
        piece,
        captured
      };

      this.socket.emit('move', {
        gameId: this.gameId,
        move,
        newState: this.engine.getGameState()
      });

      return true;
    }

    return false;
  }

  public sendChatMessage(message: string): void {
    if (!this.gameId) {
      this.callbacks.onError?.('No active game');
      return;
    }

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      message,
      timestamp: Date.now(),
      sender: '',
      content: ''
    };

    this.socket.emit('chat', {
      gameId: this.gameId,
      message: chatMessage
    });
  }

  public resign(): void {
    if (!this.gameId) {
      this.callbacks.onError?.('No active game');
      return;
    }

    this.socket.emit('resign', { gameId: this.gameId });
  }

  public offerDraw(): void {
    if (!this.gameId) {
      this.callbacks.onError?.('No active game');
      return;
    }

    this.socket.emit('draw_offer', { gameId: this.gameId });
  }

  public acceptDraw(): void {
    if (!this.gameId) {
      this.callbacks.onError?.('No active game');
      return;
    }

    this.socket.emit('accept_draw', { gameId: this.gameId });
  }

  public rejectDraw(): void {
    if (!this.gameId) {
      this.callbacks.onError?.('No active game');
      return;
    }

    this.socket.emit('reject_draw', { gameId: this.gameId });
  }

  public setCallbacks(callbacks: GameCallbacks): void {
    this.callbacks = callbacks;
  }

  private async updatePlayerStats(result: { winner?: User; reason: string }): Promise<void> {
    const stats = await this.db.getUserStats(this.currentUser.id);
    
    if (result.winner) {
      if (result.winner.id === this.currentUser.id) {
        stats.wins++;
        stats.winStreak++;
        stats.rating += 20;
      } else {
        stats.losses++;
        stats.winStreak = 0;
        stats.rating = Math.max(0, stats.rating - 15);
      }
    } else {
      stats.draws++;
      stats.winStreak = 0;
      stats.rating += 5;
    }
    
    stats.gamesPlayed++;
    await this.db.updateUserStats(this.currentUser.id, stats);
  }

  public cleanup(): void {
    this.socket.disconnect();
  }

  public getGameState(): GameState {
    return this.engine.getGameState();
  }

  public getCurrentPlayer(): 'white' | 'black' | undefined {
    return this.playerColor;
  }

  public getOpponent(): User | undefined {
    return this.opponent;
  }
} 