import { GameState, GameResult, Move } from '@/types';

interface SocketCallbacks {
  onMove: (state: GameState) => void;
  onGameEnd: (result: GameResult) => void;
  onError: (error: Error) => void;
  onActiveUsersUpdate?: (count: number) => void;
}

class SocketClient {
  private socket: WebSocket | null = null;
  private callbacks: SocketCallbacks | null = null;
  private roomId: string | null = null;
  private activeUsersCallback: ((users: string[]) => void) | null = null;

  setCallbacks(callbacks: SocketCallbacks, roomId: string): void {
    this.callbacks = callbacks;
    this.roomId = roomId;
  }

  setActiveUsersCallback(callback: (users: string[]) => void): void {
    this.activeUsersCallback = callback;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'gameState':
            this.callbacks?.onMove(data.state);
            break;
          case 'gameEnd':
            this.callbacks?.onGameEnd(data.result);
            break;
          case 'error':
            this.callbacks?.onError(new Error(data.message));
            break;
          case 'activeUsers':
            this.callbacks?.onActiveUsersUpdate?.(data.count);
            break;
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
      setTimeout(() => this.connect(), 5000); // Attempt to reconnect after 5 seconds
    };
  }

  joinRoom(roomId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'joinRoom',
        roomId
      }));
    }
  }

  makeMove(roomId: string, move: Move): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'move',
        roomId,
        move
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
  }
}

export const socketClient = new SocketClient(); 