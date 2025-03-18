"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const framer_motion_1 = require("framer-motion");
const fa_1 = require("react-icons/fa");
const HowToPlayModal_1 = require("@/components/HowToPlayModal");
const LeaderboardModal_1 = require("@/components/LeaderboardModal");
function Home() {
    const router = (0, navigation_1.useRouter)();
    const [selectedMode, setSelectedMode] = (0, react_1.useState)('local');
    const [difficulty, setDifficulty] = (0, react_1.useState)('beginner');
    const [isDarkMode, setIsDarkMode] = (0, react_1.useState)(true);
    const [isMuted, setIsMuted] = (0, react_1.useState)(true);
    const [showHowToPlay, setShowHowToPlay] = (0, react_1.useState)(false);
    const [showLeaderboard, setShowLeaderboard] = (0, react_1.useState)(false);
    const [audioPlayer, setAudioPlayer] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Initialize background music
        const audio = new Audio('/music/chess-background.mp3');
        audio.loop = true;
        setAudioPlayer(audio);
        // Check system theme preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setIsDarkMode(false);
        }
        return () => {
            audio.pause();
        };
    }, []);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Apply theme changes to document
        document.documentElement.classList.toggle('dark');
    };
    const toggleMusic = () => {
        if (audioPlayer) {
            if (isMuted) {
                audioPlayer.play();
            }
            else {
                audioPlayer.pause();
            }
            setIsMuted(!isMuted);
        }
    };
    const startGame = (mode, difficulty) => {
        const params = new URLSearchParams();
        params.set('mode', mode);
        if (difficulty) {
            params.set('difficulty', difficulty);
        }
        router.push(`/game?${params.toString()}`);
    };
    return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: `min-h-screen ${isDarkMode
            ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
            : 'bg-gradient-to-b from-blue-50 to-white text-gray-900'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: {
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                    }, transition: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }, className: "absolute" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute top-4 right-4 flex space-x-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: toggleTheme, className: "p-2 rounded-full hover:bg-gray-700 transition-colors", children: isDarkMode ? (0, jsx_runtime_1.jsx)(fa_1.FaSun, { className: "w-6 h-6" }) : (0, jsx_runtime_1.jsx)(fa_1.FaMoon, { className: "w-6 h-6" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleMusic, className: "p-2 rounded-full hover:bg-gray-700 transition-colors", children: isMuted ? (0, jsx_runtime_1.jsx)(fa_1.FaVolumeMute, { className: "w-6 h-6" }) : (0, jsx_runtime_1.jsx)(fa_1.FaVolumeUp, { className: "w-6 h-6" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 py-16", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "text-center mb-12", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-6xl font-bold mb-4", children: "Multilayer Chess" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl text-gray-300 mb-8", children: "Experience chess in multiple dimensions" }), (0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-opacity-50 backdrop-blur-sm", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-2", children: "How to Play" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300", children: "Multilayer Chess adds a new dimension to traditional chess. Pieces can move between three different boards, creating exciting new strategies and possibilities." }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowHowToPlay(true), className: "mt-4 flex items-center mx-auto space-x-2 text-blue-400 hover:text-blue-300", children: [(0, jsx_runtime_1.jsx)(fa_1.FaQuestionCircle, {}), (0, jsx_runtime_1.jsx)("span", { children: "Learn More" })] })] })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "max-w-3xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-semibold mb-6", children: "Select Game Mode" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [(0, jsx_runtime_1.jsx)(GameModeCard, { title: "Local Game", description: "Play against a friend on the same device", icon: "\uD83C\uDFAE", selected: selectedMode === 'local', onClick: () => setSelectedMode('local') }), (0, jsx_runtime_1.jsx)(GameModeCard, { title: "AI Opponent", description: "Challenge our advanced chess AI", icon: "\uD83E\uDD16", selected: selectedMode === 'ai', onClick: () => setSelectedMode('ai') }), (0, jsx_runtime_1.jsx)(GameModeCard, { title: "Online Multiplayer", description: "Play against players worldwide", icon: "\uD83C\uDF10", selected: selectedMode === 'multiplayer', onClick: () => setSelectedMode('multiplayer') })] }), selectedMode === 'ai' && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-semibold mb-4", children: "Select Difficulty" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsx)(DifficultyButton, { level: "beginner", selected: difficulty === 'beginner', onClick: () => setDifficulty('beginner') }), (0, jsx_runtime_1.jsx)(DifficultyButton, { level: "intermediate", selected: difficulty === 'intermediate', onClick: () => setDifficulty('intermediate') }), (0, jsx_runtime_1.jsx)(DifficultyButton, { level: "expert", selected: difficulty === 'expert', onClick: () => setDifficulty('expert') })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => startGame(selectedMode, selectedMode === 'ai' ? difficulty : undefined), className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors", children: "Start Game" }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2 }, className: "mt-12 text-center text-gray-400", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-semibold mb-4", children: "Game Features" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsx)(FeatureCard, { title: "Multiple Layers", description: "Play chess across multiple 3D layers", icon: "\uD83D\uDCCA" }), (0, jsx_runtime_1.jsx)(FeatureCard, { title: "Real-time Chat", description: "Chat with your opponent during the game", icon: "\uD83D\uDCAC" }), (0, jsx_runtime_1.jsx)(FeatureCard, { title: "Game History", description: "Review your past games and improve", icon: "\uD83D\uDCDC" })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.3 }, className: "mt-8 text-center", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowLeaderboard(true), className: "flex items-center mx-auto space-x-2 text-yellow-400 hover:text-yellow-300", children: [(0, jsx_runtime_1.jsx)(fa_1.FaTrophy, {}), (0, jsx_runtime_1.jsx)("span", { children: "View Leaderboard" })] }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.AnimatePresence, { children: [showHowToPlay && ((0, jsx_runtime_1.jsx)(HowToPlayModal_1.HowToPlayModal, { onClose: () => setShowHowToPlay(false) })), showLeaderboard && ((0, jsx_runtime_1.jsx)(LeaderboardModal_1.LeaderboardModal, { onClose: () => setShowLeaderboard(false) }))] })] }));
}
function GameModeCard({ title, description, icon, selected, onClick }) {
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: onClick, className: `p-6 rounded-lg text-left transition-all ${selected
            ? 'bg-blue-600 transform scale-105'
            : 'bg-gray-700 hover:bg-gray-600'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl mb-4", children: icon }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-2", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300", children: description })] }));
}
function DifficultyButton({ level, selected, onClick }) {
    const labels = {
        beginner: '👶 Beginner',
        intermediate: '👨‍🎓 Intermediate',
        expert: '🧙‍♂️ Expert'
    };
    return ((0, jsx_runtime_1.jsx)("button", { onClick: onClick, className: `p-4 rounded-lg font-semibold transition-all ${selected
            ? 'bg-blue-600 transform scale-105'
            : 'bg-gray-700 hover:bg-gray-600'}`, children: labels[level] }));
}
function FeatureCard({ title, description, icon }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 rounded-lg bg-gray-800", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl mb-4", children: icon }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-2", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300", children: description })] }));
}
//# sourceMappingURL=page.js.map