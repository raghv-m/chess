/**
 * @jest-environment jsdom
 */
import { saveGame, loadHistory, clearHistory } from '@/lib/chess/gameHistory';

describe('Game history', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('saves and reloads a finished game', () => {
    expect(saveGame({ mode: 'local', result: 'Draw (stalemate)', moves: ['e2:1e4:1'] })).toBe(true);
    const games = loadHistory();
    expect(games).toHaveLength(1);
    expect(games[0].moves).toEqual(['e2:1e4:1']);
    expect(games[0].id).toBeTruthy();
  });

  test('does not save the same game twice in a row', () => {
    const game = { mode: 'local' as const, result: 'Draw (stalemate)', moves: ['e2:1e4:1'] };
    expect(saveGame(game)).toBe(true);
    expect(saveGame(game)).toBe(false);
    expect(loadHistory()).toHaveLength(1);
  });

  test('ignores corrupt stored data instead of throwing', () => {
    window.localStorage.setItem('chess.history.v1', '{not json');
    expect(loadHistory()).toEqual([]);
    window.localStorage.setItem('chess.history.v1', JSON.stringify([{ bogus: true }]));
    expect(loadHistory()).toEqual([]);
  });

  test('clearHistory removes everything', () => {
    saveGame({ mode: 'computer', difficulty: 'beginner', result: 'White wins (checkmate)', moves: ['a2:1a3:1'] });
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
