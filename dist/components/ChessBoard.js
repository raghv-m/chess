"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessBoard = ChessBoard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const PieceGeometry_1 = require("./PieceGeometry");
function ChessBoard({ gameState, selectedSquare, onSquareClick }) {
    const boardRef = (0, react_1.useRef)();
    const SQUARE_SIZE = 1;
    const BOARD_SIZE = 8;
    // Generate board squares
    const squares = (0, react_1.useMemo)(() => {
        const result = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const isLight = (x + y) % 2 === 0;
                const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                result.push({
                    position: [
                        x * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2,
                        0,
                        y * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2
                    ],
                    color: isLight ? '#f0d9b5' : '#b58863',
                    selected: isSelected,
                    coords: { x, y, layer: 0 }
                });
            }
        }
        return result;
    }, [selectedSquare]);
    // Generate pieces
    const pieces = (0, react_1.useMemo)(() => {
        const result = [];
        const board = gameState.board[0]; // Use only the first layer
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const piece = board[y][x];
                if (piece) {
                    result.push({
                        piece,
                        position: [
                            x * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2,
                            0.5, // Lift pieces slightly above board
                            y * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2
                        ],
                        coords: { x, y, layer: 0 }
                    });
                }
            }
        }
        return result;
    }, [gameState.board]);
    // Board animation
    (0, fiber_1.useFrame)((state) => {
        if (boardRef.current) {
            boardRef.current.rotation.y += 0.001;
        }
    });
    return ((0, jsx_runtime_1.jsxs)("group", { ref: boardRef, children: [squares.map((square, i) => ((0, jsx_runtime_1.jsxs)("mesh", { position: square.position, onClick: () => onSquareClick(square.coords), receiveShadow: true, children: [(0, jsx_runtime_1.jsx)("boxGeometry", { args: [SQUARE_SIZE, 0.1, SQUARE_SIZE] }), (0, jsx_runtime_1.jsx)("meshStandardMaterial", { color: square.color, emissive: square.selected ? '#2196f3' : '#000000', emissiveIntensity: square.selected ? 0.5 : 0 })] }, i))), pieces.map((piece, i) => ((0, jsx_runtime_1.jsx)("group", { position: piece.position, children: (0, jsx_runtime_1.jsx)(PieceGeometry_1.PieceGeometry, { type: piece.piece.type, color: piece.piece.color, onClick: () => onSquareClick(piece.coords) }) }, i))), squares
                .filter(square => square.coords.y === 0)
                .map((square, i) => ((0, jsx_runtime_1.jsxs)("group", { children: [(0, jsx_runtime_1.jsx)(drei_1.Text, { position: [
                            square.position[0],
                            -0.1,
                            square.position[2] - SQUARE_SIZE / 2 - 0.3
                        ], rotation: [-Math.PI / 2, 0, 0], fontSize: 0.3, color: "#000000", children: String.fromCharCode(97 + square.coords.x) }), square.coords.x === 0 && ((0, jsx_runtime_1.jsx)(drei_1.Text, { position: [
                            square.position[0] - SQUARE_SIZE / 2 - 0.3,
                            -0.1,
                            square.position[2]
                        ], rotation: [-Math.PI / 2, 0, 0], fontSize: 0.3, color: "#000000", children: 8 - square.coords.y }))] }, `label-${i}`)))] }));
}
//# sourceMappingURL=ChessBoard.js.map