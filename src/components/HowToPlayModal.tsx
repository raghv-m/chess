'use client';

import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
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
        className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">How to Play Multilayer Chess</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Basic Rules</h3>
            <p>
              Multilayer Chess follows traditional chess rules with an exciting twist:
              pieces can move between three different layers of the board!
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Layer Movement</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Knights can jump between any layers</li>
              <li>Queens and Kings can move to adjacent layers</li>
              <li>Bishops can move diagonally between adjacent layers</li>
              <li>Rooks can move vertically between adjacent layers</li>
              <li>Pawns can only capture diagonally across layers</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Special Rules</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Check and checkmate can occur across layers</li>
              <li>Castling is only allowed within the same layer</li>
              <li>En passant captures work between adjacent layers</li>
              <li>Pawn promotion occurs on the 8th rank of any layer</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Controls</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Click and drag pieces to move them</li>
              <li>Use the mouse wheel or pinch gesture to zoom</li>
              <li>Right-click and drag to rotate the board</li>
              <li>Double-click a layer to focus on it</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Game Modes</h3>
            <div className="space-y-2">
              <p><strong>Local Game:</strong> Play against a friend on the same device</p>
              <p><strong>AI Opponent:</strong> Challenge our chess AI with different difficulty levels</p>
              <p><strong>Online Multiplayer:</strong> Play against players worldwide with chat support</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 