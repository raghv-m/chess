import { ChessEngine } from '@/lib/chess/engine';
import type { Position } from '@/types/index';

/**
 * Round-trip tests for ChessEngine.toSnapshot() / fromSnapshot() — the
 * pair the online game service uses to persist a game in Postgres and
 * rehydrate the referee on every move request.
 */

function throughJson<T>(value: T): T {
  // Simulates the trip through a jsonb column.
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('ChessEngine snapshot round-trip', () => {
  it('restores a fresh game exactly', () => {
    const engine = new ChessEngine();
    const snapshot = engine.toSnapshot();

    const revived = ChessEngine.fromSnapshot(throughJson(snapshot));

    expect(revived.toSnapshot()).toEqual(snapshot);
    expect(revived.getGameState()).toBe(engine.getGameState());
  });

  it('preserves en passant state and move history after scripted double pushes', () => {
    const engine = new ChessEngine();

    // White pawn double push, then black pawn double push.
    expect(
      engine.makeMove({ x: 4, y: 1, layer: 0 }, { x: 4, y: 3, layer: 0 })
    ).toBe(true);
    expect(
      engine.makeMove({ x: 3, y: 6, layer: 0 }, { x: 3, y: 4, layer: 0 })
    ).toBe(true);

    const snapshot = engine.toSnapshot();
    expect(snapshot.moveHistory).toHaveLength(2);
    expect(snapshot.enPassantTarget).toEqual({ x: 3, y: 5, layer: 0 });

    const revived = ChessEngine.fromSnapshot(throughJson(snapshot));

    expect(revived.toSnapshot()).toEqual(snapshot);
    expect(revived.toSnapshot().enPassantTarget).toEqual({ x: 3, y: 5, layer: 0 });

    // The revived engine still referees: white can push the pawn again.
    expect(
      revived.makeMove({ x: 4, y: 3, layer: 0 }, { x: 4, y: 4, layer: 0 })
    ).toBe(true);
    expect(revived.toSnapshot().moveHistory).toHaveLength(3);
  });

  it('keeps middle-layer pieces and their vertical layer moves', () => {
    const engine = new ChessEngine();
    const board = engine.getBoard();

    // Find a white knight on the middle layer (layer 1 starts with an
    // extra knight and bishop per side in this variant).
    let knightPos: Position | null = null;
    for (let y = 0; y < 8 && !knightPos; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[1][y][x];
        if (piece && piece.type === 'knight' && piece.color === 'white') {
          knightPos = { x, y, layer: 1 };
          break;
        }
      }
    }
    expect(knightPos).not.toBeNull();

    const revived = ChessEngine.fromSnapshot(throughJson(engine.toSnapshot()));
    const moves = revived.getValidMoves(knightPos as Position);
    const has = (layer: 0 | 2) =>
      moves.some(
        (m) =>
          m.x === (knightPos as Position).x &&
          m.y === (knightPos as Position).y &&
          m.layer === layer
      );

    // Same square, one layer down and one layer up.
    expect(has(0)).toBe(true);
    expect(has(2)).toBe(true);
  });

  it('deep-clones: mutating a snapshot does not leak into a revived engine', () => {
    const engine = new ChessEngine();
    const snapshot = engine.toSnapshot();
    const revived = ChessEngine.fromSnapshot(snapshot);

    // Vandalise the snapshot after hydration.
    snapshot.moveHistory.push({
      from: { x: 0, y: 0, layer: 0 },
      to: { x: 0, y: 1, layer: 0 },
      piece: snapshot.board[0][1][0] as never
    });
    snapshot.board[0][0][0] = null;

    const revivedSnapshot = revived.toSnapshot();
    expect(revivedSnapshot.moveHistory).toHaveLength(0);
    expect(revivedSnapshot.board[0][0][0]).not.toBeNull();
  });

  it('rejects malformed snapshots', () => {
    expect(() => ChessEngine.fromSnapshot(null as never)).toThrow();
    expect(() => ChessEngine.fromSnapshot({ version: 1 } as never)).toThrow();
    expect(
      () => ChessEngine.fromSnapshot({ version: 99, board: [] } as never)
    ).toThrow();
  });
});
