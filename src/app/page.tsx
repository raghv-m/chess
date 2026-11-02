import Link from 'next/link';

const modes = [
  {
    name: 'Play the computer',
    note: 'Three difficulty levels, from first moves to serious calculation.',
    href: '/game?mode=singleplayer&difficulty=beginner',
  },
  {
    name: 'Play a friend online',
    note: 'Create a room, share the code, and start the same minute.',
    href: '/game?mode=multiplayer',
  },
  {
    name: 'Learn the moves',
    note: 'Short lessons on how each piece moves across the three layers.',
    href: '/tutorials',
  },
];

// Starting rank for a single-layer diagram of the board. Lowercase is black.
const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
const glyph: Record<string, string> = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-[var(--font-display)] text-xl tracking-tight">
          3D Chess
        </Link>
        <nav className="flex items-center gap-6 text-sm text-bone/70">
          <Link href="/tutorials" className="hover:text-bone">Tutorials</Link>
          <Link href="/leaderboard" className="hover:text-bone">Leaderboard</Link>
          <Link href="/about" className="hover:text-bone">About</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div>
          <h1 className="font-[var(--font-display)] text-5xl leading-[1.02] tracking-tight md:text-7xl">
            Chess on three boards at once.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-bone/75">
            Pieces move between layers, so every position has more ways to be
            won. Play the computer when you want practice, or a friend when you
            want a real game.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/game?mode=singleplayer&difficulty=beginner"
              className="rounded-sm bg-brass px-6 py-3 font-semibold text-ink transition-colors hover:bg-brass-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Start a game
            </Link>
            <Link
              href="/game?mode=multiplayer"
              className="rounded-sm border border-bone/30 px-6 py-3 font-semibold transition-colors hover:border-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Play online
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="mx-auto w-full max-w-md">
          <div className="grid grid-cols-8 border border-bone/20">
            {backRank.map((_, i) => (
              <div key={`b${i}`} className={`aspect-square ${i % 2 ? 'bg-walnut' : 'bg-oxblood'} flex items-center justify-center text-3xl text-bone/90`}>
                {glyph[backRank[i]]}
              </div>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`p${i}`} className={`aspect-square ${i % 2 ? 'bg-oxblood' : 'bg-walnut'} flex items-center justify-center text-3xl text-bone/90`}>
                ♟
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-bone/50">The starting position, top layer.</p>
        </div>
      </section>

      <section className="border-t border-bone/15">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-[var(--font-display)] text-3xl tracking-tight md:text-4xl">Pick a way to play</h2>
          <ul className="mt-10 divide-y divide-bone/15 border-y border-bone/15">
            {modes.map((m) => (
              <li key={m.name}>
                <Link href={m.href} className="group grid gap-2 py-7 md:grid-cols-[1fr_2fr] md:items-baseline md:gap-10">
                  <span className="font-[var(--font-display)] text-2xl group-hover:text-brass">{m.name}</span>
                  <span className="text-bone/70">{m.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-bone/40">
        3D Chess
      </footer>
    </main>
  );
}
