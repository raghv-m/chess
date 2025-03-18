"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowToPlayModal = HowToPlayModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const fa_1 = require("react-icons/fa");
function HowToPlayModal({ onClose }) {
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-white", children: "How to Play Multilayer Chess" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(fa_1.FaTimes, { className: "w-6 h-6" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 text-gray-300", children: [(0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-white mb-2", children: "Basic Rules" }), (0, jsx_runtime_1.jsx)("p", { children: "Multilayer Chess follows traditional chess rules with an exciting twist: pieces can move between three different layers of the board!" })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-white mb-2", children: "Layer Movement" }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc list-inside space-y-2", children: [(0, jsx_runtime_1.jsx)("li", { children: "Knights can jump between any layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Queens and Kings can move to adjacent layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Bishops can move diagonally between adjacent layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Rooks can move vertically between adjacent layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Pawns can only capture diagonally across layers" })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-white mb-2", children: "Special Rules" }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc list-inside space-y-2", children: [(0, jsx_runtime_1.jsx)("li", { children: "Check and checkmate can occur across layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Castling is only allowed within the same layer" }), (0, jsx_runtime_1.jsx)("li", { children: "En passant captures work between adjacent layers" }), (0, jsx_runtime_1.jsx)("li", { children: "Pawn promotion occurs on the 8th rank of any layer" })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-white mb-2", children: "Controls" }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc list-inside space-y-2", children: [(0, jsx_runtime_1.jsx)("li", { children: "Click and drag pieces to move them" }), (0, jsx_runtime_1.jsx)("li", { children: "Use the mouse wheel or pinch gesture to zoom" }), (0, jsx_runtime_1.jsx)("li", { children: "Right-click and drag to rotate the board" }), (0, jsx_runtime_1.jsx)("li", { children: "Double-click a layer to focus on it" })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-white mb-2", children: "Game Modes" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Local Game:" }), " Play against a friend on the same device"] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "AI Opponent:" }), " Challenge our chess AI with different difficulty levels"] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Online Multiplayer:" }), " Play against players worldwide with chat support"] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-8 text-center", children: (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors", children: "Got it!" }) })] }) }));
}
//# sourceMappingURL=HowToPlayModal.js.map