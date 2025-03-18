'use client';

import { motion } from 'framer-motion';
import { FaTimes, FaCrown, FaMedal } from 'react-icons/fa';
import { useState } from 'react';

interface LeaderboardModalProps {
  onClose: () => void;
}

interface PlayerStats {
  rank: number;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  winStreak: number;
}

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');
  
  // Mock data - replace with real data from your backend
  const players: PlayerStats[] = [
    { rank: 1, username: "GrandMaster123", rating: 2400, wins: 150, losses: 30, winStreak: 8 },
    { rank: 2, username: "ChessWizard", rating: 2350, wins: 140, losses: 35, winStreak: 5 },
    { rank: 3, username: "StrategyKing", rating: 2300, wins: 130, losses: 40, winStreak: 3 },
    // Add more players...
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="text-yellow-400 w-6 h-6" />;
      case 2:
        return <FaMedal className="text-gray-400 w-6 h-6" />;
      case 3:
        return <FaMedal className="text-amber-600 w-6 h-6" />;
      default:
        return <span className="text-gray-400 font-mono w-6 text-center">{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Global Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setTimeFrame('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFrame === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFrame === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeFrame === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            This Week
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">W/L</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Streak</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {players.map((player) => (
                <tr
                  key={player.username}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center">
                    {getRankIcon(player.rank)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {player.username}
                  </td>
                  <td className="py-3 px-4">{player.rating}</td>
                  <td className="py-3 px-4">
                    {player.wins}/{player.losses}
                  </td>
                  <td className="py-3 px-4">
                    {((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-400">
                      {player.winStreak} ↑
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Rankings update every hour. Keep playing to improve your position!
        </div>
      </motion.div>
    </motion.div>
  );
} 