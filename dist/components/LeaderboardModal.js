"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardModal = LeaderboardModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const fa_1 = require("react-icons/fa");
const react_1 = require("react");
function LeaderboardModal({ onClose }) {
    const [timeFrame, setTimeFrame] = (0, react_1.useState)('all');
    // Mock data - replace with real data from your backend
    const players = [
        { rank: 1, username: "GrandMaster123", rating: 2400, wins: 150, losses: 30, winStreak: 8 },
        { rank: 2, username: "ChessWizard", rating: 2350, wins: 140, losses: 35, winStreak: 5 },
        { rank: 3, username: "StrategyKing", rating: 2300, wins: 130, losses: 40, winStreak: 3 },
        // Add more players...
    ];
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return (0, jsx_runtime_1.jsx)(fa_1.FaCrown, { className: "text-yellow-400 w-6 h-6" });
            case 2:
                return (0, jsx_runtime_1.jsx)(fa_1.FaMedal, { className: "text-gray-400 w-6 h-6" });
            case 3:
                return (0, jsx_runtime_1.jsx)(fa_1.FaMedal, { className: "text-amber-600 w-6 h-6" });
            default:
                return (0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 font-mono w-6 text-center", children: rank });
        }
    };
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-gray-800 rounded-xl p-6 max-w-3xl w-full mx-4 shadow-2xl", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-white", children: "Global Leaderboard" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-white transition-colors", children: (0, jsx_runtime_1.jsx)(fa_1.FaTimes, { className: "w-6 h-6" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 flex space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setTimeFrame('all'), className: `px-4 py-2 rounded-lg transition-colors ${timeFrame === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "All Time" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setTimeFrame('month'), className: `px-4 py-2 rounded-lg transition-colors ${timeFrame === 'month'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "This Month" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setTimeFrame('week'), className: `px-4 py-2 rounded-lg transition-colors ${timeFrame === 'week'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "This Week" })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-left", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { className: "text-gray-400 border-b border-gray-700", children: [(0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "Rank" }), (0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "Player" }), (0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "Rating" }), (0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "W/L" }), (0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "Win Rate" }), (0, jsx_runtime_1.jsx)("th", { className: "py-3 px-4", children: "Streak" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "text-gray-300", children: players.map((player) => ((0, jsx_runtime_1.jsxs)("tr", { className: "border-b border-gray-700 hover:bg-gray-700/50 transition-colors", children: [(0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 flex items-center", children: getRankIcon(player.rank) }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 font-semibold text-white", children: player.username }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4", children: player.rating }), (0, jsx_runtime_1.jsxs)("td", { className: "py-3 px-4", children: [player.wins, "/", player.losses] }), (0, jsx_runtime_1.jsxs)("td", { className: "py-3 px-4", children: [((player.wins / (player.wins + player.losses)) * 100).toFixed(1), "%"] }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4", children: (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400", children: [player.winStreak, " \u2191"] }) })] }, player.username))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 text-center text-gray-400 text-sm", children: "Rankings update every hour. Keep playing to improve your position!" })] }) }));
}
//# sourceMappingURL=LeaderboardModal.js.map