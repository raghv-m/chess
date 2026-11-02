import { ChessEngine } from '@/lib/chess/engine';
import { ChessPiece, PieceType, PieceColor, Position, GameState } from '@/types/index';

/** Build a clean board with only the given pieces. */
function setup(pieces: { type: PieceType; color: PieceColor; x: number; y: number; layer: number }[]) {
  const engine = new ChessEngine();
  const board: (ChessPiece | null)[][][] = [0, 1, 2].map(() =>
    Array.from({ length: 8 }, () => Array<ChessPiece | null>(8).fill(null))
  );
  for (const p of pieces) {
    board[p.layer][p.y][p.x] = {
      id: `${p.type}-${p.color}-${p.x}-${p.y}-${p.layer}`,
      type: p.type,
      color: p.color,
      position: { x: p.x, y: p.y, layer: p.layer as 0 | 1 | 2 },
      hasMoved: false
    };
  }
  const e = engine as any;
  e.board = board;
  e.currentPlayer = 'white';
  e.moveHistory = [];
  e.capturedPieces = [];
  e.enPassantTarget = null;
  e.castlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  e.undoStack = [];
  e.halfmoveClock = 0;
  e.positionHistory = [e.positionKey()];
  e.updateGameState();
  return engine;
}

const pos = (x: number, y: number, layer = 0): Position => ({ x, y, layer: layer as 0 | 1 | 2 });

// Kings sit in corners; two rooks shuttle on the same layer so every 4 plies the position repeats.
const shuttleBase = () => setup([
  { type: 'king', color: 'white', x: 0, y: 0, layer: 0 },
  { type: 'king', color: 'black', x: 7, y: 7, layer: 0 },
  { type: 'rook', color: 'white', x: 3, y: 3, layer: 0 },
  { type: 'rook', color: 'black', x: 5, y: 5, layer: 0 }
]);

function shuttleOnce(engine: ChessEngine) {
  expect(engine.makeMove(pos(3, 3), pos(3, 4))).toBe(true); // W
  expect(engine.makeMove(pos(5, 5), pos(5, 4))).toBe(true); // B
  expect(engine.makeMove(pos(3, 4), pos(3, 3))).toBe(true); // W
  expect(engine.makeMove(pos(5, 4), pos(5, 5))).toBe(true); // B
}

