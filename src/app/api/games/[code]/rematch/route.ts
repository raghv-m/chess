import { NextRequest, NextResponse } from 'next/server';
import { rematchGame, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/games/[code]/rematch — create the rematch for a finished game.
 * Colours are swapped and the seat credentials carry over by token hash,
 * so both players keep using the token they already have. Returns the
 * new game's code and its state (from the caller's perspective).
 * Idempotent: concurrent calls converge on a single rematch game.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const result = await rematchGame(params.code.toUpperCase(), token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games/[code]/rematch failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
