import { NextRequest, NextResponse } from 'next/server';
import { resignGame, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/games/[code]/resign — resign the game.
 * In an active game the opponent wins. In a waiting game (only the
 * creator is seated) the game is marked abandoned. Idempotent once the
 * game is finished.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const state = await resignGame(params.code.toUpperCase(), token);
    return NextResponse.json({ state });
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games/[code]/resign failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
