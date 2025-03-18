"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GamePage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const ChessGame_1 = require("@/components/ChessGame");
const ChatBox_1 = require("@/components/ChatBox");
const GameModeManager_1 = require("@/lib/game/GameModeManager");
const createInitialBoard = () => {
    const emptyRow = () => Array(8).fill(null);
    const whitePawns = () => Array(8).fill({ type: 'pawn', color: 'white' });
    const blackPawns = () => Array(8).fill({ type: 'pawn', color: 'black' });
    const backRow = (color) => [
        { type: 'rook', color },
        { type: 'knight', color },
        { type: 'bishop', color },
        { type: 'queen', color },
        { type: 'king', color },
        { type: 'bishop', color },
        { type: 'knight', color },
        { type: 'rook', color }
    ];
    return {
        board: [
            [
                backRow('white'),
                whitePawns(),
                emptyRow(),
                emptyRow(),
                emptyRow(),
                emptyRow(),
                blackPawns(),
                backRow('black')
            ]
        ],
        currentTurn: 'white',
        isCheckmate: false,
        isStalemate: false,
        moves: []
    };
};
function GamePage() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const mode = searchParams.get('mode');
    const difficulty = searchParams.get('difficulty');
    const [gameManager, setGameManager] = (0, react_1.useState)();
    const [gameState, setGameState] = (0, react_1.useState)(createInitialBoard());
    const [opponent, setOpponent] = (0, react_1.useState)();
    const [chatMessages, setChatMessages] = (0, react_1.useState)([]);
    const [isWaiting, setIsWaiting] = (0, react_1.useState)(mode === 'multiplayer');
    (0, react_1.useEffect)(() => {
        const initializeGame = async () => {
            const manager = new GameModeManager_1.GameModeManager();
            await manager.initializeGameMode(mode, {
                difficulty,
                serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
                user: {
                    id: 'temp-user-id',
                    username: 'Player',
                    email: ''
                }
            });
            manager.setCallbacks({
                onGameStart: (opponent) => {
                    setOpponent(opponent);
                    setIsWaiting(false);
                },
                onMove: () => {
                    setGameState(manager.getGameState());
                },
                onGameEnd: (result) => {
                    addChatMessage({
                        id: Date.now().toString(),
                        userId: 'system',
                        username: 'System',
                        message: `Game Over! ${result.winner ? `${result.winner} wins` : 'Draw'} by ${result.reason}`,
                        timestamp: Date.now()
                    });
                },
                onChatMessage: (message) => {
                    setChatMessages(prev => [...prev, message]);
                },
                onError: (error) => {
                    console.error('Game error:', error);
                    addChatMessage({
                        id: Date.now().toString(),
                        userId: 'system',
                        username: 'System',
                        message: `Error: ${error.message}`,
                        timestamp: Date.now()
                    });
                }
            });
            setGameManager(manager);
            setGameState(manager.getGameState());
        };
        initializeGame();
        return () => {
            gameManager?.cleanup();
        };
    }, [mode, difficulty]);
    const handleMove = async (from, to) => {
        if (!gameManager)
            return;
        const success = await gameManager.makeMove(from, to);
        if (success) {
            const newState = gameManager.getGameState();
            setGameState(newState);
            // Add move to chat
            const piece = gameState.board[from.layer][from.y][from.x];
            if (piece) {
                addChatMessage({
                    id: Date.now().toString(),
                    userId: 'move',
                    username: 'Move',
                    message: `${piece.color} ${piece.type} moved from ${formatPosition(from)} to ${formatPosition(to)}`,
                    timestamp: Date.now()
                });
            }
        }
    };
    const handleSendMessage = (message) => {
        if (gameManager) {
            gameManager.sendChatMessage(message);
        }
    };
    const addChatMessage = (message) => {
        setChatMessages(prev => [...prev, message]);
    };
    const formatPosition = (pos) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return `${files[pos.x]}${8 - pos.y}${pos.layer > 0 ? ` (L${pos.layer + 1})` : ''}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-screen bg-gray-900", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 relative", children: [isWaiting ? ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center text-white", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold mb-2", children: "Finding Opponent" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300", children: "Please wait while we match you with a player..." })] }) })) : null, (0, jsx_runtime_1.jsx)(ChessGame_1.ChessGame, { gameState: gameState, onMove: handleMove })] }), mode === 'multiplayer' && ((0, jsx_runtime_1.jsx)("div", { className: "w-96 bg-gray-800 border-l border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b border-gray-700", children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-white", children: opponent ? `Playing against ${opponent.username}` : 'Game Chat' }) }), (0, jsx_runtime_1.jsx)(ChatBox_1.ChatBox, { messages: chatMessages, onSendMessage: handleSendMessage })] }) }))] }));
}
//# sourceMappingURL=page.js.map