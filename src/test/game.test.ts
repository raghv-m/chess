import { ChessEngine } from '@/lib/chess/engine';
import { ChessAI } from '@/lib/ai/ChessAI';
import { LayerIndex } from '@/types/index';

describe('ChessAI', () => {
  test.each(['beginner', 'intermediate', 'expert'] as const)(
    'returns a legal opening move at %s level',
    (difficulty) => {
      const engine = new ChessEngine();
      const ai = new ChessAI(difficulty);
      const move = ai.chooseMove(engine);
      expect(move).not.toBeNull();
      const legal = engine.getValidMoves(move!.from);
      expect(legal.some(m => m.x === move!.to.x && m.y === move!.to.y && m.layer === move!.to.layer)).toBe(true);
    }
  );

  test('takes a queen that is hanging', () => {
    const engine = new ChessEngine();
    const board = engine.getBoard();
    // Clear the board of everything except the two kings, then set up
    // a black rook that can capture an undefended white queen.
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          board[layer as LayerIndex][y][x] = null;
        }
      }
    }
    board[0][0][4] = { id: 'wk', type: 'king', color: 'white', position: { x: 4, y: 0, layer: 0 }, hasMoved: true };
    board[0][7][4] = { id: 'bk', type: 'king', color: 'black', position: { x: 4, y: 7, layer: 0 }, hasMoved: true };
    board[0][3][0] = { id: 'wq', type: 'queen', color: 'white', position: { x: 0, y: 3, layer: 0 }, hasMoved: true };
    board[0][3][7] = { id: 'br', type: 'rook', color: 'black', position: { x: 7, y: 3, layer: 0 }, hasMoved: true };
    (engine as any).currentPlayer = 'black';

    const move = new ChessAI('intermediate').chooseMove(engine);
    expect(move).not.toBeNull();
    expect(move!.to).toEqual({ x: 0, y: 3, layer: 0 });
  });
});
