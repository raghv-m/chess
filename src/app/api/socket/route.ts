import { NextResponse } from 'next/server';
import { Server, Socket } from 'socket.io';

interface MoveData {
  roomId: string;
  move: {
    from: { x: number; y: number; layer: number };
    to: { x: number; y: number; layer: number };
    piece: { id: string; type: string; color: string };
  };
}

const io = new Server({
  path: '/api/socket',
  addTrailingSlash: false,
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected');

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Client joined room: ${roomId}`);
  });

  socket.on('make-move', (data: MoveData) => {
    const { roomId, move } = data;
    socket.to(roomId).emit('game-state-update', move);
    console.log(`Move made in room ${roomId}:`, move);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export async function GET() {
  if (!io) {
    return NextResponse.json({ error: 'Socket server not initialized' }, { status: 500 });
  }
  return NextResponse.json({ status: 'Socket server is running' });
} 