describe('Draw rules', () => {
  test('threefold repetition becomes claimable and can be claimed', () => {
    const engine = shuttleBase();
    shuttleOnce(engine);
    shuttleOnce(engine);
    expect(engine.getClaimableDraw()).toBe('threefold-repetition');
    expect(engine.getGameState()).not.toBe(GameState.DRAW);
    expect(engine.claimDraw()).toBe(true);
    expect(engine.getGameState()).toBe(GameState.DRAW);
    expect(engine.getDrawReason()).toBe('threefold-repetition');
    expect(engine.isGameOver()).toBe(true);
  });

  test('fivefold repetition ends the game automatically and blocks further moves', () => {
    const engine = shuttleBase();
    for (let i = 0; i < 4; i++) shuttleOnce(engine);
    expect(engine.getGameState()).toBe(GameState.DRAW);
    expect(engine.getDrawReason()).toBe('fivefold-repetition');
    expect(engine.makeMove(pos(3, 3), pos(3, 4))).toBe(false);
  });

  test('fifty-move rule is claimable at 100 plies without capture or pawn move', () => {
    const engine = shuttleBase();
    (engine as any).halfmoveClock = 99;
    expect(engine.getClaimableDraw()).toBeNull();
    expect(engine.makeMove(pos(3, 3), pos(3, 4))).toBe(true);
    expect(engine.getHalfmoveClock()).toBe(100);
    expect(engine.getClaimableDraw()).toBe('fifty-move-rule');
  });

  test('seventy-five-move rule ends the game automatically at 150 plies', () => {
    const engine = shuttleBase();
    (engine as any).halfmoveClock = 149;
    expect(engine.makeMove(pos(3, 3), pos(3, 4))).toBe(true);
    expect(engine.getGameState()).toBe(GameState.DRAW);
    expect(engine.getDrawReason()).toBe('seventy-five-move-rule');
  });

  test('a pawn move resets the halfmove clock', () => {
    const engine = setup([
      { type: 'king', color: 'white', x: 0, y: 0, layer: 0 },
      { type: 'king', color: 'black', x: 7, y: 7, layer: 0 },
      { type: 'pawn', color: 'white', x: 2, y: 1, layer: 0 }
    ]);
    (engine as any).halfmoveClock = 60;
    expect(engine.makeMove(pos(2, 1), pos(2, 2))).toBe(true);
    expect(engine.getHalfmoveClock()).toBe(0);
  });

  test('undo restores the repetition history and clock', () => {
    const engine = shuttleBase();
    shuttleOnce(engine);
    shuttleOnce(engine);
    expect(engine.getClaimableDraw()).toBe('threefold-repetition');
    expect(engine.makeMove(pos(3, 3), pos(3, 4))).toBe(true);
    expect(engine.undoMove()).toBe(true);
    expect(engine.getClaimableDraw()).toBe('threefold-repetition');
  });

  test('repetition state survives a snapshot round trip', () => {
    const engine = shuttleBase();
    shuttleOnce(engine);
    shuttleOnce(engine);
    const restored = ChessEngine.fromSnapshot(JSON.parse(JSON.stringify(engine.toSnapshot())));
    expect(restored.getClaimableDraw()).toBe('threefold-repetition');
  });

  test('old snapshots without draw fields still load', () => {
    const engine = shuttleBase();
    const snap: any = engine.toSnapshot();
    delete snap.halfmoveClock;
    delete snap.positionHistory;
    delete snap.drawReason;
    const restored = ChessEngine.fromSnapshot(snap);
    expect(restored.getHalfmoveClock()).toBe(0);
    expect(restored.getClaimableDraw()).toBeNull();
  });
});

describe('Undo restores full state', () => {
  test('undoing a promotion restores the pawn and the empty square', () => {
    const engine = setup([
      { type: 'king', color: 'white', x: 0, y: 0, layer: 0 },
      { type: 'king', color: 'black', x: 7, y: 5, layer: 0 },
      { type: 'pawn', color: 'white', x: 0, y: 6, layer: 0 }
    ]);
    expect(engine.makeMove(pos(0, 6), pos(0, 7), 'rook')).toBe(true);
    expect(engine.getPieceAt(pos(0, 7))?.type).toBe('rook');
    expect(engine.undoMove()).toBe(true);
    expect(engine.getPieceAt(pos(0, 6))?.type).toBe('pawn');
    expect(engine.getPieceAt(pos(0, 7))).toBeNull();
    expect(engine.getPieceAt(pos(0, 6))?.color).toBe('white');
  });

  test('undoing castling restores king, rook and castling rights', () => {
    const engine = setup([
      { type: 'king', color: 'white', x: 4, y: 0, layer: 0 },
      { type: 'rook', color: 'white', x: 7, y: 0, layer: 0 },
      { type: 'king', color: 'black', x: 4, y: 7, layer: 0 }
    ]);
    (engine as any).castlingRights = { whiteKingside: true, whiteQueenside: false, blackKingside: false, blackQueenside: false };
    expect(engine.makeMove(pos(4, 0), pos(6, 0))).toBe(true);
    expect(engine.getPieceAt(pos(6, 0))?.type).toBe('king');
    expect(engine.getPieceAt(pos(5, 0))?.type).toBe('rook');
    expect(engine.undoMove()).toBe(true);
    expect(engine.getPieceAt(pos(4, 0))?.type).toBe('king');
    expect(engine.getPieceAt(pos(7, 0))?.type).toBe('rook');
    expect(engine.getPieceAt(pos(5, 0))).toBeNull();
    expect((engine as any).castlingRights.whiteKingside).toBe(true);
  });

  test('undo returns false when there is nothing to undo', () => {
    const engine = setup([
      { type: 'king', color: 'white', x: 0, y: 0, layer: 0 },
      { type: 'king', color: 'black', x: 7, y: 7, layer: 0 }
    ]);
    expect(engine.undoMove()).toBe(false);
  });
});
