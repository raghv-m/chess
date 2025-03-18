import { io, Socket } from 'socket.io-client';
import { GameState, Move, GameCallbacks } from '@/types';

class SocketClient {
  private socket: Socket | null = null;
  private callbacks: GameCallbacks = {};

  connect() {
    if (this.socket) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('gameStateUpdate', (state: GameState) => {
      this.callbacks.onGameStateUpdate?.(state);
    });

    this.socket.on('gameEnd', () => {
      this.callbacks.onGameEnd?.();
    });

    this.socket.on('error', (error: Error) => {
      this.callbacks.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setCallbacks(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  joinRoom(roomId: string) {
    if (!this.socket) return;
    this.socket.emit('joinRoom', roomId);
  }

  makeMove(roomId: string, move: Move) {
    if (!this.socket) return;
    this.socket.emit('makeMove', { roomId, move });
  }

  sendChatMessage(roomId: string, message: string) {
    if (!this.socket) return;
    this.socket.emit('chatMessage', { roomId, message });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketClient = new SocketClient(); 