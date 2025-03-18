"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameControls = GameControls;
const jsx_runtime_1 = require("react/jsx-runtime");
function GameControls({ onResign, onOfferDraw, onToggleChat, onToggleRotation }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "absolute bottom-4 left-4 flex space-x-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onResign, className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors", children: "Resign" }), (0, jsx_runtime_1.jsx)("button", { onClick: onOfferDraw, className: "px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-lg transition-colors", children: "Offer Draw" }), (0, jsx_runtime_1.jsx)("button", { onClick: onToggleChat, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors", children: "Toggle Chat" }), (0, jsx_runtime_1.jsx)("button", { onClick: onToggleRotation, className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors", children: "Toggle Rotation" })] }));
}
//# sourceMappingURL=GameControls.js.map