import { ChessPiece, Position, PieceType, PieceColor, Move, GameState, LayerIndex, BoardLayer, PiecesCollection } from '@/types';

export class ChessEngine {
  private state: GameState;
  private readonly BOARD_SIZE = 8;
  private readonly NUM_LAYERS = 3;
  private board: BoardLayer[];

  constructor() {
    this.board = this.createEmptyBoard();
    this.state = this.createInitialState();
    this.initializeBoard();
  }

  private createEmptyBoard(): BoardLayer[] {
    return Array(this.NUM_LAYERS).fill(null).map(() => 
      Array(this.BOARD_SIZE).fill(null).map(() => 
        Array(this.BOARD_SIZE).fill(null)
      )
    );
  }

  private createInitialState(): GameState {
    const board = Array(this.NUM_LAYERS).fill(null).map(() => 
      Array(this.BOARD_SIZE).fill(null).map(() => 
        Array(this.BOARD_SIZE).fill(null)
      )
    );

    const whitePieces: ChessPiece[] = [];
    const blackPieces: ChessPiece[] = [];
    const allPieces = () => [...whitePieces, ...blackPieces];

    const piecesCollection: PiecesCollection = {
      white: whitePieces,
      black: blackPieces,
      find: (predicate: (p: ChessPiece) => boolean) => allPieces().find(predicate),
      filter: (predicate: (p: ChessPiece) => boolean) => allPieces().filter(predicate),
      some: (predicate: (p: ChessPiece) => boolean) => allPieces().some(predicate),
      flatMap: <T>(callback: (p: ChessPiece) => T[]) => allPieces().flatMap(callback),
      push: (piece: ChessPiece) => {
        if (piece.color === 'white') {
          whitePieces.push(piece);
        } else {
          blackPieces.push(piece);
        }
      }
    };

    return {
      board,
      currentTurn: 'white',
      isCheckmate: false,
      isStalemate: false,
      isCheck: false,
      moves: [],
      pieces: piecesCollection, // Assign the PiecesCollection object here
      capturedPieces: {
        white: [],
        black: []
      }
    };
  }

  private initializeBottomLayer(layer: (ChessPiece | null)[][]): void {
    // Place pawns
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      layer[1][i] = {
        type: 'pawn',
        color: 'white',
        position: {
          x: i, y: 1, layer: 0,
          z: 0
        },
        hasMoved: false,
        id: `pawn-white-0-${i}`
      };
      layer[6][i] = {
        type: 'pawn',
        color: 'black',
        position: {
          x: i, y: 6, layer: 0,
          z: 0
        },
        hasMoved: false,
        id: `pawn-black-0-${i}`
      };
    }

