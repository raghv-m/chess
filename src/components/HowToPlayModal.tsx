'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-6">How to Play 3D Chess</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-2">Basic Rules</h3>
                <p className="text-gray-300">
                  The game follows standard chess rules but with an added dimension. 
                  Pieces can move between three different layers, creating new strategic possibilities.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Layer Movement</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Pieces can move up or down one layer at a time</li>
                  <li>Knights can jump to any layer</li>
                  <li>Bishops move diagonally across layers</li>
                  <li>Rooks move vertically between layers</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Game Modes</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Local: Play against a friend on the same device</li>
                  <li>AI: Challenge our AI opponent at different difficulty levels</li>
                  <li>Multiplayer: Play against other players online</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Controls</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Click a piece to select it</li>
                  <li>Click a valid square to move</li>
                  <li>Use mouse wheel to zoom</li>
                  <li>Drag to rotate the view</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 