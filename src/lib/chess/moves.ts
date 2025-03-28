import { Position, ChessPiece, GameState, PieceColor } from '@/types';

export class MoveValidator {
  constructor(private gameState: GameState) {}

  public validateMove(from: Position, to: Position): boolean {
    const piece = this.getPieceAtPosition(from);
    if (!piece) return false;

    // Check if it's the correct player's turn
    if (piece.color !== this.gameState.currentTurn) return false;

    // Get valid moves for the piece
    const validMoves = this.getValidMovesForPiece(piece);

    // Check if the target position is in the valid moves
    return validMoves.some(move => 
      move.x === to.x && 
      move.y === to.y && 
      move.layer === to.layer
    );
  }

  private getPieceAtPosition(pos: Position): ChessPiece | null {
    return this.gameState.pieces.find(p => 
      p.position.x === pos.x && 
      p.position.y === pos.y && 
      p.position.layer === pos.layer
    ) || null;
  }

  private getValidMovesForPiece(piece: ChessPiece): Position[] {
    // Get basic moves based on piece type
    const basicMoves = this.getBasicMoves(piece);

    // Filter out moves that would result in check
    return basicMoves.filter(move => !this.wouldResultInCheck(piece, move));
  }

  private getBasicMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        this.getPawnMoves(piece, moves);
        break;
      case 'knight':
        this.getKnightMoves(piece, moves);
        break;
      case 'bishop':
        this.getBishopMoves(piece, moves);
        break;
      case 'rook':
        this.getRookMoves(piece, moves);
        break;
      case 'queen':
        this.getQueenMoves(piece, moves);
        break;
      case 'king':
        this.getKingMoves(piece, moves);
        break;
    }

    return moves;
  }

  private getPawnMoves(piece: ChessPiece, moves: Position[]): void {
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;
    const { x, y, layer } = piece.position;

    // Forward move
    if (this.isValidPosition(x, y + direction, layer)) {
      moves.push({ x, y: y + direction, layer });
      // Double move from starting position
      if (y === startRank && this.isValidPosition(x, y + 2 * direction, layer)) {
        moves.push({ x, y: y + 2 * direction, layer });
      }
    }

    // Captures
    for (const dx of [-1, 1]) {
      const newX = x + dx;
      const newY = y + direction;
      if (this.isValidPosition(newX, newY, layer)) {
        const targetPiece = this.getPieceAtPosition({ x: newX, y: newY, layer });
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push({ x: newX, y: newY, layer });
        }
      }
    }

    // Layer movement
    if (piece.hasMoved) {
      const layerDirection = piece.color === 'white' ? 1 : -1;
      const newLayer = layer + layerDirection;
      if (this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private getKnightMoves(piece: ChessPiece, moves: Position[]): void {
    const { x, y, layer } = piece.position;
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dx, dy] of knightMoves) {
      if (this.isValidPosition(x + dx, y + dy, layer)) {
        moves.push({ x: x + dx, y: y + dy, layer });
      }
    }

    // Layer jumping
    for (let newLayer = 0; newLayer <= 2; newLayer++) {
      if (newLayer !== layer && this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private getBishopMoves(piece: ChessPiece, moves: Position[]): void {
    const { x, y, layer } = piece.position;
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      while (this.isValidPosition(newX, newY, layer)) {
        moves.push({ x: newX, y: newY, layer });
        newX += dx;
        newY += dy;
      }
    }

    // Layer movement
    for (let newLayer = 0; newLayer <= 2; newLayer++) {
      if (newLayer !== layer && this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private getRookMoves(piece: ChessPiece, moves: Position[]): void {
    const { x, y, layer } = piece.position;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      while (this.isValidPosition(newX, newY, layer)) {
        moves.push({ x: newX, y: newY, layer });
        newX += dx;
        newY += dy;
      }
    }

    // Layer movement
    for (let newLayer = 0; newLayer <= 2; newLayer++) {
      if (newLayer !== layer && this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private getQueenMoves(piece: ChessPiece, moves: Position[]): void {
    const { x, y, layer } = piece.position;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      while (this.isValidPosition(newX, newY, layer)) {
        moves.push({ x: newX, y: newY, layer });
        newX += dx;
        newY += dy;
      }
    }

    // Layer movement
    for (let newLayer = 0; newLayer <= 2; newLayer++) {
      if (newLayer !== layer && this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private getKingMoves(piece: ChessPiece, moves: Position[]): void {
    const { x, y, layer } = piece.position;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dx, dy] of directions) {
      if (this.isValidPosition(x + dx, y + dy, layer)) {
        moves.push({ x: x + dx, y: y + dy, layer });
      }
    }

    // Layer movement
    for (let newLayer = 0; newLayer <= 2; newLayer++) {
      if (newLayer !== layer && this.isValidPosition(x, y, newLayer)) {
        moves.push({ x, y, layer: newLayer });
      }
    }
  }

  private isValidPosition(x: number, y: number, layer: number): boolean {
    if (x < 0 || x > 7 || y < 0 || y > 7 || layer < 0 || layer > 2) {
      return false;
    }

    const targetPiece = this.getPieceAtPosition({ x, y, layer });
    return !targetPiece || targetPiece.color !== this.gameState.currentTurn;
  }

  private wouldResultInCheck(piece: ChessPiece, targetPos: Position): boolean {
    // Create a temporary game state
    const tempGameState = this.createTempGameState();
    
    // Make the move in the temporary state
    this.applyMoveToTempState(tempGameState, piece, targetPos);

    // Check if the king is in check in the temporary state
    return this.isKingInCheck(tempGameState, piece.color);
  }

  private createTempGameState(): GameState {
    return JSON.parse(JSON.stringify(this.gameState));
  }

  private applyMoveToTempState(state: GameState, piece: ChessPiece, targetPos: Position): void {
    const tempPiece = state.pieces.find(p => 
      p.position.x === piece.position.x && 
      p.position.y === piece.position.y && 
      p.position.layer === piece.position.layer
    );
    if (!tempPiece) return;

    // Remove any captured piece
    const capturedPiece = state.pieces.find(p => 
      p.position.x === targetPos.x && 
      p.position.y === targetPos.y && 
      p.position.layer === targetPos.layer
    );

    if (capturedPiece) {
      if (capturedPiece.color === 'white') {
        state.pieces.white = state.pieces.white.filter(p => 
          p.position.x !== capturedPiece.position.x || 
          p.position.y !== capturedPiece.position.y || 
          p.position.layer !== capturedPiece.position.layer
        );
      } else {
        state.pieces.black = state.pieces.black.filter(p => 
          p.position.x !== capturedPiece.position.x || 
          p.position.y !== capturedPiece.position.y || 
          p.position.layer !== capturedPiece.position.layer
        );
      }
    }

    // Update piece position
    tempPiece.position = targetPos;
  }

  private isKingInCheck(state: GameState, color: PieceColor): boolean {
    // Find the king
    const king = state.pieces.find(p => p.type === 'king' && p.color === color);
    if (!king) return false;

    // Check if any opponent piece can capture the king
    return state.pieces
      .filter(p => p.color !== color)
      .some(piece => {
        const moves = this.getBasicMoves(piece);
        return moves.some(move => 
          move.x === king.position.x && 
          move.y === king.position.y && 
          move.layer === king.position.layer
        );
      });
  }

  public validateLayerTransition(from: Position, to: Position): boolean {
    // Check if the layers are adjacent
    const fromLayer = from.layer;
    const toLayer = to.layer;

    // Layer transition rules
    if (fromLayer === toLayer) return true;
    if (Math.abs(fromLayer - toLayer) > 1) return false;

    const piece = this.getPieceAtPosition(from);
    if (!piece) return false;

    // Special rules for different pieces
    switch (piece.type) {
      case 'knight':
        // Knights can jump to any layer
        return true;
      case 'king':
      case 'queen':
        // Can move to adjacent layers
        return Math.abs(fromLayer - toLayer) === 1;
      case 'bishop':
        // Can move to adjacent layers diagonally
        return Math.abs(fromLayer - toLayer) === 1 &&
               Math.abs(from.x - to.x) === 1 &&
               Math.abs(from.y - to.y) === 1;
      case 'rook':
        // Can move to adjacent layers vertically
        return Math.abs(fromLayer - toLayer) === 1 &&
               from.x === to.x &&
               from.y === to.y;
      case 'pawn':
        // Can only capture diagonally across layers
        return Math.abs(fromLayer - toLayer) === 1 &&
               Math.abs(from.x - to.x) === 1 &&
               this.getPieceAtPosition(to) !== null;
      default:
        return false;
    }
  }

  public getLayerTransitionCost(piece: ChessPiece): number {
    // Define movement costs for different pieces
    switch (piece.type) {
      case 'knight':
        return 1; // Knights are efficient at layer transitions
      case 'king':
      case 'queen':
        return 2; // Powerful pieces have moderate cost
      case 'bishop':
      case 'rook':
        return 3; // Sliding pieces have higher cost
      case 'pawn':
        return 4; // Pawns have highest cost for layer transitions
      default:
        return Infinity;
    }
  }
}
