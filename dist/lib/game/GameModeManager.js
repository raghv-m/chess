"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModeManager = void 0;
const engine_1 = require("../chess/engine");
const GameManager_1 = require("../multiplayer/GameManager");
const ChessAI_1 = require("../ai/ChessAI");
const DatabaseService_1 = require("../auth/DatabaseService");
class GameModeManager {
    constructor() {
        this.NUM_LAYERS = 1;
        this.BOARD_SIZE = 8;
        this.gameMode = 'local';
        this.callbacks = {};
        this.isHandlingOpponentMove = false;
        this.currentPlayer = 'white';
        this.engine = new engine_1.ChessEngine();
        this.gameState = this.createInitialState();
        this.db = new DatabaseService_1.InMemoryDatabaseService();
    }
    createInitialState() {
        const board = Array(this.NUM_LAYERS).fill(null).map(() => Array(this.BOARD_SIZE).fill(null).map(() => Array(this.BOARD_SIZE).fill(null)));
        const whitePieces = [];
        const blackPieces = [];
        const allPieces = () => [...whitePieces, ...blackPieces];
        return {
            board,
            currentTurn: 'white',
            isCheckmate: false,
            isStalemate: false,
            isCheck: false,
            moves: [],
            pieces: {
                white: whitePieces,
                black: blackPieces,
                find: (predicate) => allPieces().find(predicate),
                filter: (predicate) => allPieces().filter(predicate),
                some: (predicate) => allPieces().some(predicate),
                flatMap: (callback) => allPieces().flatMap(callback),
                push: (piece) => {
                    if (piece.color === 'white') {
                        whitePieces.push(piece);
                    }
                    else {
                        blackPieces.push(piece);
                    }
                }
            },
            capturedPieces: {
                white: [],
                black: []
            }
        };
    }
    initializeGameMode(mode, options = {}) {
        this.gameMode = mode;
        this.currentUser = options.user;
        switch (mode) {
            case 'local':
                this.playerColor = 'white';
                break;
            case 'ai':
                this.playerColor = 'white';
                this.aiDifficulty = options.difficulty || 'beginner';
                this.ai = new ChessAI_1.ChessAI(this.aiDifficulty);
                break;
            case 'multiplayer':
                if (!options.user || !options.serverUrl) {
                    throw new Error('User and server URL are required for multiplayer mode');
                }
                this.multiplayerManager = new GameManager_1.MultiplayerGameManager(options.user, options.serverUrl, this.db);
                this.setupMultiplayerCallbacks();
                break;
        }
        this.gameState = this.createInitialState();
    }
    setupMultiplayerCallbacks() {
        if (!this.multiplayerManager)
            return;
        this.multiplayerManager.setCallbacks({
            onGameStart: (opponent, color) => {
                this.callbacks.onGameStart?.(opponent);
                this.playerColor = color;
            },
            onMove: (move) => {
                if (!this.isHandlingOpponentMove) {
                    this.isHandlingOpponentMove = true;
                    this.engine.makeMove(move.from, move.to);
                    this.callbacks.onMove?.(move);
                    this.isHandlingOpponentMove = false;
                }
            },
            onGameEnd: (result) => {
                this.callbacks.onGameEnd?.(result);
            },
            onError: (error) => {
                this.callbacks.onError?.(error);
            },
            onChatMessage: (message) => {
                this.callbacks.onChatMessage?.(message);
            }
        });
    }
    isValidMove(from, to) {
        const piece = this.getPieceAt(from);
        if (!piece || piece.color !== this.currentPlayer)
            return false;
        // Check if move is within board bounds
        if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7)
            return false;
        // Check if destination has a piece of the same color
        const targetPiece = this.getPieceAt(to);
        if (targetPiece && targetPiece.color === piece.color)
            return false;
        // Path checking helper
        const isPathClear = (dx, dy) => {
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
            const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
            for (let i = 1; i < steps; i++) {
                const x = from.x + stepX * i;
                const y = from.y + stepY * i;
                if (this.getPieceAt({
                    x, y, z: from.z,
                    layer: undefined
                }))
                    return false;
            }
            return true;
        };
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        switch (piece.type) {
            case 'pawn': {
                const direction = piece.color === 'white' ? -1 : 1;
                const startRank = piece.color === 'white' ? 6 : 1;
                // Basic forward move
                if (dx === 0 && dy === direction && !targetPiece) {
                    return true;
                }
                // Initial two-square move
                if (dx === 0 && from.y === startRank && dy === 2 * direction) {
                    return !targetPiece && isPathClear(0, direction * 2);
                }
                // Capture moves
                if (absDx === 1 && dy === direction) {
                    // Regular capture
                    if (targetPiece && targetPiece.color !== piece.color) {
                        return true;
                    }
                    // En passant
                    const lastMove = this.gameState.lastMove;
                    if (lastMove && lastMove.piece.type === 'pawn' &&
                        Math.abs(lastMove.to.y - lastMove.from.y) === 2 &&
                        lastMove.to.x === to.x &&
                        lastMove.to.y === from.y) {
                        return true;
                    }
                }
                return false;
            }
            case 'knight':
                return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);
            case 'bishop':
                return absDx === absDy && isPathClear(dx, dy);
            case 'rook':
                return (dx === 0 || dy === 0) && isPathClear(dx, dy);
            case 'queen':
                return (dx === 0 || dy === 0 || absDx === absDy) && isPathClear(dx, dy);
            case 'king': {
                // Normal moves
                if (absDx <= 1 && absDy <= 1)
                    return true;
                // Castling
                if (!piece.hasMoved && dy === 0 && absDx === 2) {
                    const rookX = dx > 0 ? 7 : 0;
                    const rook = this.getPieceAt({
                        x: rookX, y: from.y, z: from.z,
                        layer: undefined
                    });
                    if (!rook || rook.type !== 'rook' || rook.hasMoved)
                        return false;
                    // Check if path is clear
                    return isPathClear(dx, 0) && !this.isKingInCheck(piece.color);
                }
                return false;
            }
            default:
                return false;
        }
    }
    isKingInCheck(color) {
        // Find king position
        let kingPos = null;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.getPieceAt({
                    x, y, z: 0,
                    layer: undefined
                });
                if (piece?.type === 'king' && piece.color === color) {
                    kingPos = { x, y, z: 0, layer: 0 };
                    break;
                }
            }
            if (kingPos)
                break;
        }
        if (!kingPos)
            return false;
        // Check if any opponent piece can capture the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.getPieceAt({
                    x, y, z: 0,
                    layer: undefined
                });
                if (piece?.color === opponentColor) {
                    if (this.isValidMove({
                        x, y, z: 0,
                        layer: undefined
                    }, kingPos)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getPieceAt(pos) {
        return this.gameState.board[pos.z][pos.y][pos.x];
    }
    async makeMove(from, to) {
        if (this.isHandlingOpponentMove)
            return false;
        if (!this.isValidMove(from, to))
            return false;
        const piece = this.getPieceAt(from);
        if (!piece)
            return false;
        const capturedPiece = this.getPieceAt(to);
        const move = {
            from,
            to,
            piece,
            captured: capturedPiece || undefined,
            isCheck: false,
            isCheckmate: false,
            isCastling: piece.type === 'king' && Math.abs(to.x - from.x) === 2,
            isEnPassant: piece.type === 'pawn' && Math.abs(from.x - to.x) === 1 && !capturedPiece
        };
        // Handle special moves
        if (move.isCastling) {
            const rookX = to.x > from.x ? 7 : 0;
            const newRookX = to.x > from.x ? to.x - 1 : to.x + 1;
            const rook = this.getPieceAt({
                x: rookX, y: from.y, z: from.z,
                layer: undefined
            });
            if (rook) {
                this.gameState.board[from.z][from.y][rookX] = null;
                this.gameState.board[from.z][from.y][newRookX] = {
                    ...rook,
                    position: {
                        x: newRookX, y: from.y, z: from.z,
                        layer: undefined
                    },
                    hasMoved: true
                };
            }
        }
        // Make the move
        this.gameState.board[from.z][from.y][from.x] = null;
        this.gameState.board[to.z][to.y][to.x] = {
            ...piece,
            position: to,
            hasMoved: true
        };
        // Update game state
        this.gameState.lastMove = move;
        this.gameState.currentTurn = this.gameState.currentTurn === 'white' ? 'black' : 'white';
        this.gameState.moves.push(move);
        // Check for check/checkmate
        const opponentColor = piece.color === 'white' ? 'black' : 'white';
        this.gameState.isCheck = this.isKingInCheck(opponentColor);
        move.isCheck = this.gameState.isCheck;
        // Handle move based on game mode
        switch (this.gameMode) {
            case 'multiplayer':
                if (this.multiplayerManager) {
                    return this.multiplayerManager.makeMove(from, to);
                }
                break;
            case 'ai':
                if (this.ai) {
                    this.callbacks.onMove?.(move);
                    const aiMove = await this.ai.getNextMove(this.gameState);
                    if (aiMove) {
                        return this.makeMove(aiMove.from, aiMove.to);
                    }
                }
                break;
            case 'local':
                this.callbacks.onMove?.(move);
                return true;
        }
        return false;
    }
    sendChatMessage(message) {
        if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
            this.multiplayerManager.sendChatMessage(message);
        }
        else if (this.gameMode === 'ai') {
            // AI responses
            const aiResponse = {
                id: Date.now().toString(),
                userId: 'ai',
                username: 'AI',
                message: this.getAIResponse(message),
                timestamp: Date.now(),
                sender: '',
                content: ''
            };
            this.callbacks.onChatMessage?.(aiResponse);
        }
        else if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'chat', message }));
        }
    }
    getAIResponse(message) {
        const state = this.engine.getGameState();
        // Check for common player messages
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('good game') || lowerMessage.includes('gg')) {
            return "Thanks for the game! It was a pleasure playing with you.";
        }
        if (lowerMessage.includes('draw')) {
            return "I'll consider your draw offer based on the current position.";
        }
        // Game state based responses
        if (state.isCheckmate) {
            return "Good game! Would you like to play again?";
        }
        else if (state.isCheck) {
            return "Check! Be careful with your next move.";
        }
        else {
            return "I'm analyzing the position and thinking about my next move...";
        }
    }
    resign() {
        if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
            this.multiplayerManager.resign();
        }
        else if (this.gameMode === 'ai') {
            this.callbacks.onGameEnd?.({
                winner: {
                    id: 'ai',
                    username: 'AI',
                    email: ''
                },
                reason: 'resignation'
            });
        }
    }
    offerDraw() {
        if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
            this.multiplayerManager.offerDraw();
        }
        else if (this.gameMode === 'ai') {
            // AI always accepts draw offers
            this.callbacks.onGameEnd?.({
                winner: undefined,
                reason: 'draw'
            });
        }
        else if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'drawOffer' }));
        }
    }
    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    getGameState() {
        return this.gameState;
    }
    cleanup() {
        if (this.multiplayerManager) {
            this.multiplayerManager.cleanup();
        }
        if (this.ws) {
            this.ws.close();
        }
    }
    setupWebSocket() {
        if (!this.ws)
            return;
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'gameStart':
                    this.callbacks.onGameStart?.(data.opponent);
                    break;
                case 'move':
                    this.makeMove(data.from, data.to);
                    break;
                case 'chat':
                    this.callbacks.onChatMessage?.(data.message);
                    break;
                case 'error':
                    this.callbacks.onError?.(data.message);
                    break;
            }
        };
        this.ws.onclose = () => {
            this.callbacks.onError?.('Connection closed');
        };
        this.ws.onerror = () => {
            this.callbacks.onError?.('WebSocket error occurred');
        };
    }
    createPiece(type, color, x, y) {
        return {
            type,
            color,
            position: {
                x, y, z: 0,
                layer: undefined
            },
            hasMoved: false,
            id: `${color}-${type}-${x}-${y}`
        };
    }
    isValidPosition(position) {
        return (position.x >= 0 &&
            position.x < this.BOARD_SIZE &&
            position.y >= 0 &&
            position.y < this.BOARD_SIZE &&
            position.z >= 0 &&
            position.z < this.NUM_LAYERS);
    }
    getValidMoves(piece) {
        const moves = [];
        const { x, y, z } = piece.position;
        // Add valid moves based on piece type
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? 1 : -1;
                const startRank = piece.color === 'white' ? 1 : 6;
                // Forward move
                if (this.isValidPosition({
                    x, y: y + direction, z,
                    layer: undefined
                })) {
                    moves.push({
                        x, y: y + direction, z,
                        layer: undefined
                    });
                }
                // Initial two-square move
                if (y === startRank && this.isValidPosition({
                    x, y: y + 2 * direction, z,
                    layer: undefined
                })) {
                    moves.push({
                        x, y: y + 2 * direction, z,
                        layer: undefined
                    });
                }
                // Diagonal captures
                [-1, 1].forEach(dx => {
                    const newPos = { x: x + dx, y: y + direction, z, layer: 0 };
                    if (this.isValidPosition(newPos)) {
                        moves.push(newPos);
                    }
                });
                break;
            case 'knight':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dx, dy]) => {
                    const newPos = { x: x + dx, y: y + dy, z, layer: 0 };
                    if (this.isValidPosition(newPos)) {
                        moves.push(newPos);
                    }
                });
                break;
            case 'bishop':
                for (let i = 1; i < 8; i++) {
                    const directions = [
                        [i, i], [i, -i], [-i, i], [-i, -i]
                    ];
                    directions.forEach(([dx, dy]) => {
                        const newPos = { x: x + dx, y: y + dy, z, layer: 0 };
                        if (this.isValidPosition(newPos)) {
                            moves.push(newPos);
                        }
                    });
                }
                break;
            case 'rook':
                for (let i = 1; i < 8; i++) {
                    const directions = [
                        [0, i], [0, -i], [i, 0], [-i, 0]
                    ];
                    directions.forEach(([dx, dy]) => {
                        const newPos = { x: x + dx, y: y + dy, z, layer: 0 };
                        if (this.isValidPosition(newPos)) {
                            moves.push(newPos);
                        }
                    });
                }
                break;
            case 'queen':
                // Queen combines bishop and rook moves
                for (let i = 1; i < 8; i++) {
                    const directions = [
                        [0, i], [0, -i], [i, 0], [-i, 0],
                        [i, i], [i, -i], [-i, i], [-i, -i]
                    ];
                    directions.forEach(([dx, dy]) => {
                        const newPos = { x: x + dx, y: y + dy, z, layer: 0 };
                        if (this.isValidPosition(newPos)) {
                            moves.push(newPos);
                        }
                    });
                }
                break;
            case 'king':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                kingMoves.forEach(([dx, dy]) => {
                    const newPos = { x: x + dx, y: y + dy, z, layer: 0 };
                    if (this.isValidPosition(newPos)) {
                        moves.push(newPos);
                    }
                });
                break;
        }
        return moves;
    }
    evaluatePosition(state, color) {
        let score = 0;
        const pieceValues = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0
        };
        // Material evaluation
        state.pieces.white.forEach(piece => {
            if (piece.color === color) {
                score += pieceValues[piece.type];
            }
            else {
                score -= pieceValues[piece.type];
            }
        });
        // Position evaluation
        state.pieces.white.forEach(piece => {
            if (piece.color === color) {
                score += this.evaluatePiecePosition(piece);
            }
            else {
                score -= this.evaluatePiecePosition(piece);
            }
        });
        // Mobility evaluation
        const mobilityScore = this.evaluateMobility(state, color);
        score += mobilityScore * 0.1;
        // King safety evaluation
        const kingSafetyScore = this.evaluateKingSafety(state, color);
        score += kingSafetyScore * 0.2;
        // Center control evaluation
        const centerControlScore = this.evaluateCenterControl(state, color);
        score += centerControlScore * 0.15;
        return score;
    }
    evaluatePiecePosition(piece) {
        const position = piece.position;
        const centerBonus = 0.1;
        const edgePenalty = -0.1;
        // Center control bonus
        if (position.x >= 2 && position.x <= 5 && position.y >= 2 && position.y <= 5) {
            return centerBonus;
        }
        // Edge penalty
        if (position.x === 0 || position.x === 7 || position.y === 0 || position.y === 7) {
            return edgePenalty;
        }
        // Piece-specific position bonuses
        switch (piece.type) {
            case 'knight':
                return this.evaluateKnightPosition(position);
            case 'bishop':
                return this.evaluateBishopPosition(position);
            case 'rook':
                return this.evaluateRookPosition(position);
            case 'queen':
                return this.evaluateQueenPosition(position);
            case 'king':
                return this.evaluateKingPosition(position);
            default:
                return 0;
        }
    }
    evaluateKnightPosition(pos) {
        const centerBonus = 0.2;
        const mobilityBonus = 0.1;
        let score = 0;
        // Center control bonus
        if (pos.x >= 2 && pos.x <= 5 && pos.y >= 2 && pos.y <= 5) {
            score += centerBonus;
        }
        // Mobility bonus based on number of possible moves
        const moves = this.getValidMoves({ type: 'knight', color: 'white', position: pos, hasMoved: true, id: '' });
        score += moves.length * mobilityBonus;
        return score;
    }
    evaluateBishopPosition(pos) {
        const longDiagonalBonus = 0.2;
        const mobilityBonus = 0.1;
        let score = 0;
        // Long diagonal bonus
        if (pos.x === pos.y || pos.x + pos.y === 7) {
            score += longDiagonalBonus;
        }
        // Mobility bonus
        const moves = this.getValidMoves({ type: 'bishop', color: 'white', position: pos, hasMoved: true, id: '' });
        score += moves.length * mobilityBonus;
        return score;
    }
    evaluateRookPosition(pos) {
        const openFileBonus = 0.2;
        const seventhRankBonus = 0.3;
        let score = 0;
        // Open file bonus
        const hasPawnsInFile = this.gameState.pieces.white.some(p => p.type === 'pawn' && p.position.x === pos.x);
        if (!hasPawnsInFile) {
            score += openFileBonus;
        }
        // Seventh rank bonus
        if (pos.y === 6) {
            score += seventhRankBonus;
        }
        return score;
    }
    evaluateQueenPosition(pos) {
        const earlyGamePenalty = -0.5;
        const mobilityBonus = 0.1;
        let score = 0;
        // Early game development penalty
        if (this.gameState.moves.length < 10) {
            score += earlyGamePenalty;
        }
        // Mobility bonus
        const moves = this.getValidMoves({ type: 'queen', color: 'white', position: pos, hasMoved: true, id: '' });
        score += moves.length * mobilityBonus;
        return score;
    }
    evaluateKingPosition(pos) {
        const castlingBonus = 0.3;
        const centerPenalty = -0.2;
        let score = 0;
        // Castling bonus
        if (pos.x === 6 || pos.x === 2) {
            score += castlingBonus;
        }
        // Center penalty in early game
        if (this.gameState.moves.length < 20 && pos.x >= 2 && pos.x <= 5) {
            score += centerPenalty;
        }
        return score;
    }
    evaluateMobility(state, color) {
        let totalMoves = 0;
        state.pieces.white.forEach(piece => {
            if (piece.color === color) {
                totalMoves += this.getValidMoves(piece).length;
            }
        });
        return totalMoves;
    }
    evaluateKingSafety(state, color) {
        const king = state.pieces.white.find(p => p.type === 'king' && p.color === color);
        if (!king)
            return 0;
        let score = 0;
        const pos = king.position;
        // Pawn shield bonus
        const pawnShield = this.countPawnShield(state, color, pos);
        score += pawnShield * 0.2;
        // King mobility penalty
        const kingMoves = this.getValidMoves(king).length;
        score -= (8 - kingMoves) * 0.1;
        // Check penalty
        if (this.isKingInCheck(color)) {
            score -= 1;
        }
        return score;
    }
    countPawnShield(state, color, kingPos) {
        let count = 0;
        const pawnPositions = [
            { x: kingPos.x - 1, y: kingPos.y },
            { x: kingPos.x, y: kingPos.y },
            { x: kingPos.x + 1, y: kingPos.y }
        ];
        pawnPositions.forEach(pos => {
            if (state.pieces.white.some(p => p.type === 'pawn' &&
                p.color === color &&
                p.position.x === pos.x &&
                p.position.y === pos.y)) {
                count++;
            }
        });
        return count;
    }
    evaluateCenterControl(state, color) {
        const centerSquares = [
            { x: 3, y: 3 }, { x: 3, y: 4 },
            { x: 4, y: 3 }, { x: 4, y: 4 }
        ];
        let score = 0;
        centerSquares.forEach(square => {
            const piece = state.pieces.white.find(p => p.position.x === square.x &&
                p.position.y === square.y);
            if (piece) {
                score += piece.color === color ? 0.25 : -0.25;
            }
        });
        return score;
    }
    getAllPossibleMoves(state, color) {
        const moves = [];
        const pieces = color === 'white' ? state.pieces.white : state.pieces.black;
        pieces.forEach(piece => {
            const validPositions = this.getValidMoves(piece);
            validPositions.forEach(to => {
                moves.push({
                    from: piece.position,
                    to,
                    piece,
                    captured: state.pieces.white.find(p => p.position.x === to.x && p.position.y === to.y) || undefined,
                    isCheck: false,
                    isCheckmate: false,
                    isCastling: piece.type === 'king' && Math.abs(to.x - piece.position.x) === 2,
                    isEnPassant: piece.type === 'pawn' && Math.abs(piece.position.x - to.x) === 1
                });
            });
        });
        return moves;
    }
    async getBestMove(state, color, depth = 3) {
        const moves = this.getAllPossibleMoves(state, color);
        if (moves.length === 0)
            return null;
        let bestMove = null;
        let bestScore = color === 'white' ? -Infinity : Infinity;
        for (const move of moves) {
            const newState = this.applyMoveToState(state, move);
            const score = await this.minimax(newState, depth - 1, color === 'white' ? 'black' : 'white', -Infinity, Infinity);
            if (color === 'white' && score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            else if (color === 'black' && score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
    async minimax(state, depth, color, alpha, beta) {
        if (depth === 0) {
            return this.evaluatePosition(state, color);
        }
        const moves = this.getAllPossibleMoves(state, color);
        if (moves.length === 0) {
            return this.evaluatePosition(state, color);
        }
        if (color === 'white') {
            let maxScore = -Infinity;
            for (const move of moves) {
                const newState = this.applyMoveToState(state, move);
                const score = await this.minimax(newState, depth - 1, 'black', alpha, beta);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha)
                    break;
            }
            return maxScore;
        }
        else {
            let minScore = Infinity;
            for (const move of moves) {
                const newState = this.applyMoveToState(state, move);
                const score = await this.minimax(newState, depth - 1, 'white', alpha, beta);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha)
                    break;
            }
            return minScore;
        }
    }
    applyMoveToState(state, move) {
        const newState = JSON.parse(JSON.stringify(state));
        const piece = newState.pieces.white.find((p) => p.id === move.piece.id);
        if (!piece)
            return newState;
        // Remove captured piece
        if (move.captured) {
            if (move.captured.color === 'white') {
                newState.pieces.white = newState.pieces.white.filter((p) => p.id !== move.captured.id);
            }
            else {
                newState.pieces.black = newState.pieces.black.filter((p) => p.id !== move.captured.id);
            }
        }
        // Update piece position
        piece.position = move.to;
        piece.hasMoved = true;
        return newState;
    }
    async makeAIMove() {
        if (!this.ai)
            return;
        const bestMove = await this.getBestMove(this.gameState, 'black');
        if (bestMove) {
            await this.makeMove(bestMove.from, bestMove.to);
        }
    }
}
exports.GameModeManager = GameModeManager;
//# sourceMappingURL=GameModeManager.js.map