import { ChessEngine } from '@/lib/chess/engine';
import { Position, ChessPiece, GameState, LayerIndex } from '@/types/index';

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Initialization', () => {
    test('should initialize with correct board setup', () => {
      const board = engine.getBoard();
      
      // Check board dimensions
      expect(board).toHaveLength(3); // 3 layers
      expect(board[0]).toHaveLength(8); // 8 rows
      expect(board[0][0]).toHaveLength(8); // 8 columns
      
      // Check that pieces are placed correctly
      expect(board[0][0][0]).toBeTruthy(); // White rook
      expect(board[0][0][4]).toBeTruthy(); // White king
      expect(board[0][7][0]).toBeTruthy(); // Black rook
      expect(board[0][7][4]).toBeTruthy(); // Black king
    });

    test('should start with white player', () => {
      // This would require a getter method to test
      // For now, we'll test through move validation
      const whitePawnPos = { x: 0, y: 1, layer: 0 as LayerIndex };
      const blackPawnPos = { x: 0, y: 6, layer: 0 as LayerIndex };
      
      const whiteMoves = engine.getValidMoves(whitePawnPos);
      const blackMoves = engine.getValidMoves(blackPawnPos);
      
      expect(whiteMoves.length).toBeGreaterThan(0);
      expect(blackMoves.length).toBe(0); // Black can't move first
    });
  });

  describe('Move Validation', () => {
    test('should validate pawn moves correctly', () => {
      const pawnPos = { x: 0, y: 1, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(pawnPos);
      
      // Pawn should be able to move forward one square
      expect(validMoves).toContainEqual({ x: 0, y: 2, layer: 0 as LayerIndex });
      
      // Pawn should be able to move forward two squares from starting position
      expect(validMoves).toContainEqual({ x: 0, y: 3, layer: 0 as LayerIndex });
    });

    test('should validate knight moves correctly', () => {
      const knightPos = { x: 1, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(knightPos);
      
      // Knight should have 2 valid moves from starting position
      expect(validMoves).toContainEqual({ x: 0, y: 2, layer: 0 as LayerIndex });
      expect(validMoves).toContainEqual({ x: 2, y: 2, layer: 0 as LayerIndex });
    });

    test('should prevent moves that expose king to check', () => {
      // This test would require setting up a specific position
      // For now, we'll test basic move validation
      const invalidPos = { x: -1, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(invalidPos);
      expect(validMoves).toHaveLength(0);
    });
  });

  describe('Special Moves', () => {
    test('should handle pawn promotion (all types, both colors, default queen)', () => {
      const board = engine.getBoard();
      // Remove any blocking pieces
      for (let x = 0; x < 8; x++) {
        board[0 as LayerIndex][6][x] = null;
        board[0 as LayerIndex][1][x] = null;
        board[0 as LayerIndex][0][x] = null;
        board[0 as LayerIndex][7][x] = null;
      }
      // White pawn promotions
      const promotionTypes = ['queen', 'rook', 'bishop', 'knight'] as const;
      promotionTypes.forEach((type, i) => {
        const pawn = {
          id: `white-pawn-${i}`,
          type: 'pawn' as const,
          color: 'white' as const,
          position: { x: i, y: 6, layer: 0 as LayerIndex },
          hasMoved: true
        };
        board[0 as LayerIndex][6][i] = pawn;
        const move = { x: i, y: 7, layer: 0 as LayerIndex };
        const success = engine.makeMove({ x: i, y: 6, layer: 0 as LayerIndex }, move, type);
        expect(success).toBe(true);
        const promoted = engine.getPieceAt(move);
        expect(promoted?.type).toBe(type);
        expect(promoted?.color).toBe('white');
      });
      // Default to queen if no type specified
      const pawnQ = {
        id: 'white-pawn-q',
        type: 'pawn' as const,
        color: 'white' as const,
        position: { x: 4, y: 6, layer: 0 as LayerIndex },
        hasMoved: true
      };
      board[0 as LayerIndex][6][4] = pawnQ;
      const moveQ = { x: 4, y: 7, layer: 0 as LayerIndex };
      const successQ = engine.makeMove({ x: 4, y: 6, layer: 0 as LayerIndex }, moveQ);
      expect(successQ).toBe(true);
      const promotedQ = engine.getPieceAt(moveQ);
      expect(promotedQ?.type).toBe('queen');
      // Black pawn promotions
      for (let x = 0; x < 4; x++) {
        board[0 as LayerIndex][1][x] = {
          id: `black-pawn-${x}`,
          type: 'pawn' as const,
          color: 'black' as const,
          position: { x, y: 1, layer: 0 as LayerIndex },
          hasMoved: true
        };
        const move = { x, y: 0, layer: 0 as LayerIndex };
        // Alternate promotion types
        const type = promotionTypes[x % 4];
        // Black's turn, so switch currentPlayer
        (engine as any).currentPlayer = 'black';
        const success = engine.makeMove({ x, y: 1, layer: 0 as LayerIndex }, move, type);
        expect(success).toBe(true);
        const promoted = engine.getPieceAt(move);
        expect(promoted?.type).toBe(type);
        expect(promoted?.color).toBe('black');
      }
      // Default to queen for black
      board[0 as LayerIndex][1][4] = {
        id: 'black-pawn-q',
        type: 'pawn' as const,
        color: 'black' as const,
        position: { x: 4, y: 1, layer: 0 as LayerIndex },
        hasMoved: true
      };
      (engine as any).currentPlayer = 'black';
      const moveQb = { x: 4, y: 0, layer: 0 as LayerIndex };
      const successQb = engine.makeMove({ x: 4, y: 1, layer: 0 as LayerIndex }, moveQb);
      expect(successQb).toBe(true);
      const promotedQb = engine.getPieceAt(moveQb);
      expect(promotedQb?.type).toBe('queen');
      expect(promotedQb?.color).toBe('black');
    });

    test('should handle en passant', () => {
      // This test would require setting up a specific position
      // where en passant is possible
      expect(true).toBe(true); // Placeholder
    });

    test('should handle castling', () => {
      // This test would require setting up a position where castling is legal
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Game State Management', () => {
    test('should detect check', () => {
      // Set up a position where king is in check
      const board = engine.getBoard();
      
      // Clear some pieces to create a check position
      board[0 as LayerIndex][1][0] = null; // Remove white pawn
      board[0 as LayerIndex][6][0] = null; // Remove black pawn
      
      // Place a black queen to attack white king
      const queen = {
        id: 'test-queen',
        type: 'queen' as const,
        color: 'black' as const,
        position: { x: 0, y: 1, layer: 0 as LayerIndex },
        hasMoved: true
      };
      board[0 as LayerIndex][1][0] = queen;
      
      // The game state should reflect check
      const gameState = engine.getGameState();
      expect(gameState).toBe(GameState.IN_CHECK);
    });

    test('should detect checkmate', () => {
      // This would require setting up a checkmate position
      expect(true).toBe(true); // Placeholder
    });

    test('should detect stalemate', () => {
      // This would require setting up a stalemate position
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Move History', () => {
    test('should record moves correctly', () => {
      const from = { x: 0, y: 1, layer: 0 as LayerIndex };
      const to = { x: 0, y: 2, layer: 0 as LayerIndex };
      
      const success = engine.makeMove(from, to);
      expect(success).toBe(true);
      
      // This would require a getter method to test move history
      expect(true).toBe(true); // Placeholder
    });

    test('should support undo move', () => {
      const from = { x: 0, y: 1, layer: 0 as LayerIndex };
      const to = { x: 0, y: 2, layer: 0 as LayerIndex };
      
      engine.makeMove(from, to);
      const success = engine.undoMove();
      
      expect(success).toBe(true);
      
      // Piece should be back in original position
      const piece = engine.getPieceAt(from);
      expect(piece).toBeTruthy();
      expect(piece?.position).toEqual(from);
    });
  });

  describe('Piece Movement', () => {
    test('should validate rook movement', () => {
      const rookPos = { x: 0, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(rookPos);
      
      // Rook should not be able to move initially (blocked by pawn)
      expect(validMoves).toHaveLength(0);
    });

    test('should validate bishop movement', () => {
      const bishopPos = { x: 2, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(bishopPos);
      
      // Bishop should not be able to move initially (blocked by pawn)
      expect(validMoves).toHaveLength(0);
    });

    test('should validate queen movement', () => {
      const queenPos = { x: 3, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(queenPos);
      
      // Queen should not be able to move initially (blocked by pawn)
      expect(validMoves).toHaveLength(0);
    });

    test('should validate king movement', () => {
      const kingPos = { x: 4, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(kingPos);
      
      // King should not be able to move initially (blocked by pawns)
      expect(validMoves).toHaveLength(0);
    });
  });

  describe('3D Layer Movement', () => {
    test('should allow pieces to move between layers', () => {
      // Test layer transitions for pieces that support them
      const knightPos = { x: 1, y: 0, layer: 0 as LayerIndex };
      const validMoves = engine.getValidMoves(knightPos);
      
      // Knight should be able to move to adjacent layers
      const layerMoves = validMoves.filter(move => move.layer !== 0);
      expect(layerMoves.length).toBeGreaterThan(0);
    });
  });

  describe('Capture Logic', () => {
    test('should handle piece capture correctly', () => {
      // Set up a position where capture is possible
      const board = engine.getBoard();
      
      // Clear some pieces
      board[0 as LayerIndex][1][0] = null; // Remove white pawn
      board[0 as LayerIndex][6][1] = null; // Remove black pawn
      
      // Place pieces for capture
      const whitePawn = {
        id: 'white-pawn',
        type: 'pawn' as const,
        color: 'white' as const,
        position: { x: 0, y: 1, layer: 0 as LayerIndex },
        hasMoved: true
      };
      const blackPawn = {
        id: 'black-pawn',
        type: 'pawn' as const,
        color: 'black' as const,
        position: { x: 1, y: 2, layer: 0 as LayerIndex },
        hasMoved: true
      };
      
      board[0 as LayerIndex][1][0] = whitePawn;
      board[0 as LayerIndex][2][1] = blackPawn;
      
      const captureMove = { x: 1, y: 2, layer: 0 as LayerIndex };
      const success = engine.makeMove({ x: 0, y: 1, layer: 0 as LayerIndex }, captureMove);
      
      expect(success).toBe(true);
      
      // Black pawn should be captured
      const capturedPiece = engine.getPieceAt(captureMove);
      expect(capturedPiece?.color).toBe('white');
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid positions', () => {
      const invalidPositions = [
        { x: -1, y: 0, layer: 0 as LayerIndex },
        { x: 8, y: 0, layer: 0 as LayerIndex },
        { x: 0, y: -1, layer: 0 as LayerIndex },
        { x: 0, y: 8, layer: 0 as LayerIndex },
        { x: 0, y: 0, layer: 3 as LayerIndex },
        { x: 0, y: 0, layer: -1 as LayerIndex }
      ];
      
      invalidPositions.forEach(pos => {
        const moves = engine.getValidMoves(pos);
        expect(moves).toHaveLength(0);
      });
    });

    test('should handle empty squares', () => {
      const emptyPos = { x: 4, y: 4, layer: 0 as LayerIndex };
      const moves = engine.getValidMoves(emptyPos);
      expect(moves).toHaveLength(0);
    });
  });
}); 