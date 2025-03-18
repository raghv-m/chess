"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessGame = ChessGame;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const GameModeManager_1 = require("../lib/game/GameModeManager");
const ChessBoard_1 = require("./ChessBoard");
const ChatBox_1 = require("./ChatBox");
const GameControls_1 = require("./GameControls");
// Mock database service
const mockDb = {
    getUserStats: async () => ({
        rating: 1200,
        wins: 0,
        losses: 0,
        draws: 0,
        gamesPlayed: 0,
        winStreak: 0
    }),
    updateUserStats: async () => { },
    getTopPlayers: async () => [],
    getMatchHistory: async () => []
};
const createInitialBoard = () => {
    // Create deep copies of arrays to prevent reference issues
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
    // Initialize board with proper structure
    const board = [
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
    ];
    return {
        board,
        currentTurn: 'white',
        isCheckmate: false,
        isStalemate: false,
        moves: []
    };
};
const INITIAL_BOARD = createInitialBoard();
function ChessGame({ gameState: initialGameState, onMove }) {
    const [gameManager, setGameManager] = (0, react_1.useState)();
    const [currentGameState, setCurrentGameState] = (0, react_1.useState)(initialGameState || {
        board: [Array(8).fill(Array(8).fill(null))],
        currentTurn: 'white',
        isCheckmate: false,
        isStalemate: false,
        moves: []
    });
    const [selectedMode, setSelectedMode] = (0, react_1.useState)('local');
    const [selectedSquare, setSelectedSquare] = (0, react_1.useState)();
    const [chatMessages, setChatMessages] = (0, react_1.useState)([]);
    const [showChat, setShowChat] = (0, react_1.useState)(true);
    const [isRotating, setIsRotating] = (0, react_1.useState)(false);
    const controlsRef = (0, react_1.useRef)();
    // Initialize game manager
    (0, react_1.useEffect)(() => {
        const manager = new GameModeManager_1.GameModeManager(mockDb);
        setGameManager(manager);
        const initialState = manager.getGameState();
        if (initialState?.board?.[0]) {
            setCurrentGameState(initialState);
        }
        return () => {
            manager.cleanup();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (initialGameState) {
            setCurrentGameState(initialGameState);
        }
    }, [initialGameState]);
    // Start game mode
    const startGame = async () => {
        if (!gameManager)
            return;
        const testUser = {
            id: 'test123',
            username: 'TestPlayer',
            email: 'test@example.com'
        };
        await gameManager.initializeGameMode(selectedMode, {
            difficulty: 'intermediate',
            serverUrl: 'ws://localhost:3000',
            user: testUser
        });
        gameManager.setCallbacks({
            onGameStart: (opponent) => {
                console.log('Game started with:', opponent);
                addChatMessage({
                    id: Date.now().toString(),
                    userId: 'system',
                    username: 'System',
                    message: `Game started against ${opponent.username}`,
                    timestamp: Date.now()
                });
            },
            onGameEnd: (result) => {
                console.log('Game ended:', result);
                addChatMessage({
                    id: Date.now().toString(),
                    userId: 'system',
                    username: 'System',
                    message: `Game Over! ${result.winner ? `${result.winner} wins` : 'Draw'} by ${result.reason}`,
                    timestamp: Date.now()
                });
            }
        });
        setCurrentGameState(gameManager.getGameState());
    };
    // Handle square click
    const handleSquareClick = (position) => {
        if (!gameManager || !currentGameState)
            return;
        if (selectedSquare) {
            // Attempt to make a move
            if (onMove) {
                onMove(selectedSquare, position);
            }
            setSelectedSquare(undefined);
        }
        else {
            const piece = currentGameState.board[position.layer][position.y][position.x];
            if (piece && piece.color === currentGameState.currentTurn) {
                setSelectedSquare(position);
            }
        }
    };
    // Handle chat message
    const addChatMessage = (message) => {
        setChatMessages(prev => [...prev, message]);
    };
    const formatPosition = (pos) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return `${files[pos.x]}${pos.y + 1}${pos.layer > 0 ? ` (L${pos.layer + 1})` : ''}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-screen", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 relative", children: [(0, jsx_runtime_1.jsxs)(fiber_1.Canvas, { camera: { position: [0, 10, 10], fov: 50 }, shadows: true, className: "w-full h-full", children: [(0, jsx_runtime_1.jsx)("ambientLight", { intensity: 0.5 }), (0, jsx_runtime_1.jsx)("pointLight", { position: [10, 10, 10], castShadow: true }), (0, jsx_runtime_1.jsx)(drei_1.OrbitControls, { ref: controlsRef, enablePan: false, enableZoom: true, minPolarAngle: Math.PI / 4, maxPolarAngle: Math.PI / 2, enabled: !isRotating }), (0, jsx_runtime_1.jsx)(ChessBoard_1.ChessBoard, { gameState: currentGameState, selectedSquare: selectedSquare, onSquareClick: handleSquareClick })] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute top-4 left-4 space-y-4", children: [(0, jsx_runtime_1.jsxs)("select", { value: selectedMode, onChange: (e) => setSelectedMode(e.target.value), className: "mr-2 p-2 border rounded bg-white", children: [(0, jsx_runtime_1.jsx)("option", { value: "local", children: "Local Game" }), (0, jsx_runtime_1.jsx)("option", { value: "ai", children: "vs AI" }), (0, jsx_runtime_1.jsx)("option", { value: "multiplayer", children: "Multiplayer" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: startGame, className: "block bg-blue-500 text-white px-4 py-2 rounded", children: "Start Game" })] }), (0, jsx_runtime_1.jsx)(GameControls_1.GameControls, { onResign: () => gameManager?.resign(), onOfferDraw: () => gameManager?.offerDraw(), onToggleChat: () => setShowChat(!showChat), onToggleRotation: () => setIsRotating(!isRotating) })] }), showChat && ((0, jsx_runtime_1.jsx)(ChatBox_1.ChatBox, { messages: chatMessages, onSendMessage: (text) => {
                    addChatMessage({
                        id: Date.now().toString(),
                        userId: 'test123',
                        username: 'TestPlayer',
                        message: text,
                        timestamp: Date.now()
                    });
                } }))] }));
}
//# sourceMappingURL=ChessGame.js.map