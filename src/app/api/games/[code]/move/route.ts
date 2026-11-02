import { NextRequest, NextResponse } from 'next/server';
import { makeMove, GameError } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/games/[code]/move — play a move.
 * Body: { from: Position, to: Position, promotion?: 'queen'|'rook'|'bishop'|'knight' }
 * (`promotionPiece` is accepted as an alias for `promotion`.)
 * The seat token (x-player-token header) must own the side to move, and
 * the server-side ChessEngine must accept the move — anything else is
 * rejected and nothing is written.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const body = (await req.json().catch(() => null)) as
      | { from?: unknown; to?: unknown; promotion?: unknown; promotionPiece?: unknown }
      | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const state = await makeMove(
      params.code.toUpperCase(),
      token,
      body.from,
      body.to,
      body.promotion ?? body.promotionPiece
    );
    return NextResponse.json({ state });
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games/[code]/move failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
