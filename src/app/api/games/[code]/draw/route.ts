import { NextRequest, NextResponse } from 'next/server';
import { drawAction, GameError, type DrawAction } from '@/lib/server/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ACTIONS: readonly string[] = ['offer', 'accept', 'decline', 'withdraw'];

/**
 * POST /api/games/[code]/draw — draw negotiation.
 * Body: { action: 'offer' | 'accept' | 'decline' | 'withdraw' }
 * An offer is recorded on the game row; only the opponent may accept or
 * decline it, and any played move clears it.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = req.headers.get('x-player-token');
    const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
    if (!body || typeof body.action !== 'string' || !ACTIONS.includes(body.action)) {
      return NextResponse.json(
        { error: "Body must be { action: 'offer' | 'accept' | 'decline' | 'withdraw' }." },
        { status: 400 }
      );
    }

    const state = await drawAction(
      params.code.toUpperCase(),
      token,
      body.action as DrawAction
    );
    return NextResponse.json({ state });
  } catch (err) {
    if (err instanceof GameError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('POST /api/games/[code]/draw failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
