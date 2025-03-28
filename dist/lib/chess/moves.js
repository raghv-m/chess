"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveValidator = void 0;
class MoveValidator {
    constructor(gameState) {
        this.gameState = gameState;
    }
    validateMove(from, to) {
        const piece = this.getPieceAtPosition(from);
        if (!piece)
            return false;
        // Check if it's the correct player's turn
        if (piece.color !== this.gameState.currentTurn)
            return false;
        // Get valid moves for the piece
        const validMoves = this.getValidMovesForPiece(piece);
        // Check if the target position is in the valid moves
        return validMoves.some(move => move.x === to.x &&
            move.y === to.y &&
            move.layer === to.layer);
    }
    getPieceAtPosition(pos) {
        return this.gameState.pieces.find((p) => p.position.x === pos.x &&
            p.position.y === pos.y &&
            p.position.layer === pos.layer) || null;
    }
    getValidMovesForPiece(piece) {
        const moves = [];
        // Get basic moves based on piece type
        const basicMoves = this.getBasicMoves(piece);
        // Filter out moves that would result in check
        return basicMoves.filter(move => !this.wouldResultInCheck(piece, move));
    }
    getBasicMoves(piece) {
        // This would contain the same move generation logic as in the engine
        // For brevity, we'll just return an empty array here
        return [];
    }
    wouldResultInCheck(piece, targetPos) {
        // Create a temporary game state
        const tempGameState = this.createTempGameState();
        // Make the move in the temporary state
        this.applyMoveToTempState(tempGameState, piece, targetPos);
        // Check if the king is in check in the temporary state
        return this.isKingInCheck(tempGameState, piece.color);
    }
    createTempGameState() {
        return JSON.parse(JSON.stringify(this.gameState));
    }
    applyMoveToTempState(state, piece, targetPos) {
        const tempPiece = state.pieces.find((p) => p.id === piece.id);
        if (!tempPiece)
            return;
        // Remove any captured piece
        const capturedPiece = state.pieces.find((p) => p.position.x === targetPos.x &&
            p.position.y === targetPos.y &&
            p.position.layer === targetPos.layer);
        if (capturedPiece) {
            if (capturedPiece.color === 'white') {
                state.pieces.white = state.pieces.white.filter((p) => p.id !== capturedPiece.id);
            }
            else {
                state.pieces.black = state.pieces.black.filter((p) => p.id !== capturedPiece.id);
            }
        }
        // Update piece position
        tempPiece.position = targetPos;
    }
    isKingInCheck(state, color) {
        // Find the king
        const king = state.pieces.find((p) => p.type === 'king' && p.color === color);
        if (!king)
            return false;
        // Check if any opponent piece can capture the king
        return state.pieces
            .filter((p) => p.color !== color)
            .some((piece) => {
            const moves = this.getBasicMoves(piece);
            return moves.some(move => move.x === king.position.x &&
                move.y === king.position.y &&
                move.layer === king.position.layer);
        });
    }
    validateLayerTransition(from, to) {
        // Check if the layers are adjacent
        const fromLayer = from.layer;
        const toLayer = to.layer;
        // Layer transition rules
        if (fromLayer === toLayer)
            return true;
        if (Math.abs(fromLayer - toLayer) > 1)
            return false;
        const piece = this.getPieceAtPosition(from);
        if (!piece)
            return false;
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
    getLayerTransitionCost(piece) {
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
exports.MoveValidator = MoveValidator;
//# sourceMappingURL=moves.js.map