    // Place other pieces
    const backRowPieces: PieceType[] = [
      'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      layer[0][i] = {
        type: backRowPieces[i],
        color: 'white',
        position: {
          x: i, y: 0, layer: 0,
          z: 0
        },
        hasMoved: false,
        id: `${backRowPieces[i]}-white-0-${i}`
      };
      layer[7][i] = {
        type: backRowPieces[i],
        color: 'black',
        position: {
          x: i, y: 7, layer: 0,
          z: 0
        },
        hasMoved: false,
        id: `${backRowPieces[i]}-black-0-${i}`
      };
    }
  }

  private initializeMiddleLayer(layer: (ChessPiece | null)[][]): void {
    // Add special pieces in the middle layer
    layer[3][2] = {
      type: 'knight',
      color: 'white',
      position: {
        x: 2, y: 3, layer: 1,
        z: 0
      },
      hasMoved: false,
      id: 'knight-white-1-2'
    };
    layer[3][5] = {
      type: 'bishop',
      color: 'white',
      position: {
        x: 5, y: 3, layer: 1,
        z: 0
      },
      hasMoved: false,
      id: 'bishop-white-1-5'
    };
    layer[4][2] = {
      type: 'knight',
      color: 'black',
      position: {
        x: 2, y: 4, layer: 1,
        z: 0
      },
      hasMoved: false,
      id: 'knight-black-1-2'
    };
    layer[4][5] = {
      type: 'bishop',
      color: 'black',
      position: {
        x: 5, y: 4, layer: 1,
        z: 0
      },
      hasMoved: false,
      id: 'bishop-black-1-5'
    };
  }

  private initializeTopLayer(layer: (ChessPiece | null)[][]): void {
    // Top layer starts empty but can be used for promoted pieces
    for (let y = 0; y < this.BOARD_SIZE; y++) {
      for (let x = 0; x < this.BOARD_SIZE; x++) {
        layer[y][x] = null;
      }
    }
  }

  private initializeBoard(): void {
    // Initialize pieces on the bottom layer (0)
    this.initializeBottomLayer(this.board[0]);
    
    // Initialize special pieces on middle layer (1)
    this.initializeMiddleLayer(this.board[1]);
    
    // Initialize pieces on top layer (2)
    this.initializeTopLayer(this.board[2]);
  }

  private addPiece(piece: ChessPiece): void {
    this.state.pieces.push(piece);
    this.board[piece.position.layer][piece.position.y][piece.position.x] = piece;
  }

  public getValidMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    
    if (piece.color !== this.state.currentTurn) return moves;

    switch (piece.type) {
      case 'pawn':
        moves.push(...this.getPawnMoves(piece));
        break;
      case 'rook':
        moves.push(...this.getRookMoves(piece));
        break;
      case 'knight':
        moves.push(...this.getKnightMoves(piece));
        break;
      case 'bishop':
        moves.push(...this.getBishopMoves(piece));
        break;
      case 'queen':
        moves.push(...this.getQueenMoves(piece));
        break;
      case 'king':
        moves.push(...this.getKingMoves(piece));
        break;
    }

    // Filter moves that would put or leave the king in check
    return moves.filter(move => !this.wouldBeInCheck(piece, move));
  }

  public getPieceAt(position: Position): ChessPiece | null {
    if (!this.isValidPosition(position)) return null;
    return this.board[position.layer][position.y][position.x];
  }

  private getPawnMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;

    // Forward move
    const forward: Position = {
      x: piece.position.x,
      y: piece.position.y + direction,
      layer: piece.position.layer,
      z: 0
    };

    if (this.isValidPosition(forward) && !this.getPieceAt(forward)) {
      moves.push(forward);

      // Double move from starting position
      if (piece.position.y === startRank) {
        const doubleForward: Position = {
          x: piece.position.x,
          y: piece.position.y + (direction * 2),
          layer: piece.position.layer,
          z: 0
        };
        if (!this.getPieceAt(doubleForward)) {
          moves.push(doubleForward);
        }
      }
    }

    // Captures (including layer transitions)
    const captureMoves = [
      { x: piece.position.x - 1, y: piece.position.y + direction },
      { x: piece.position.x + 1, y: piece.position.y + direction }
    ];

    captureMoves.forEach(move => {
      // Same layer captures
      const sameLayerCapture: Position = {
        ...move, layer: piece.position.layer,
        z: 0
      };
      if (this.isValidPosition(sameLayerCapture)) {
        const targetPiece = this.getPieceAt(sameLayerCapture);
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(sameLayerCapture);
        }
      }

      // Layer transitions (if applicable)
      const adjacentLayers = this.getAdjacentLayers(piece.position.layer);
      adjacentLayers.forEach(layer => {
        const layerCapture: Position = {
          ...move, layer,
          z: 0
        };
        if (this.isValidPosition(layerCapture)) {
          const targetPiece = this.getPieceAt(layerCapture);
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push(layerCapture);
          }
        }
      });
    });

    return moves;
  }

  private getRookMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    directions.forEach(([dx, dy]) => {
      let x = piece.position.x + dx;
      let y = piece.position.y + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const pos: Position = {
          x,
          y,
          layer: piece.position.layer as LayerIndex,
          z: 0
        };
        const targetPiece = this.getPieceAt(pos);

        if (!targetPiece) {
          moves.push(pos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(pos);
          }
          break;
        }

        x += dx;
        y += dy;
      }
    });

    // Add layer transition moves
    this.getAdjacentLayers(piece.position.layer as LayerIndex).forEach(layer => {
      const layerMove: Position = {
        x: piece.position.x,
        y: piece.position.y,
        layer,
        z: 0
      };
      if (!this.getPieceAt(layerMove)) {
        moves.push(layerMove);
      }
    });

    return moves;
  }

  private getKnightMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dx, dy]) => {
      const pos: Position = {
        x: piece.position.x + dx,
        y: piece.position.y + dy,
        layer: piece.position.layer,
        z: 0
      };

      if (this.isValidPosition(pos)) {
        const targetPiece = this.getPieceAt(pos);
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(pos);
        }
      }
    });

    // Knights can jump between any layers
    const validLayers: LayerIndex[] = [0, 1, 2] as LayerIndex[];
    validLayers.forEach(layer => {
      if (layer !== piece.position.layer) {
        const layerMove: Position = {
          x: piece.position.x,
          y: piece.position.y,
          layer,
          z: 0
        };
        if (!this.getPieceAt(layerMove)) {
          moves.push(layerMove);
        }
      }
    });

    return moves;
  }

  private getBishopMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    directions.forEach(([dx, dy]) => {
      let x = piece.position.x + dx;
      let y = piece.position.y + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const pos: Position = {
          x,
          y,
          layer: piece.position.layer as LayerIndex,
          z: 0
        };
        const targetPiece = this.getPieceAt(pos);

        if (!targetPiece) {
          moves.push(pos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(pos);
          }
          break;
        }

        x += dx;
        y += dy;
      }
    });

    return moves;
  }

  private getQueenMoves(piece: ChessPiece): Position[] {
    return [
      ...this.getRookMoves(piece),
      ...this.getBishopMoves(piece)
    ];
  }

  private getKingMoves(piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      const pos: Position = {
        x: piece.position.x + dx,
        y: piece.position.y + dy,
        layer: piece.position.layer,
        z: 0
      };

      if (this.isValidPosition(pos)) {
        const targetPiece = this.getPieceAt(pos);
        if (!targetPiece || targetPiece.color !== piece.color) {
          // Only add the move if it doesn't put the king in check
          if (!this.wouldBeInCheck(piece, pos)) {
            moves.push(pos);
          }
        }
      }
    });

    // Add layer transitions (king can only move to adjacent layers)
    this.getAdjacentLayers(piece.position.layer).forEach(layer => {
      const layerMove: Position = {
        x: piece.position.x,
        y: piece.position.y,
        layer,
        z: 0
      };
      if (!this.getPieceAt(layerMove) && !this.wouldBeInCheck(piece, layerMove)) {
        moves.push(layerMove);
      }
    });

    return moves;
  }

  private getAdjacentLayers(layer: LayerIndex): LayerIndex[] {
    switch (layer) {
      case 0: return [1 as LayerIndex];
      case 1: return [0 as LayerIndex, 2 as LayerIndex];
      case 2: return [1 as LayerIndex];
      default: return [];
    }
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 &&
           pos.y >= 0 && pos.y < 8 &&
           pos.layer >= 0 && pos.layer < 3;
  }

  private wouldBeInCheck(piece: ChessPiece, move: Position): boolean {
    // Create a temporary board state
    const originalPosition = { ...piece.position };
    const capturedPiece = this.getPieceAt(move);
    
    // Make the move
    this.board[piece.position.layer][piece.position.y][piece.position.x] = null;
    piece.position = move;
    this.board[move.layer][move.y][move.x] = piece;

    // Check if the king is in check
    const isInCheck = this.isKingInCheck(piece.color);

    // Undo the move
    piece.position = originalPosition;
    this.board[originalPosition.layer][originalPosition.y][originalPosition.x] = piece;
    this.board[move.layer][move.y][move.x] = capturedPiece;

    return isInCheck;
  }

  private isKingInCheck(color: PieceColor): boolean {
    // Find the king
    const king = this.state.pieces.find(p => p.type === 'king' && p.color === color);
    if (!king) return false;

    // Check if any opponent piece can capture the king
    return this.state.pieces
      .filter(p => p.color !== color)
      .some(piece => {
        const moves = this.getValidMoves(piece);
        return moves.some(move => 
          move.x === king.position.x &&
          move.y === king.position.y &&
          move.layer === king.position.layer
        );
      });
  }

  public makeMove(from: Position, to: Position): boolean {
    const piece = this.getPieceAt(from);
    if (!piece) return false;

    const validMoves = this.getValidMoves(piece);
    const isValidMove = validMoves.some(move => 
      move.x === to.x && move.y === to.y && move.layer === to.layer
    );

    if (!isValidMove) return false;

    const capturedPiece = this.getPieceAt(to);
    
    // Update board state
    this.board[from.layer][from.y][from.x] = null;
    this.board[to.layer][to.y][to.x] = piece;
    piece.position = to;
    piece.hasMoved = true;

    // Record move
    const move: Move = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined,
      isLayerMove: from.layer !== to.layer
    };
    this.state.moves.push(move);

    // Remove captured piece from pieces array
    if (capturedPiece) {
      this.state.pieces = this.state.pieces.filter(p => p !== capturedPiece);
    }

    // Switch turns
    this.state.currentTurn = this.state.currentTurn === 'white' ? 'black' : 'white';

    // Update game state
    this.updateGameState();

    return true;
  }

  private updateGameState(): void {
    const currentColor = this.state.currentTurn;
    
    // Check if current player is in check
    this.state.isCheck = this.isKingInCheck(currentColor);

    // Get all possible moves for current player
    const allMoves = this.state.pieces
      .filter(p => p.color === currentColor)
      .flatMap(piece => this.getValidMoves(piece));

    // If no moves are available
    if (allMoves.length === 0) {
      if (this.state.isCheck) {
        this.state.isCheckmate = true;
      } else {
        this.state.isStalemate = true;
      }
    }
  }

  public getGameState(): GameState {
    return { ...this.state };
  }

  public getBoard(): BoardLayer[] {
    return this.board;
  }
}