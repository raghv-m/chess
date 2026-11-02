import { NextRequest, NextResponse } from 'next/server';
import { joinGame, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/games/[code]/join — claim the black seat of a waiting game.
 * Returns the black seat token (first claim only). If the caller already
 * owns a seat (token header matches), returns that seat with token: null.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const result = await joinGame(params.code.toUpperCase(), token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games/[code]/join failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
