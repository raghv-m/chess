"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieceGeometry = PieceGeometry;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const drei_1 = require("@react-three/drei");
function PieceGeometry({ type, color, onClick }) {
    const meshRef = (0, react_1.useRef)(null);
    // Basic geometry for each piece type
    const geometry = () => {
        switch (type) {
            case 'pawn':
                return (0, jsx_runtime_1.jsx)("cylinderGeometry", { args: [0.2, 0.3, 0.5] });
            case 'rook':
                return (0, jsx_runtime_1.jsx)("boxGeometry", { args: [0.4, 0.6, 0.4] });
            case 'knight':
                return (0, jsx_runtime_1.jsx)("cylinderGeometry", { args: [0.2, 0.3, 0.6] });
            case 'bishop':
                return (0, jsx_runtime_1.jsx)("coneGeometry", { args: [0.3, 0.8, 8] });
            case 'queen':
                return (0, jsx_runtime_1.jsx)("cylinderGeometry", { args: [0.3, 0.3, 0.9] });
            case 'king':
                return (0, jsx_runtime_1.jsx)("cylinderGeometry", { args: [0.3, 0.3, 1] });
            default:
                return (0, jsx_runtime_1.jsx)("boxGeometry", { args: [0.4, 0.4, 0.4] });
        }
    };
    return ((0, jsx_runtime_1.jsxs)("mesh", { ref: meshRef, onClick: onClick, castShadow: true, receiveShadow: true, children: [geometry(), (0, jsx_runtime_1.jsx)("meshStandardMaterial", { color: color === 'white' ? '#ffffff' : '#333333', metalness: 0.5, roughness: 0.5 })] }));
}
// Preload models
drei_1.useGLTF.preload('/models/chess-pieces.glb');
//# sourceMappingURL=PieceGeometry.js.map