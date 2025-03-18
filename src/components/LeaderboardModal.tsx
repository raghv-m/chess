'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrophy } from 'react-icons/fa';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  // Mock data for the leaderboard
  const topPlayers = [
    { username: 'ChessMaster', rating: 2500, wins: 150, losses: 20, draws: 10 },
    { username: 'GrandMaster', rating: 2400, wins: 140, losses: 25, draws: 15 },
    { username: 'ProChess', rating: 2300, wins: 130, losses: 30, draws: 20 },
    { username: 'ChessKing', rating: 2200, wins: 120, losses: 35, draws: 25 },
    { username: 'ChessQueen', rating: 2100, wins: 110, losses: 40, draws: 30 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex items-center justify-center mb-6">
              <FaTrophy className="text-yellow-500 text-3xl mr-2" />
              <h2 className="text-2xl font-bold">Leaderboard</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Player</th>
                    <th className="px-4 py-2 text-center">Rating</th>
                    <th className="px-4 py-2 text-center">Wins</th>
                    <th className="px-4 py-2 text-center">Losses</th>
                    <th className="px-4 py-2 text-center">Draws</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((player, index) => (
                    <tr
                      key={player.username}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-4 py-2 font-semibold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="px-4 py-2">{player.username}</td>
                      <td className="px-4 py-2 text-center">{player.rating}</td>
                      <td className="px-4 py-2 text-center text-green-600">{player.wins}</td>
                      <td className="px-4 py-2 text-center text-red-600">{player.losses}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{player.draws}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 