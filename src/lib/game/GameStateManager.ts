import { GameState, Move, Position, ChessPiece, PieceType, PieceColor } from '@/types';

export class GameStateManager {
  private gameState: GameState;

  constructor(initialState?: GameState) {
    this.gameState = initialState || this.createInitialGameState();
  }

  private createInitialGameState(): GameState {
    const board = Array(1).fill(null).map(() =>
      Array(8).fill(null).map(() =>
        Array(8).fill(null)
      )
    );

    const pieces = {
      white: [] as ChessPiece[],
      black: [] as ChessPiece[],
      find: (predicate: (piece: ChessPiece) => boolean) => [...board[0].flat()].find(predicate),
      filter: (predicate: (piece: ChessPiece) => boolean) => [...board[0].flat()].filter(predicate),
      some: (predicate: (piece: ChessPiece) => boolean) => [...board[0].flat()].some(predicate),
      flatMap: <T>(callback: (piece: ChessPiece) => T[]) => [...board[0].flat()].flatMap(callback),
      push: (piece: ChessPiece) => {
        if (piece.color === 'white') {
          pieces.white.push(piece);
        } else {
          pieces.black.push(piece);
        }
        board[0][piece.position.y][piece.position.x] = piece;
      }
    };

    // Initialize pieces
    const setupPiece = (type: PieceType, color: PieceColor, x: number, y: number) => {
      const piece: ChessPiece = {
        type,
        color,
        position: { x, y, layer: 0 },
        hasMoved: false
      };
      pieces.push(piece);
    };

    // Set up pawns
    for (let x = 0; x < 8; x++) {
      setupPiece('pawn', 'white', x, 1);
      setupPiece('pawn', 'black', x, 6);
    }

    // Set up other pieces
    const backRowPieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let x = 0; x < 8; x++) {
      setupPiece(backRowPieces[x], 'white', x, 0);
      setupPiece(backRowPieces[x], 'black', x, 7);
    }

