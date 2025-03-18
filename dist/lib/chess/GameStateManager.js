"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateManager = void 0;
class GameStateManager {
    constructor(initialState) {
        this.initialState = initialState;
        this.history = [];
        this.currentIndex = -1;
        this.pushState(initialState);
    }
    pushState(state) {
        // Remove any future states if we're in the middle of the history
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        // Add new state
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.currentIndex++;
    }
    getCurrentState() {
        return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
    }
    applyMove(move) {
        const newState = this.getCurrentState();
        // Update piece position
        const piece = newState.pieces.find(p => p.id === move.piece.id);
        if (!piece)
            return;
        // Remove captured piece if any
        if (move.capturedPiece) {
            if (move.capturedPiece.color === 'white') {
                newState.pieces.white = newState.pieces.white.filter(p => p.id !== move.capturedPiece.id);
            }
            else {
                newState.pieces.black = newState.pieces.black.filter(p => p.id !== move.capturedPiece.id);
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
    undo() {
        if (this.currentIndex <= 0)
            return false;
        this.currentIndex--;
        return true;
    }
    redo() {
        if (this.currentIndex >= this.history.length - 1)
            return false;
        this.currentIndex++;
        return true;
    }
    canUndo() {
        return this.currentIndex > 0;
    }
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    updateGameState(state) {
        const currentColor = state.currentTurn;
        // Check if current player is in check
        state.isCheck = this.isKingInCheck(state, currentColor);
        // Get all possible moves for current player
        const allMoves = this.getAllPossibleMoves(state, currentColor);
        // If no moves are available
        if (allMoves.length === 0) {
            if (state.isCheck) {
                state.isCheckmate = true;
            }
            else {
                state.isStalemate = true;
            }
        }
    }
    isKingInCheck(state, color) {
        const king = state.pieces.find(p => p.type === 'king' && p.color === color);
        if (!king)
            return false;
        return state.pieces
            .filter(p => p.color !== color)
            .some(piece => this.canPieceAttackPosition(state, piece, king.position));
    }
    canPieceAttackPosition(state, piece, position) {
        // This would use the move validation logic from the chess engine
        // For brevity, we'll return false
        return false;
    }
    getAllPossibleMoves(state, color) {
        return state.pieces
            .filter(p => p.color === color)
            .flatMap(piece => this.getValidMovesForPiece(state, piece));
    }
    getValidMovesForPiece(state, piece) {
        // This would use the move generation logic from the chess engine
        // For brevity, we'll return an empty array
        return [];
    }
    getMoveHistory() {
        return this.getCurrentState().moves;
    }
    getPositionHistory() {
        return this.history.map(state => [...state.pieces.white, ...state.pieces.black].map((piece) => piece.position));
    }
    exportGame() {
        return JSON.stringify({
            history: this.history,
            currentIndex: this.currentIndex
        });
    }
    importGame(gameData) {
        const data = JSON.parse(gameData);
        this.history = data.history;
        this.currentIndex = data.currentIndex;
    }
    resetGame() {
        this.history = [this.initialState];
        this.currentIndex = 0;
    }
}
exports.GameStateManager = GameStateManager;
//# sourceMappingURL=GameStateManager.js.map