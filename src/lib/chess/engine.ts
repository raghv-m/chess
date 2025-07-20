import {
  PieceType,
  PieceColor,
  Position,
  ChessPiece,
  Move,
  GameState,
  LayerIndex,
  GameStateData
} from '@/types/index';

export class ChessEngine {
  private board: (ChessPiece | null)[][][];
  private currentPlayer: 'white' | 'black';
  private moveHistory: Move[];
  private capturedPieces: ChessPiece[];
  private gameState: GameState;
  private enPassantTarget: Position | null;
  private castlingRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
  private readonly BOARD_SIZE = 8;
  private readonly NUM_LAYERS = 3;

  constructor() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = [];
    this.gameState = GameState.IN_PROGRESS;
    this.enPassantTarget = null;
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true
    };
    this.initializeBoard();
  }

  private createEmptyBoard(): (ChessPiece | null)[][][] {
    return Array(this.NUM_LAYERS).fill(null).map(() => 
      Array(this.BOARD_SIZE).fill(null).map(() => 
        Array(this.BOARD_SIZE).fill(null)
      )
    );
  }

  private initializeBoard(): void {
    // Initialize bottom layer (0)
    this.initializeBottomLayer(this.board[0]);
    
    // Initialize middle layer (1)
    this.initializeMiddleLayer(this.board[1]);
    
    // Initialize top layer (2) - empty
    this.initializeTopLayer(this.board[2]);
  }

  private initializeBottomLayer(layer: (ChessPiece | null)[][]): void {
    // Place pawns
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      layer[1][i] = {
        id: `pawn-white-${i}-1-0`,
        type: 'pawn',
        color: 'white',
        position: {
          x: i,
          y: 1,
          layer: 0
        },
        hasMoved: false
      };
      layer[6][i] = {
        id: `pawn-black-${i}-6-0`,
        type: 'pawn',
        color: 'black',
        position: {
          x: i,
          y: 6,
          layer: 0
        },
        hasMoved: false
      };
    }

    // Place other pieces
    const backRowPieces: PieceType[] = [
      'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      layer[0][i] = {
        id: `${backRowPieces[i]}-white-${i}-0-0`,
        type: backRowPieces[i],
        color: 'white',
        position: {
          x: i,
          y: 0,
          layer: 0
        },
        hasMoved: false
      };
      layer[7][i] = {
        id: `${backRowPieces[i]}-black-${i}-7-0`,
        type: backRowPieces[i],
        color: 'black',
        position: {
          x: i,
          y: 7,
          layer: 0
        },
        hasMoved: false
      };
    }
  }

  private initializeMiddleLayer(layer: (ChessPiece | null)[][]): void {
    // Add special pieces in the middle layer
    layer[3][2] = {
      id: 'knight-white-2-3-1',
      type: 'knight',
      color: 'white',
      position: {
        x: 2,
        y: 3,
        layer: 1
      },
      hasMoved: false
    };
    layer[3][5] = {
      id: 'bishop-white-5-3-1',
      type: 'bishop',
      color: 'white',
      position: {
        x: 5,
        y: 3,
        layer: 1
      },
      hasMoved: false
    };
    layer[4][2] = {
      id: 'knight-black-2-4-1',
      type: 'knight',
      color: 'black',
      position: {
        x: 2,
        y: 4,
        layer: 1
      },
      hasMoved: false
    };
    layer[4][5] = {
      id: 'bishop-black-5-4-1',
      type: 'bishop',
      color: 'black',
      position: {
        x: 5,
        y: 4,
        layer: 1
      },
      hasMoved: false
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

  public getValidMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece || piece.color !== this.currentPlayer) {
      return [];
    }

    const allMoves = this.getAllPossibleMoves(position);
    return allMoves.filter(move => !this.wouldMoveExposeKing(position, move));
  }

  private getAllPossibleMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];

    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        moves.push(...this.getPawnMoves(position));
        break;
      case 'rook':
        moves.push(...this.getRookMoves(position));
        break;
      case 'knight':
        moves.push(...this.getKnightMoves(position));
        break;
      case 'bishop':
        moves.push(...this.getBishopMoves(position));
        break;
      case 'queen':
        moves.push(...this.getQueenMoves(position));
        break;
      case 'king':
        moves.push(...this.getKingMoves(position));
        break;
    }

    return moves;
  }

  private getPawnMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece || piece.type !== 'pawn') return [];

    const moves: Position[] = [];
    const { x, y, layer } = position;
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;

    // Forward move
    const forwardPos = { x, y: y + direction, layer };
    if (this.isValidPosition(forwardPos) && !this.getPieceAt(forwardPos)) {
      moves.push(forwardPos);

      // Double move from starting position
      if (y === startRank) {
        const doubleForwardPos = { x, y: y + 2 * direction, layer };
        if (!this.getPieceAt(doubleForwardPos)) {
          moves.push(doubleForwardPos);
        }
      }
    }

    // Diagonal captures
    const capturePositions = [
      { x: x - 1, y: y + direction, layer },
      { x: x + 1, y: y + direction, layer }
    ];

    for (const capturePos of capturePositions) {
      if (this.isValidPosition(capturePos)) {
        const targetPiece = this.getPieceAt(capturePos);
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(capturePos);
        }
      }
    }

    // En passant
    if (this.enPassantTarget) {
      const enPassantPositions = [
        { x: x - 1, y: y + direction, layer },
        { x: x + 1, y: y + direction, layer }
      ];

      for (const enPassantPos of enPassantPositions) {
        if (this.isValidPosition(enPassantPos) && 
            enPassantPos.x === this.enPassantTarget.x && 
            enPassantPos.y === this.enPassantTarget.y &&
            enPassantPos.layer === this.enPassantTarget.layer) {
          moves.push(enPassantPos);
        }
      }
    }

    return moves;
  }

  private getRookMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    directions.forEach(([dx, dy]) => {
      let x = position.x + dx;
      let y = position.y + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const pos: Position = {
          x,
          y,
          layer: position.layer
        };
        const targetPiece = this.getPieceAt(pos);

        if (!targetPiece) {
          moves.push(pos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(pos);
          }
          break; // Stop sliding when we hit any piece
        }

        x += dx;
        y += dy;
      }
    });

    // Add layer transition moves
    this.getAdjacentLayers(position.layer as LayerIndex).forEach(layer => {
      const layerMove: Position = {
        x: position.x,
        y: position.y,
        layer: layer as LayerIndex
      };
      if (!this.getPieceAt(layerMove)) {
        moves.push(layerMove);
      }
    });

    return moves;
  }

  private getKnightMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];
    
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dx, dy]) => {
      const pos: Position = {
        x: position.x + dx,
        y: position.y + dy,
        layer: position.layer
      };

      if (this.isValidPosition(pos)) {
        const targetPiece = this.getPieceAt(pos);
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(pos);
        }
      }
    });

    // Knights can jump between any layers
    const validLayers: LayerIndex[] = [0, 1, 2];
    validLayers.forEach(layer => {
      if (layer !== piece.position.layer) {
        const layerMove: Position = {
          x: piece.position.x,
          y: piece.position.y,
          layer: layer as LayerIndex
        };
        if (!this.getPieceAt(layerMove)) {
          moves.push(layerMove);
        }
      }
    });

    return moves;
  }

  private getBishopMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    directions.forEach(([dx, dy]) => {
      let x = position.x + dx;
      let y = position.y + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const pos: Position = {
          x,
          y,
          layer: position.layer
        };
        const targetPiece = this.getPieceAt(pos);

        if (!targetPiece) {
          moves.push(pos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(pos);
          }
          break; // Stop sliding when we hit any piece
        }

        x += dx;
        y += dy;
      }
    });

    // Add layer transition moves
    this.getAdjacentLayers(position.layer as LayerIndex).forEach(layer => {
      const layerMove: Position = {
        x: position.x,
        y: position.y,
        layer: layer as LayerIndex
      };
      if (!this.getPieceAt(layerMove)) {
        moves.push(layerMove);
      }
    });

    return moves;
  }

  private getQueenMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      let x = position.x + dx;
      let y = position.y + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const pos: Position = {
          x,
          y,
          layer: position.layer
        };
        const targetPiece = this.getPieceAt(pos);

        if (!targetPiece) {
          moves.push(pos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(pos);
          }
          break; // Stop sliding when we hit any piece
        }

        x += dx;
        y += dy;
      }
    });

    // Add layer transition moves
    this.getAdjacentLayers(position.layer as LayerIndex).forEach(layer => {
      const layerMove: Position = {
        x: position.x,
        y: position.y,
        layer: layer as LayerIndex
      };
      if (!this.getPieceAt(layerMove)) {
        moves.push(layerMove);
      }
    });

    return moves;
  }

  private getKingMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      const pos: Position = {
        x: position.x + dx,
        y: position.y + dy,
        layer: position.layer
      };

      if (this.isValidPosition(pos)) {
        const targetPiece = this.getPieceAt(pos);
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(pos);
        }
      }
    });

    // Add layer transition moves
    this.getAdjacentLayers(position.layer as LayerIndex).forEach(layer => {
      const layerMove: Position = {
        x: position.x,
        y: position.y,
        layer: layer as LayerIndex
      };
      if (!this.getPieceAt(layerMove)) {
        moves.push(layerMove);
      }
    });

    // Castling
    if (piece.type === 'king' && !piece.hasMoved) {
      if (piece.color === 'white') {
        if (this.castlingRights.whiteKingside) {
          const kingsideCastle = this.canCastle(position, 'kingside');
          if (kingsideCastle) {
            moves.push({ x: 6, y: 0, layer: 0 });
          }
        }
        if (this.castlingRights.whiteQueenside) {
          const queensideCastle = this.canCastle(position, 'queenside');
          if (queensideCastle) {
            moves.push({ x: 2, y: 0, layer: 0 });
          }
        }
      } else {
        if (this.castlingRights.blackKingside) {
          const kingsideCastle = this.canCastle(position, 'kingside');
          if (kingsideCastle) {
            moves.push({ x: 6, y: 7, layer: 0 });
          }
        }
        if (this.castlingRights.blackQueenside) {
          const queensideCastle = this.canCastle(position, 'queenside');
          if (queensideCastle) {
            moves.push({ x: 2, y: 7, layer: 0 });
          }
        }
      }
    }

    return moves;
  }

  private canCastle(position: Position, side: 'kingside' | 'queenside'): boolean {
    const piece = this.getPieceAt(position);
    if (!piece || piece.type !== 'king' || piece.hasMoved) return false;

    const rookX = side === 'kingside' ? 7 : 0;
    const rookY = piece.color === 'white' ? 0 : 7;
    const rookPos = { x: rookX, y: rookY, layer: position.layer };
    const rook = this.getPieceAt(rookPos);
    
    if (!rook || rook.type !== 'rook' || rook.hasMoved || rook.color !== piece.color) {
      return false;
    }

    // Check if squares between king and rook are empty
    const startX = side === 'kingside' ? 5 : 1;
    const endX = side === 'kingside' ? 7 : 3;
    
    for (let x = startX; x <= endX; x++) {
      if (x === position.x) continue; // Skip king's position
      const pos = { x, y: position.y, layer: position.layer };
      if (this.getPieceAt(pos)) return false;
    }

    // Check if king is in check or would pass through check
    if (this.isKingInCheck(piece.color)) return false;
    
    const checkSquares = side === 'kingside' ? [5, 6] : [2, 3];
    for (const x of checkSquares) {
      if (x === position.x) continue;
      const pos = { x, y: position.y, layer: position.layer };
      if (this.isPositionUnderAttack(pos, piece.color === 'white' ? 'black' : 'white')) {
        return false;
      }
    }

    return true;
  }

  private getAdjacentLayers(layer: LayerIndex): LayerIndex[] {
    const layers: LayerIndex[] = [];
    if (layer > 0) layers.push((layer - 1) as LayerIndex);
    if (layer < 2) layers.push((layer + 1) as LayerIndex);
    return layers;
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8 && pos.layer >= 0 && pos.layer <= 2;
  }

  private wouldMoveExposeKing(from: Position, to: Position): boolean {
    const piece = this.getPieceAt(from);
    if (!piece) return true;

    // Create a temporary board state
    const tempBoard = this.cloneBoard();
    const capturedPiece = tempBoard[to.layer][to.y][to.x];
    
    // Make the move on the temporary board
    tempBoard[to.layer][to.y][to.x] = piece;
    tempBoard[from.layer][from.y][from.x] = null;

    // Check if the king is in check after the move
    return this.isKingInCheckOnBoard(piece.color, tempBoard);
  }

  private cloneBoard(): (ChessPiece | null)[][][] {
    return this.board.map(layer => 
      layer.map(row => 
        row.map(piece => piece ? { ...piece } : null)
      )
    );
  }

  private isKingInCheck(color: 'white' | 'black'): boolean {
    return this.isKingInCheckOnBoard(color, this.board);
  }

  private isKingInCheckOnBoard(color: PieceColor, board: (ChessPiece | null)[][][]): boolean {
    // Find the king
    let kingPosition: Position | null = null;
    
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[layer][y][x];
          if (piece && piece.type === 'king' && piece.color === color) {
            kingPosition = { x, y, layer: layer as LayerIndex };
            break;
          }
        }
        if (kingPosition) break;
      }
      if (kingPosition) break;
    }

    if (!kingPosition) return false;

    // Check if any opponent piece can attack the king
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isPositionUnderAttack(kingPosition, opponentColor, board);
  }

  private isPositionUnderAttack(position: Position, attackingColor: 'white' | 'black', board: (ChessPiece | null)[][][] = this.board): boolean {
    // Check all pieces of the attacking color
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = board[layer][y][x];
          if (piece && piece.color === attackingColor) {
            const moves = this.getValidMovesForPieceOnBoard(piece, board);
            if (moves.some(move => move.x === position.x && move.y === position.y && move.layer === position.layer)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private getValidMovesForPieceOnBoard(piece: ChessPiece, board: (ChessPiece | null)[][][]): Position[] {
    // This is a simplified version - in a real implementation, you'd need to duplicate the move logic
    // For now, we'll return basic moves
    const moves: Position[] = [];
    
    switch (piece.type) {
      case 'pawn':
        // Basic pawn moves
        const direction = piece.color === 'white' ? 1 : -1;
        const forwardPos = { x: piece.position.x, y: piece.position.y + direction, layer: piece.position.layer };
        if (this.isValidPosition(forwardPos) && !this.getPieceAtOnBoard(forwardPos, board)) {
          moves.push(forwardPos);
        }
        break;
      case 'knight':
        // Basic knight moves
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([dx, dy]) => {
          const pos = { x: piece.position.x + dx, y: piece.position.y + dy, layer: piece.position.layer };
          if (this.isValidPosition(pos)) {
            const targetPiece = this.getPieceAtOnBoard(pos, board);
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push(pos);
            }
          }
        });
        break;
      // Add other piece types as needed
    }
    
    return moves;
  }

  private getPieceAtOnBoard(position: Position, board: (ChessPiece | null)[][][]): ChessPiece | null {
    return board[position.layer][position.y][position.x] || null;
  }

  public makeMove(from: Position, to: Position, promotionPiece?: 'queen' | 'rook' | 'bishop' | 'knight'): boolean {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.currentPlayer) {
      return false;
    }

    const validMoves = this.getValidMoves(from);
    const isValidMove = validMoves.some(move => 
      move.x === to.x && move.y === to.y && move.layer === to.layer
    );

    if (!isValidMove) {
      return false;
    }

    // Create move record
    const capturedPiece = this.getPieceAt(to);
    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      isEnPassant: false,
      isCastling: false
    };

    // Handle special moves
    if (piece.type === 'pawn') {
      // En passant
      if (this.enPassantTarget && 
          to.x === this.enPassantTarget.x && 
          to.y === this.enPassantTarget.y &&
          to.layer === this.enPassantTarget.layer) {
        move.isEnPassant = true;
        // Remove the captured pawn
        const capturedPawnPos = { x: to.x, y: from.y, layer: from.layer };
        this.board[capturedPawnPos.layer][capturedPawnPos.y][capturedPawnPos.x] = null;
      }

      // Pawn promotion
      if ((piece.color === 'white' && to.y === 7) || (piece.color === 'black' && to.y === 0)) {
        const promotedType = promotionPiece || 'queen';
        // Replace pawn with promoted piece
        const promotedPiece: ChessPiece = {
          id: `${promotedType}-${piece.color}-${to.x}-${to.y}-${to.layer}`,
          type: promotedType,
          color: piece.color,
          position: { ...to },
          hasMoved: true
        };
        this.board[to.layer][to.y][to.x] = promotedPiece;
        this.board[from.layer][from.y][from.x] = null;
        // Remove pawn from move record (for clarity)
        move.piece = promotedPiece;
        move.promotionPiece = promotedType;
        if (capturedPiece) {
          this.capturedPieces.push(capturedPiece);
        }
        this.moveHistory.push(move);
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateGameState();
        return true;
      }

      // Set en passant target for next move
      if (Math.abs(to.y - from.y) === 2) {
        this.enPassantTarget = { x: from.x, y: (from.y + to.y) / 2, layer: from.layer };
      } else {
        this.enPassantTarget = null;
      }
    }

    // Castling
    if (piece.type === 'king' && Math.abs(to.x - from.x) === 2) {
      move.isCastling = true;
      const rookFromX = to.x > from.x ? 7 : 0;
      const rookToX = to.x > from.x ? 5 : 3;
      const rookFrom = { x: rookFromX, y: from.y, layer: from.layer };
      const rookTo = { x: rookToX, y: from.y, layer: from.layer };
      const rook = this.getPieceAt(rookFrom);
      
      if (rook) {
        this.board[rookTo.layer][rookTo.y][rookTo.x] = rook;
        this.board[rookFrom.layer][rookFrom.y][rookFrom.x] = null;
        rook.position = rookTo;
        rook.hasMoved = true;
      }
    }

    // Update castling rights
    this.updateCastlingRights(from, piece);

    // Execute the move
    this.board[to.layer][to.y][to.x] = piece;
    this.board[from.layer][from.y][from.x] = null;
    piece.position = to;
    piece.hasMoved = true;

    // Update captured pieces
    if (capturedPiece) {
      this.capturedPieces.push(capturedPiece);
    }

    // Add to move history
    this.moveHistory.push(move);

    // Switch turns
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    // Update game state
    this.updateGameState();

    return true;
  }

  private updateCastlingRights(position: Position, piece: ChessPiece): void {
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKingside = false;
        this.castlingRights.whiteQueenside = false;
      } else {
        this.castlingRights.blackKingside = false;
        this.castlingRights.blackQueenside = false;
      }
    } else if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (position.x === 0) this.castlingRights.whiteQueenside = false;
        if (position.x === 7) this.castlingRights.whiteKingside = false;
      } else {
        if (position.x === 0) this.castlingRights.blackQueenside = false;
        if (position.x === 7) this.castlingRights.blackKingside = false;
      }
    }
  }

  public undoMove(): boolean {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop()!;
    const piece = lastMove.piece;

    // Restore the piece to its original position
    this.board[lastMove.from.layer][lastMove.from.y][lastMove.from.x] = piece;
    this.board[lastMove.to.layer][lastMove.to.y][lastMove.to.x] = null;
    piece.position = lastMove.from;
    piece.hasMoved = !lastMove.piece.hasMoved; // Restore original hasMoved state

    // Restore captured piece
    if (lastMove.capturedPiece) {
      this.board[lastMove.to.layer][lastMove.to.y][lastMove.to.x] = lastMove.capturedPiece;
      this.capturedPieces.pop();
    }

    // Handle special moves
    if (lastMove.isEnPassant) {
      // Restore the captured pawn
      const capturedPawnPos = { x: lastMove.to.x, y: lastMove.from.y, layer: lastMove.from.layer };
      this.board[capturedPawnPos.layer][capturedPawnPos.y][capturedPawnPos.x] = lastMove.capturedPiece || null;
    }

    if (lastMove.isCastling) {
      // Restore rook position
      const rookFromX = lastMove.to.x > lastMove.from.x ? 5 : 3;
      const rookToX = lastMove.to.x > lastMove.from.x ? 7 : 0;
      const rookFrom = { x: rookFromX, y: lastMove.from.y, layer: lastMove.from.layer };
      const rookTo = { x: rookToX, y: lastMove.from.y, layer: lastMove.from.layer };
      const rook = this.getPieceAt(rookFrom);
      
      if (rook) {
        this.board[rookTo.layer][rookTo.y][rookTo.x] = rook;
        this.board[rookFrom.layer][rookFrom.y][rookFrom.x] = null;
        rook.position = rookTo;
        rook.hasMoved = false;
      }
    }

    // Switch turns back
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    // Update game state
    this.updateGameState();

    return true;
  }

  private updateGameState(): void {
    // Check for checkmate
    if (this.isCheckmate(this.currentPlayer)) {
      this.gameState = this.currentPlayer === 'white' ? GameState.BLACK_WINS : GameState.WHITE_WINS;
      return;
    }

    // Check for stalemate
    if (this.isStalemate(this.currentPlayer)) {
      this.gameState = GameState.STALEMATE;
      return;
    }

    // Check for insufficient material
    if (this.isInsufficientMaterial()) {
      this.gameState = GameState.DRAW;
      return;
    }

    // Check for check
    if (this.isKingInCheck(this.currentPlayer)) {
      this.gameState = GameState.IN_CHECK;
    } else {
      this.gameState = GameState.IN_PROGRESS;
    }
  }

  private isStalemate(color: 'white' | 'black'): boolean {
    // Check if the player has any legal moves
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.board[layer][y][x];
          if (piece && piece.color === color) {
            const validMoves = this.getValidMoves({ x, y, layer: layer as LayerIndex });
            if (validMoves.length > 0) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  private isInsufficientMaterial(): boolean {
    // Count pieces
    const whitePieces = this.getPiecesByColor('white');
    const blackPieces = this.getPiecesByColor('black');

    // King vs King
    if (whitePieces.length === 1 && blackPieces.length === 1) {
      return true;
    }

    // King and Knight vs King
    if ((whitePieces.length === 2 && whitePieces.some(p => p.type === 'knight')) &&
        blackPieces.length === 1) {
      return true;
    }
    if ((blackPieces.length === 2 && blackPieces.some(p => p.type === 'knight')) &&
        whitePieces.length === 1) {
      return true;
    }

    // King and Bishop vs King
    if ((whitePieces.length === 2 && whitePieces.some(p => p.type === 'bishop')) &&
        blackPieces.length === 1) {
      return true;
    }
    if ((blackPieces.length === 2 && blackPieces.some(p => p.type === 'bishop')) &&
        whitePieces.length === 1) {
      return true;
    }

    return false;
  }

  private isCheckmate(color: 'white' | 'black'): boolean {
    if (!this.isKingInCheck(color)) return false;
    
    // Check if any move can get out of check
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.board[layer][y][x];
          if (piece && piece.color === color) {
            const validMoves = this.getValidMoves({ x, y, layer: layer as LayerIndex });
            if (validMoves.length > 0) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getBoard(): (ChessPiece | null)[][][] {
    return this.board;
  }

  public getPieceAt(position: Position): ChessPiece | null {
    if (
      position.layer < 0 || position.layer > 2 ||
      position.y < 0 || position.y > 7 ||
      position.x < 0 || position.x > 7
    ) {
      return null;
    }
    return this.board[position.layer][position.y][position.x];
  }

  private getPiecesByColor(color: 'white' | 'black'): ChessPiece[] {
    const pieces: ChessPiece[] = [];
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.board[layer][y][x];
          if (piece && piece.color === color) {
            pieces.push(piece);
          }
        }
      }
    }
    return pieces;
  }

  public getCurrentPlayer(): 'white' | 'black' {
    return this.currentPlayer;
  }

  public getMoveHistory(): Move[] {
    return this.moveHistory;
  }

  public getCapturedPieces(): ChessPiece[] {
    return this.capturedPieces;
  }
}