'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute, FaMoon, FaSun, FaTrophy, FaQuestionCircle } from 'react-icons/fa';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';

export default function Home() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'local' | 'ai' | 'multiplayer'>('local');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
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
      } else {
        audioPlayer.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const startGame = (mode: string, difficulty?: string) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (difficulty) {
      params.set('difficulty', difficulty);
    }
    router.push(`/game?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-b from-blue-50 to-white text-gray-900'
      }`}
    >
      {/* Floating Chess Pieces Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute"
        >
          {/* Add floating chess piece SVGs here */}
        </motion.div>
      </div>

      {/* Theme and Music Controls */}
      <div className="absolute top-4 right-4 flex space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isDarkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleMusic}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isMuted ? <FaVolumeMute className="w-6 h-6" /> : <FaVolumeUp className="w-6 h-6" />}
        </button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold mb-4">Multilayer Chess</h1>
          <p className="text-xl text-gray-300 mb-8">Experience chess in multiple dimensions</p>
          
          {/* Quick Tutorial */}
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-opacity-50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">How to Play</h3>
            <p className="text-gray-300">
              Multilayer Chess adds a new dimension to traditional chess. 
              Pieces can move between three different boards, creating exciting 
              new strategies and possibilities.
            </p>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="mt-4 flex items-center mx-auto space-x-2 text-blue-400 hover:text-blue-300"
            >
              <FaQuestionCircle />
              <span>Learn More</span>
            </button>
          </div>
        </motion.div>

        {/* Game Mode Selection */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-semibold mb-6">Select Game Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GameModeCard
              title="Local Game"
              description="Play against a friend on the same device"
              icon="🎮"
              selected={selectedMode === 'local'}
              onClick={() => setSelectedMode('local')}
            />
            <GameModeCard
              title="AI Opponent"
              description="Challenge our advanced chess AI"
              icon="🤖"
              selected={selectedMode === 'ai'}
              onClick={() => setSelectedMode('ai')}
            />
            <GameModeCard
              title="Online Multiplayer"
              description="Play against players worldwide"
              icon="🌐"
              selected={selectedMode === 'multiplayer'}
              onClick={() => setSelectedMode('multiplayer')}
            />
          </div>

          {selectedMode === 'ai' && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Select Difficulty</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DifficultyButton
                  level="beginner"
                  selected={difficulty === 'beginner'}
                  onClick={() => setDifficulty('beginner')}
                />
                <DifficultyButton
                  level="intermediate"
                  selected={difficulty === 'intermediate'}
                  onClick={() => setDifficulty('intermediate')}
                />
                <DifficultyButton
                  level="expert"
                  selected={difficulty === 'expert'}
                  onClick={() => setDifficulty('expert')}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => startGame(selectedMode, selectedMode === 'ai' ? difficulty : undefined)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center text-gray-400"
        >
          <h3 className="text-2xl font-semibold mb-4">Game Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Multiple Layers"
              description="Play chess across multiple 3D layers"
              icon="📊"
            />
            <FeatureCard
              title="Real-time Chat"
              description="Chat with your opponent during the game"
              icon="💬"
            />
            <FeatureCard
              title="Game History"
              description="Review your past games and improve"
              icon="📜"
            />
          </div>
        </motion.div>

        {/* Leaderboard Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center mx-auto space-x-2 text-yellow-400 hover:text-yellow-300"
          >
            <FaTrophy />
            <span>View Leaderboard</span>
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}
        {showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GameModeCard({ title, description, icon, selected, onClick }: {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg text-left transition-all ${
        selected
          ? 'bg-blue-600 transform scale-105'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </button>
  );
}

function DifficultyButton({ level, selected, onClick }: {
  level: 'beginner' | 'intermediate' | 'expert';
  selected: boolean;
  onClick: () => void;
}) {
  const labels = {
    beginner: '👶 Beginner',
    intermediate: '👨‍🎓 Intermediate',
    expert: '🧙‍♂️ Expert'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg font-semibold transition-all ${
        selected
          ? 'bg-blue-600 transform scale-105'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {labels[level]}
    </button>
  );
}

function FeatureCard({ title, description, icon }: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-gray-800">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
