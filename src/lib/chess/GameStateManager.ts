import { ChessPiece, GameState, Move, Position, PieceColor, LayerIndex } from '@/types/index';

export class GameStateManager {
  private history: GameState[] = [];
  private currentIndex: number = -1;

  constructor(private initialState: GameState) {
    this.pushState(initialState);
  }

  private pushState(state: GameState): void {
    // Remove any future states if we're in the middle of the history
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(state)));
    this.currentIndex++;
  }

  public getCurrentState(): GameState {
    return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
  }

  public applyMove(move: Move): void {
    const newState = this.getCurrentState();
    
    // Update piece position
    const piece = newState.pieces.find((p: { position: { x: number; y: number; layer: number; }; }) => 
      p.position.x === move.piece.position.x && 
      p.position.y === move.piece.position.y && 
      p.position.layer === move.piece.position.layer
    );
    if (!piece) return;

    // Remove captured piece if any
    if (move.captured) {
      if (move.captured.color === 'white') {
        newState.pieces.white = newState.pieces.white.filter((p: { position: { x: number; y: number; layer: number; }; }) => 
          p.position.x !== move.captured!.position.x || 
          p.position.y !== move.captured!.position.y || 
          p.position.layer !== move.captured!.position.layer
        );
      } else {
        newState.pieces.black = newState.pieces.black.filter((p: { position: { x: number; y: number; layer: number; }; }) => 
          p.position.x !== move.captured!.position.x || 
          p.position.y !== move.captured!.position.y || 
          p.position.layer !== move.captured!.position.layer
        );
      }
    }

    // Update piece position
    piece.position = move.to;
    piece.hasMoved = true;

    // Switch turns
    newState.currentTurn = newState.currentTurn === 'white' ? 'black' : 'white';

    // Add move to history
    newState.moves.push(move);

    // Update game state
    this.updateGameState(newState);

    // Save new state
    this.pushState(newState);
  }

  public undo(): boolean {
    if (this.currentIndex <= 0) return false;

    this.currentIndex--;
    return true;
  }

  public redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    return true;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private updateGameState(state: GameState): void {
    const currentColor = state.currentTurn;
    
    // Check if current player is in check
    state.isCheck = this.isKingInCheck(state, currentColor);

    // Get all possible moves for current player
    const allMoves = this.getAllPossibleMoves(state, currentColor);

    // If no moves are available
    if (allMoves.length === 0) {
      if (state.isCheck) {
        state.isCheckmate = true;
      } else {
        state.isStalemate = true;
      }
    }
  }

  private isKingInCheck(state: GameState, color: PieceColor): boolean {
    const king = state.pieces.find((p: { type: string; color: string; }) => p.type === 'king' && p.color === color);
    if (!king) return false;

    return state.pieces
      .filter((p: { color: string; }) => p.color !== color)
      .some((piece: ChessPiece) => this.canPieceAttackPosition(state, piece, king.position));
  }

  private canPieceAttackPosition(state: GameState, piece: ChessPiece, position: Position): boolean {
    // This would use the move validation logic from the chess engine
    // For now, we'll implement a basic check
    const moves = this.getValidMovesForPiece(state, piece);
    return moves.some(move => 
      move.to.x === position.x && 
      move.to.y === position.y && 
      move.to.layer === position.layer
    );
  }

  private getAllPossibleMoves(state: GameState, color: PieceColor): Move[] {
    return state.pieces
      .filter((p: { color: string; }) => p.color === color)
      .flatMap((piece: ChessPiece) => this.getValidMovesForPiece(state, piece));
  }

  private getValidMovesForPiece(state: GameState, piece: ChessPiece): Move[] {
    // This would use the move generation logic from the chess engine
    // For now, we'll implement a basic version that allows moving to any empty square
    const moves: Move[] = [];
    const board = state.board;
    
    // Check all possible positions
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const targetPiece = board[layer][y][x];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push({
              from: piece.position,
              to: { x, y, layer: layer as LayerIndex },
              piece,
              captured: targetPiece || undefined
            });
          }
        }
      }
    }
    
    return moves;
  }

  public getMoveHistory(): Move[] {
    return this.getCurrentState().moves;
  }

  public getPositionHistory(): Position[][] {
    return this.history.map(state => 
      [...state.pieces.white, ...state.pieces.black].map((piece: ChessPiece) => piece.position)
    );
  }

  public exportGame(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex
    });
  }

  public importGame(gameData: string): void {
    const data = JSON.parse(gameData);
    this.history = data.history;
    this.currentIndex = data.currentIndex;
  }

  public resetGame(): void {
    this.history = [this.initialState];
    this.currentIndex = 0;
  }
} 