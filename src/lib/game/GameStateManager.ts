import { GameState, Move, Position, ChessPiece, PieceColor, LayerIndex, PiecesCollection } from '@/types/index';
import { v4 as uuidv4 } from 'uuid';

class ChessPiecesCollection implements PiecesCollection {
  white: ChessPiece[] = [];
  black: ChessPiece[] = [];

  find(predicate: (piece: ChessPiece) => boolean): ChessPiece | undefined {
    return [...this.white, ...this.black].find(predicate);
  }

  some(predicate: (piece: ChessPiece) => boolean): boolean {
    return [...this.white, ...this.black].some(predicate);
  }
}

export class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  setState(newState: GameState): void {
    const pieces = new ChessPiecesCollection();
    pieces.white = newState.pieces.white;
    pieces.black = newState.pieces.black;
    newState.pieces = pieces;
    this.state = newState;
  }

  private createInitialState(): GameState {
    const board = Array(3).fill(null).map(() =>
      Array(8).fill(null).map(() =>
        Array(8).fill(null)
      )
    );

    const pieces = new ChessPiecesCollection();

    // Initialize pieces
    const setupPieces = (color: PieceColor, baseRank: number) => {
      const rank = color === 'white' ? baseRank : 7 - baseRank;
      const layer = 1 as LayerIndex; // Middle layer

      // Pawns
      for (let file = 0; file < 8; file++) {
        const pawn: ChessPiece = {
          id: uuidv4(),
          type: 'pawn',
          color,
          position: { layer, x: file, y: rank },
          hasMoved: false
        };
        pieces[color].push(pawn);
        board[layer][rank][file] = pawn;
      }

      // Other pieces
      const pieceTypes: ChessPiece['type'][] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      pieceTypes.forEach((type, file) => {
        const piece: ChessPiece = {
          id: uuidv4(),
          type,
          color,
          position: { layer, x: file, y: color === 'white' ? 0 : 7 },
          hasMoved: false
        };
        pieces[color].push(piece);
        board[layer][color === 'white' ? 0 : 7][file] = piece;
      });
    };

    setupPieces('white', 1);
    setupPieces('black', 6);

    return {
      board,
      pieces,
      capturedPieces: {
        white: [],
        black: []
      },
      currentTurn: 'white',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false
    };
  }

  getGameState(): GameState {
    const state = JSON.parse(JSON.stringify(this.state)) as GameState;
    const pieces = new ChessPiecesCollection();
    pieces.white = state.pieces.white;
    pieces.black = state.pieces.black;
    state.pieces = pieces;
    return state;
  }

  makeMove(from: Position, to: Position): boolean {
    const piece = this.state.board[from.layer][from.y][from.x];
    if (!piece || piece.color !== this.state.currentTurn) return false;

    if (!this.isValidMove(from, to)) return false;

    // Make the move
    const capturedPiece = this.state.board[to.layer][to.y][to.x];
    
    // Update board
    this.state.board[from.layer][from.y][from.x] = null;
    piece.position = to;
    piece.hasMoved = true;
    this.state.board[to.layer][to.y][to.x] = piece;

    // Handle capture
    if (capturedPiece) {
      const pieces = this.state.pieces[capturedPiece.color];
      const index = pieces.findIndex(p => p.id === capturedPiece.id);
      if (index !== -1) {
        pieces.splice(index, 1);
        this.state.capturedPieces[capturedPiece.color].push(capturedPiece);
      }
    }

    // Update turn
    this.state.currentTurn = this.state.currentTurn === 'white' ? 'black' : 'white';

    // Update game state
    this.updateGameState();

    return true;
  }

  isValidMove(from: Position, to: Position): boolean {
    const piece = this.state.board[from.layer][from.y][from.x];
    if (!piece) return false;

    // Basic validation
    if (from.layer === to.layer && from.x === to.x && from.y === to.y) return false;
    
    const targetPiece = this.state.board[to.layer][to.y][to.x];
    if (targetPiece && targetPiece.color === piece.color) return false;

    // Check if the move is valid for the piece type
    return this.isValidMoveForPiece(piece, from, to);
  }

  getValidMoves(position: Position, p0: boolean): Position[] {
    const piece = this.state.board[position.layer][position.y][position.x];
    if (!piece) return [];

    const moves: Position[] = [];
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const to: Position = { layer: layer as LayerIndex, x, y };
          if (this.isValidMove(position, to)) {
            moves.push(to);
          }
        }
      }
    }

    return moves;
  }

  private isValidMoveForPiece(piece: ChessPiece, from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const dz = Math.abs(to.layer - from.layer);

    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(piece, from, to);
      case 'knight':
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2) || 
               (dx === 2 && dz === 1) || (dx === 1 && dz === 2) ||
               (dy === 2 && dz === 1) || (dy === 1 && dz === 2);
      case 'bishop':
        return dx === dy && this.isPathClear(from, to);
      case 'rook':
        return ((dx === 0 && dy > 0) || (dx > 0 && dy === 0)) && this.isPathClear(from, to);
      case 'queen':
        return (dx === dy || (dx === 0 && dy > 0) || (dx > 0 && dy === 0)) && this.isPathClear(from, to);
      case 'king':
        return dx <= 1 && dy <= 1 && dz <= 1;
      default:
        return false;
    }
  }

  private isValidPawnMove(piece: ChessPiece, from: Position, to: Position): boolean {
    const direction = piece.color === 'white' ? 1 : -1;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.layer - from.layer;

    // Normal move
    if (dx === 0 && dy === direction && dz === 0) {
      return !this.state.board[to.layer][to.y][to.x];
    }

    // Initial two-square move
    if (!piece.hasMoved && dx === 0 && dy === 2 * direction && dz === 0) {
      const intermediateY = from.y + direction;
      return !this.state.board[from.layer][intermediateY][from.x] &&
             !this.state.board[to.layer][to.y][to.x];
    }

    // Capture
    if (Math.abs(dx) === 1 && dy === direction) {
      const targetPiece = this.state.board[to.layer][to.y][to.x];
      return !!targetPiece && targetPiece.color !== piece.color;
    }

    return false;
  }

  private isPathClear(from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.layer - from.layer;
    
    const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
    const xStep = dx / steps;
    const yStep = dy / steps;
    const zStep = dz / steps;

    for (let i = 1; i < steps; i++) {
      const x = Math.round(from.x + xStep * i);
      const y = Math.round(from.y + yStep * i);
      const layer = Math.round(from.layer + zStep * i) as LayerIndex;
      
      if (this.state.board[layer][y][x]) return false;
    }

    return true;
  }

  private updateGameState(): void {
    const currentColor = this.state.currentTurn;
    const opponentColor = currentColor === 'white' ? 'black' : 'white';
    
    // Check if the current player's king is in check
    const king = this.state.pieces.find(p => p.type === 'king' && p.color === currentColor);
    if (!king) return;

    // Check if any opponent piece can capture the king
    this.state.isCheck = this.state.pieces.some(piece => 
      piece.color === opponentColor && this.isValidMove(piece.position, king.position)
    );

    // Check if the current player has any valid moves
    const hasValidMoves = this.state.pieces.some(piece => 
      piece.color === currentColor && this.getValidMoves(piece.position).length > 0
    );

    if (!hasValidMoves) {
      this.state.isCheckmate = this.state.isCheck;
      this.state.isStalemate = !this.state.isCheck;
    } else {
      this.state.isCheckmate = false;
      this.state.isStalemate = false;
    }
  }
} 