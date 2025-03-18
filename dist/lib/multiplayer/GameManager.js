"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplayerGameManager = void 0;
const socket_io_client_1 = require("socket.io-client");
const engine_1 = require("../chess/engine");
class MultiplayerGameManager {
    constructor(currentUser, serverUrl, db) {
        this.currentUser = currentUser;
        this.serverUrl = serverUrl;
        this.db = db;
        this.callbacks = {};
        this.engine = new engine_1.ChessEngine();
        this.socket = (0, socket_io_client_1.io)(serverUrl);
        this.setupSocketListeners();
    }
    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.socket.emit('auth', { userId: this.currentUser.id });
        });
        this.socket.on('game_start', (data) => {
            this.gameId = data.gameId;
            this.opponent = data.opponent;
            this.playerColor = data.color;
            this.callbacks.onGameStart?.(data.opponent, data.color);
        });
        this.socket.on('opponent_move', (data) => {
            // Get pieces before making the move
            const piece = this.engine.getPieceAt(data.move.from);
            if (!piece) {
                this.callbacks.onError?.('Invalid move: no piece at source position');
                return;
            }
            // Get captured piece and handle null/undefined conversion
            const capturedPiece = this.engine.getPieceAt(data.move.to);
            const captured = capturedPiece ?? undefined;
            if (this.engine.makeMove(data.move.from, data.move.to)) {
                const move = {
                    from: data.move.from,
                    to: data.move.to,
                    piece,
                    captured
                };
                this.callbacks.onMove?.(move);
            }
            else {
                this.callbacks.onError?.('Invalid move received');
            }
        });
        this.socket.on('chat_message', (message) => {
            this.callbacks.onChatMessage?.(message);
        });
        this.socket.on('draw_offer', (fromUser) => {
            this.callbacks.onDrawOffer?.(fromUser);
        });
        this.socket.on('game_end', (result) => {
            this.callbacks.onGameEnd?.(result);
            this.updatePlayerStats(result);
        });
        this.socket.on('error', (error) => {
            this.callbacks.onError?.(error);
        });
    }
    async makeMove(from, to) {
        if (!this.gameId || !this.playerColor) {
            this.callbacks.onError?.('No active game');
            return false;
        }
        if (this.engine.getGameState().currentTurn !== this.playerColor) {
            this.callbacks.onError?.('Not your turn');
            return false;
        }
        // Get pieces before making the move
        const piece = this.engine.getPieceAt(from);
        if (!piece) {
            this.callbacks.onError?.('No piece at source position');
            return false;
        }
        // Get captured piece and handle null/undefined conversion
        const capturedPiece = this.engine.getPieceAt(to);
        const captured = capturedPiece ?? undefined;
        if (this.engine.makeMove(from, to)) {
            const move = {
                from,
                to,
                piece,
                captured
            };
            this.socket.emit('move', {
                gameId: this.gameId,
                move,
                newState: this.engine.getGameState()
            });
            return true;
        }
        return false;
    }
    sendChatMessage(message) {
        if (!this.gameId) {
            this.callbacks.onError?.('No active game');
            return;
        }
        const chatMessage = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            username: this.currentUser.username,
            message,
            timestamp: Date.now(),
            sender: '',
            content: ''
        };
        this.socket.emit('chat', {
            gameId: this.gameId,
            message: chatMessage
        });
    }
    resign() {
        if (!this.gameId) {
            this.callbacks.onError?.('No active game');
            return;
        }
        this.socket.emit('resign', { gameId: this.gameId });
    }
    offerDraw() {
        if (!this.gameId) {
            this.callbacks.onError?.('No active game');
            return;
        }
        this.socket.emit('draw_offer', { gameId: this.gameId });
    }
    acceptDraw() {
        if (!this.gameId) {
            this.callbacks.onError?.('No active game');
            return;
        }
        this.socket.emit('accept_draw', { gameId: this.gameId });
    }
    rejectDraw() {
        if (!this.gameId) {
            this.callbacks.onError?.('No active game');
            return;
        }
        this.socket.emit('reject_draw', { gameId: this.gameId });
    }
    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    async updatePlayerStats(result) {
        const stats = await this.db.getUserStats(this.currentUser.id);
        if (result.winner) {
            if (result.winner.id === this.currentUser.id) {
                stats.wins++;
                stats.winStreak++;
                stats.rating += 20;
            }
            else {
                stats.losses++;
                stats.winStreak = 0;
                stats.rating = Math.max(0, stats.rating - 15);
            }
        }
        else {
            stats.draws++;
            stats.winStreak = 0;
            stats.rating += 5;
        }
        stats.gamesPlayed++;
        await this.db.updateUserStats(this.currentUser.id, stats);
    }
    cleanup() {
        this.socket.disconnect();
    }
    getGameState() {
        return this.engine.getGameState();
    }
    getCurrentPlayer() {
        return this.playerColor;
    }
    getOpponent() {
        return this.opponent;
    }
}
exports.MultiplayerGameManager = MultiplayerGameManager;
//# sourceMappingURL=GameManager.js.map