    return {
      board,
      currentTurn: 'white',
      isCheckmate: false,
      isStalemate: false,
      isCheck: false,
      moves: [],
      pieces,
      capturedPieces: {
        white: [],
        black: []
      }
    };
  }

  getGameState(): GameState {
    return this.gameState;
  }

  makeMove(from: Position, to: Position): boolean {
    const piece = this.gameState.board[from.layer][from.y][from.x];
    if (!piece || piece.color !== this.gameState.currentTurn) {
      return false;
    }

    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: this.gameState.board[to.layer][to.y][to.x] || undefined
    };

    // Update board
    this.gameState.board[from.layer][from.y][from.x] = null;
    this.gameState.board[to.layer][to.y][to.x] = {
      ...piece,
      position: to,
      hasMoved: true
    };

    // Handle captured piece
    if (move.capturedPiece) {
      this.gameState.capturedPieces[move.capturedPiece.color].push(move.capturedPiece);
    }

    // Update game state
    this.gameState.moves.push(move);
    this.gameState.currentTurn = this.gameState.currentTurn === 'white' ? 'black' : 'white';

    // Check for check/checkmate/stalemate
    this.updateGameStatus();

    return true;
  }

  private updateGameStatus() {
    const currentColor = this.gameState.currentTurn;
    const king = this.gameState.pieces.find(
      piece => piece.type === 'king' && piece.color === currentColor
    );

    if (!king) {
      this.gameState.isCheckmate = true;
      return;
    }

    // Check if king is in check
    this.gameState.isCheck = this.isSquareUnderAttack(king.position, currentColor);

    // Check for checkmate or stalemate
    const hasValidMoves = this.gameState.pieces
      .filter(piece => piece && piece.color === currentColor)
      .some(piece => this.getValidMoves(piece.position).length > 0);

    if (!hasValidMoves) {
      if (this.gameState.isCheck) {
        this.gameState.isCheckmate = true;
      } else {
        this.gameState.isStalemate = true;
      }
    }
  }

  private isSquareUnderAttack(position: Position, defendingColor: PieceColor): boolean {
    const attackingColor = defendingColor === 'white' ? 'black' : 'white';
    return this.gameState.pieces
      .filter(piece => piece && piece.color === attackingColor)
      .some(piece => {
        const moves = this.getValidMoves(piece.position, true);
        return moves.some(move =>
          move.x === position.x &&
          move.y === position.y &&
          move.layer === position.layer
        );
      });
  }

  getValidMoves(position: Position, ignoreCheck = false): Position[] {
    const piece = this.gameState.board[position.layer][position.y][position.x];
    if (!piece) return [];

    const moves: Position[] = [];
    const addMove = (x: number, y: number, layer = position.layer) => {
      if (x < 0 || x > 7 || y < 0 || y > 7) return false;
      
      const targetPiece = this.gameState.board[layer][y][x];
      if (targetPiece && targetPiece.color === piece.color) return false;

      if (!ignoreCheck) {
        // Test if move would put king in check
        const testState = JSON.parse(JSON.stringify(this.gameState));
        testState.board[position.layer][position.y][position.x] = null;
        testState.board[layer][y][x] = { ...piece, position: { x, y, layer } };
        
        const king = testState.pieces.find(
          p => p.type === 'king' && p.color === piece.color
        );
        if (king && this.isSquareUnderAttack(king.position, piece.color)) {
          return false;
        }
      }

      moves.push({ x, y, layer });
      return !targetPiece; // Continue only if square is empty
    };

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? 1 : -1;
        const startRank = piece.color === 'white' ? 1 : 6;

        // Forward move
        if (addMove(position.x, position.y + direction)) {
          // Double move from starting position
          if (position.y === startRank) {
            addMove(position.x, position.y + 2 * direction);
          }
        }

        // Captures
        for (const dx of [-1, 1]) {
          const x = position.x + dx;
          const y = position.y + direction;
          if (x >= 0 && x <= 7) {
            const targetPiece = this.gameState.board[position.layer][y][x];
            if (targetPiece && targetPiece.color !== piece.color) {
              addMove(x, y);
            }
          }
        }
        break;
      }

      case 'knight': {
        const moves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dx, dy] of moves) {
          addMove(position.x + dx, position.y + dy);
        }
        break;
      }

      case 'bishop': {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;
          while (addMove(x, y)) {
            x += dx;
            y += dy;
          }
        }
        break;
      }

      case 'rook': {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;
          while (addMove(x, y)) {
            x += dx;
            y += dy;
          }
        }
        break;
      }

      case 'queen': {
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;
          while (addMove(x, y)) {
            x += dx;
            y += dy;
          }
        }
        break;
      }

      case 'king': {
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        for (const [dx, dy] of directions) {
          addMove(position.x + dx, position.y + dy);
        }

        // Castling
        if (!piece.hasMoved && !this.gameState.isCheck) {
          // Kingside
          const kingsideRook = this.gameState.board[position.layer][position.y][7];
          if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved) {
            if (!this.gameState.board[position.layer][position.y][5] &&
                !this.gameState.board[position.layer][position.y][6] &&
                !this.isSquareUnderAttack({ x: 5, y: position.y, layer: position.layer }, piece.color) &&
                !this.isSquareUnderAttack({ x: 6, y: position.y, layer: position.layer }, piece.color)) {
              addMove(6, position.y);
            }
          }

          // Queenside
          const queensideRook = this.gameState.board[position.layer][position.y][0];
          if (queensideRook?.type === 'rook' && !queensideRook.hasMoved) {
            if (!this.gameState.board[position.layer][position.y][1] &&
                !this.gameState.board[position.layer][position.y][2] &&
                !this.gameState.board[position.layer][position.y][3] &&
                !this.isSquareUnderAttack({ x: 2, y: position.y, layer: position.layer }, piece.color) &&
                !this.isSquareUnderAttack({ x: 3, y: position.y, layer: position.layer }, piece.color)) {
              addMove(2, position.y);
            }
          }
        }
        break;
      }
    }

    return moves;
  }
} 