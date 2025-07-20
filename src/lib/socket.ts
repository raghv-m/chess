import { GameState, GameResult, Move } from '@/types';

interface SocketCallbacks {
  onMove: (state: GameState) => void;
  onGameEnd: (result: GameResult) => void;
  onError: (error: Error) => void;
  onActiveUsersUpdate?: (count: number) => void;
  onGameStart?: (data: { players: string[]; colors: Record<string, string> }) => void;
  onPlayerJoined?: (data: { playerId: string; color: string }) => void;
  onPlayerLeft?: (data: { playerId: string }) => void;
  onChat?: (data: { message: string; playerId: string; timestamp: number }) => void;
  onDrawOffer?: (data: { playerId: string }) => void;
  onDrawResponse?: (data: { accepted: boolean; playerId: string }) => void;
}

class SocketClient {
  private socket: WebSocket | null = null;
  private callbacks: SocketCallbacks | null = null;
  private roomId: string | null = null;
  private playerId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  setCallbacks(callbacks: SocketCallbacks, roomId: string): void {
    this.callbacks = callbacks;
    this.roomId = roomId;
  }

  setPlayerId(playerId: string): void {
    this.playerId = playerId;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Join the room if we have a roomId and playerId
      if (this.roomId && this.playerId) {
        this.joinRoom(this.roomId, this.playerId);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type, data);
        
        switch (data.type) {
          case 'gameState':
            this.callbacks?.onMove(data.state);
            break;
          case 'move':
            if (data.gameState) {
              this.callbacks?.onMove(data.gameState);
            }
            break;
          case 'gameStart':
            this.callbacks?.onGameStart?.(data);
            break;
          case 'playerJoined':
            this.callbacks?.onPlayerJoined?.(data);
            break;
          case 'playerLeft':
            this.callbacks?.onPlayerLeft?.(data);
            break;
          case 'gameEnd':
            this.callbacks?.onGameEnd(data);
            break;
          case 'chat':
            this.callbacks?.onChat?.(data);
            break;
          case 'drawOffer':
            this.callbacks?.onDrawOffer?.(data);
            break;
          case 'drawResponse':
            this.callbacks?.onDrawResponse?.(data);
            break;
          case 'error':
            this.callbacks?.onError(new Error(data.message));
            break;
          case 'activeUsers':
            this.callbacks?.onActiveUsersUpdate?.(data.count);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        this.callbacks?.onError(new Error('Failed to process WebSocket message'));
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.callbacks?.onError(new Error('Connection error'));
    };

    this.socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      
      // Attempt to reconnect if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      } else {
        console.log('Max reconnection attempts reached');
        this.callbacks?.onError(new Error('Connection lost and reconnection failed'));
      }
    };
  }

  joinRoom(roomId: string, playerId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.roomId = roomId;
      this.playerId = playerId;
      
      this.socket.send(JSON.stringify({
        type: 'joinGame',
        gameId: roomId,
        playerId: playerId
      }));
    }
  }

  makeMove(roomId: string, move: Move, gameState?: GameState): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: any = {
        type: 'move',
        gameId: roomId,
        move
      };
      
      if (gameState) {
        message.gameState = gameState;
      }
      
      this.socket.send(JSON.stringify(message));
    }
  }

  sendChat(roomId: string, message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'chat',
        gameId: roomId,
        message
      }));
    }
  }

  resign(roomId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'resign',
        gameId: roomId
      }));
    }
  }

  offerDraw(roomId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'drawOffer',
        gameId: roomId
      }));
    }
  }

  respondToDraw(roomId: string, accepted: boolean): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'drawResponse',
        gameId: roomId,
        accepted
      }));
    }
  }

  requestActiveUsers(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'requestActiveUsers'
      }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const socketClient = new SocketClient(); 