import { ChessEngine } from '@/lib/chess/engine';
import { findLegalMove, moveToString, moveListString, parseMoveString, parseSquare, squareToString } from '@/lib/chess/notation';

describe('Coordinate notation', () => {
  test('square names round trip', () => {
    const p = parseSquare('e2:1');
    expect(p).toEqual({ x: 4, y: 1, layer: 0 });
    expect(squareToString(p!)).toBe('e2:1');
    expect(parseSquare('i9:4')).toBeNull();
    expect(parseSquare('e2')).toBeNull();
  });

  test('parses plain and promotion moves', () => {
    expect(parseMoveString('e2:1e4:1')).toEqual({
      from: { x: 4, y: 1, layer: 0 }, to: { x: 4, y: 3, layer: 0 }, promotion: undefined
    });
    expect(parseMoveString('a7:2a8:2q')?.promotion).toBe('queen');
    expect(parseMoveString('garbage')).toBeNull();
  });

  test('findLegalMove accepts only legal moves for the side to move', () => {
    const engine = new ChessEngine();
    // Find a legal opening move from the engine's own move list
    const from = { x: 4, y: 1, layer: 0 as const };
    const legal = engine.getValidMoves(from);
    expect(legal.length).toBeGreaterThan(0);
    const target = legal[0];
    const text = `${squareToString(from)}${squareToString(target)}`;
    expect(findLegalMove(engine, text)).not.toBeNull();
    // Moving a black piece on white's turn is rejected
    expect(findLegalMove(engine, 'e7:1e5:1')).toBeNull();
    // An obviously illegal move is rejected
    expect(findLegalMove(engine, 'e2:1e6:1')).toBeNull();
  });

  test('move list reflects the game so far', () => {
    const engine = new ChessEngine();
    const from = { x: 4, y: 1, layer: 0 as const };
    const to = engine.getValidMoves(from)[0];
    expect(engine.makeMove(from, to)).toBe(true);
    const list = moveListString(engine);
    expect(list.startsWith('1. ')).toBe(true);
    expect(list).toContain(moveToString({ from, to }));
  });
});
