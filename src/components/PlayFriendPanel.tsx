'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * "Play a friend" panel: create a shareable game link, or jump to a game
 * by its 6-letter code. Used by the mode-selection screen and by the
 * /game?mode=multiplayer route.
 *
 * Creating a game stores the white seat token in localStorage under the
 * new room code, then navigates to /game/<code> where the share link is
 * presented. Joining by code navigates to the game page, where the black
 * seat is claimed with an explicit Join button.
 */
export default function PlayFriendPanel() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create the game.');
      }
      try {
        localStorage.setItem(`chess:token:${json.code}`, json.token);
      } catch {
        // Storage unavailable (private mode): the game page will treat
        // this browser as a spectator. Nothing else we can do here.
      }
      router.push(`/game/${json.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create the game.');
      setCreating(false);
    }
  }

  function handleJoin(event: React.FormEvent) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Room codes are 6 characters long.');
      return;
    }
    router.push(`/game/${code}`);
  }

  return (
    <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-left">
      <h3 className="text-2xl font-bold mb-2">Play a friend online</h3>
      <p className="text-gray-400 mb-6">
        Create a game and share the link — your friend opens it, takes the
        black pieces, and you play in real time. No accounts, no sign-up.
      </p>

      <button
        onClick={handleCreate}
        disabled={creating}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all hover:shadow-purple-500/20 disabled:opacity-50"
      >
        {creating ? 'Creating game…' : 'Create a game link'}
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-gray-500 text-sm">or join with a code</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <form onSubmit={handleJoin} className="flex gap-3">
        <input
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-black/30 border border-white/15 rounded-lg px-4 py-3 text-center tracking-[0.3em] font-mono text-lg placeholder:text-gray-600 focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          className="bg-white/10 hover:bg-white/20 border border-white/15 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Go to game
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  );
}
