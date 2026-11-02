import { NextRequest, NextResponse } from 'next/server';
import { getGame, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/games/[code] — public game state.
 * Send the seat token in the `x-player-token` header to have `yourSeat`
 * resolved; without one you get the read-only spectator view.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const state = await getGame(params.code.toUpperCase(), token);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('GET /api/games/[code] failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
