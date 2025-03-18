'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaEnvelope, FaCode, FaGamepad, FaTrophy } from 'react-icons/fa';
import { socketClient } from '@/lib/socket';

interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  difficulties: string[];
  color: string;
}

const gameModes: GameMode[] = [
  {
    id: 'singleplayer',
    title: 'Single Player',
    description: 'Challenge yourself against our advanced AI opponent with multiple difficulty levels',
    icon: <FaGamepad className="w-8 h-8" />,
    difficulties: ['Beginner', 'Intermediate', 'Expert'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'multiplayer',
    title: 'Multiplayer',
    description: 'Play against other players from around the world in real-time matches',
    icon: <FaTrophy className="w-8 h-8" />,
    difficulties: ['Casual', 'Ranked', 'Tournament'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'practice',
    title: 'Practice Mode',
    description: 'Learn and improve your chess skills with interactive tutorials and puzzles',
    icon: <FaCode className="w-8 h-8" />,
    difficulties: ['Tutorial', 'Puzzles', 'Analysis'],
    color: 'from-green-500 to-green-600'
  }
];

export default function GameModeSelection() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Connect to WebSocket and set up callbacks
    socketClient.setCallbacks({
      onMove: () => {},
      onGameEnd: () => {},
      onError: (message) => {
        console.error('Socket error:', message);
      },
      onActiveUsersUpdate: (count) => {
        setActiveUsers(count);
        setIsConnecting(false);
      }
    }, 'lobby');

    socketClient.connect();

    // Request active users count periodically
    const interval = setInterval(() => {
      socketClient.requestActiveUsers();
    }, 10000); // Update every 10 seconds

    // Initial request
    socketClient.requestActiveUsers();

    return () => {
      clearInterval(interval);
      socketClient.disconnect();
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header with animated background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x"></div>
        <header className="relative pt-16 pb-12 text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            3D Chess
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-light text-gray-300"
          >
            Experience chess in a whole new dimension
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-green-400 font-semibold"
          >
            {isConnecting ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <span>{activeUsers} players online now</span>
            )}
          </motion.div>
        </header>
      </div>

      {/* Game Mode Selection */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {gameModes.map((mode) => (
            <motion.div
              key={mode.id}
              variants={item}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`relative h-full transform transition-all duration-300 ${
                selectedMode?.id === mode.id ? 'ring-2 ring-white' : ''
              }`}
              onClick={() => setSelectedMode(mode)}
            >
              <div className="h-full bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-6 text-white/90 group-hover:scale-110 transform transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {mode.title}
                  </h3>
                  <p className="text-gray-400 mb-6 flex-grow">{mode.description}</p>
                  <div className={`h-1 w-full rounded-full bg-gradient-to-r ${mode.color} group-hover:h-2 transition-all duration-300`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Difficulty Selection with enhanced animations */}
        {selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Select Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {selectedMode.difficulties.map((difficulty) => (
                <motion.button
                  key={difficulty}
                  variants={item}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-6 rounded-lg text-center transition-all transform ${
                    selectedDifficulty === difficulty
                      ? 'bg-white/20 border-2 border-white shadow-lg shadow-white/10'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  <span className="text-lg font-semibold">{difficulty}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Game Button with enhanced animation */}
        {selectedMode && selectedDifficulty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 text-center"
          >
            <Link
              href={`/game?mode=${selectedMode.id}&difficulty=${selectedDifficulty.toLowerCase()}`}
              className="inline-block"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-16 py-5 rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:shadow-purple-500/20"
              >
                Start Game
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Game Features with enhanced visuals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Game Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 transform transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-5xl mb-6 text-blue-400">🎮</div>
              <h3 className="text-xl font-bold mb-4">3D Graphics</h3>
              <p className="text-gray-400">Immersive 3D chess experience with beautiful animations</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-6 text-purple-400">🏆</div>
              <h3 className="text-xl font-bold mb-4">Ranking System</h3>
              <p className="text-gray-400">Compete with players and climb the leaderboard</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 transform transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
            >
              <div className="text-5xl mb-6 text-pink-400">📱</div>
              <h3 className="text-xl font-bold mb-4">Cross Platform</h3>
              <p className="text-gray-400">Play on any device with responsive design</p>
            </motion.div>
          </div>
        </motion.div>

        {/* About Section with modern design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-32 mb-24"
        >
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              About 3D Chess
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold mb-6 text-blue-400">Our Vision</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  3D Chess reimagines the classic game of strategy in a stunning three-dimensional space. 
                  We've combined cutting-edge web technologies with timeless gameplay to create an 
                  immersive experience that challenges players to think in new dimensions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    React
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    Three.js
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    TypeScript
                  </span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold mb-6 text-purple-400">Features & Innovation</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-3">🎯</span>
                    <span>Advanced AI opponents with multiple difficulty levels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">🌐</span>
                    <span>Real-time multiplayer matches with players worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">📊</span>
                    <span>Comprehensive statistics and performance tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">🎓</span>
                    <span>Interactive tutorials and learning resources</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer with enhanced design */}
      <footer className="py-16 bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  3D Chess
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Experience chess like never before with our immersive 3D platform.
                  Join thousands of players worldwide in this revolutionary chess experience.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      Leaderboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                      Tutorials
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6 text-white">Connect</h3>
                <div className="flex space-x-6">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://github.com/raghv-m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaGithub size={28} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://www.linkedin.com/in/raghav-mahajan-17611b24b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaLinkedin size={28} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="mailto:raaghvv0508@gmail.com"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEnvelope size={28} />
                  </motion.a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-gray-400">
                © 2024 3D Chess. Built with React, Three.js, and TypeScript.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 