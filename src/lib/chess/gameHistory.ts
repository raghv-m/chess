/**
 * Finished games kept in this browser. There are no accounts yet, so this
 * history belongs to one browser on one device. Storage failures (private
 * windows, blocked storage) are swallowed and simply mean nothing is kept.
 */

export interface SavedGame {
  id: string;
  savedAt: number;
  mode: 'computer' | 'local';
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  /** Result as shown to the player, for example "White wins (checkmate)". */
  result: string;
  /** Moves in coordinate notation, for example "e2:1e4:1". */
  moves: string[];
}

const KEY = 'chess.history.v1';
const MAX_GAMES = 50;

function isSavedGame(value: unknown): value is SavedGame {
  if (!value || typeof value !== 'object') return false;
  const g = value as SavedGame;
  return (
    typeof g.id === 'string' &&
    typeof g.savedAt === 'number' &&
    (g.mode === 'computer' || g.mode === 'local') &&
    typeof g.result === 'string' &&
    Array.isArray(g.moves) &&
    g.moves.every(m => typeof m === 'string')
  );
}

export function loadHistory(): SavedGame[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedGame).slice(0, MAX_GAMES) : [];
  } catch {
    return [];
  }
}

/** Save a finished game. Returns false if storage is unavailable or the game is a duplicate of the newest one. */
export function saveGame(game: Omit<SavedGame, 'id' | 'savedAt'>): boolean {
  try {
    const existing = loadHistory();
    const newest = existing[0];
    if (newest && newest.result === game.result && newest.moves.join(' ') === game.moves.join(' ')) {
      return false;
    }
    const entry: SavedGame = {
      ...game,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: Date.now()
    };
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...existing].slice(0, MAX_GAMES)));
    return true;
  } catch {
    return false;
  }
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
