import { NextResponse } from 'next/server';
import { createGame, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/games — create a new game.
 * Returns the room code, the white seat token (shown to the creator once;
 * their browser stores it in localStorage), and the initial public state.
 */
export async function POST() {
  try {
    const result = await createGame();
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
