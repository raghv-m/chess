import OnlineChessGame from '@/components/OnlineChessGame';

/**
 * /game/<code> — a shared online game.
 *
 * Anyone with the link can view the game; the two seat holders (whose
 * browsers stored a seat token when they created/joined) can play.
 * All game data is fetched client-side from /api/games/<code>.
 */
export default function OnlineGamePage({ params }: { params: { code: string } }) {
  return <OnlineChessGame code={params.code.toUpperCase()} />;
}
