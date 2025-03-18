import React from 'react';
import { motion } from 'framer-motion';
import { GameState, ChessPiece, PieceColor } from '@/types/index';

interface GameInfoProps {
  gameState: GameState;
  gameMode: 'local' | 'ai' | 'multiplayer';
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  currentTurn: PieceColor;
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] };
  isCheck: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  gameMode,
  difficulty,
  currentTurn,
  capturedPieces,
  isCheck
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white min-w-[300px]">
      <h2 className="text-2xl font-bold mb-6 text-center">Game Info</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Game Mode</h3>
          <p className="capitalize">{gameMode} {difficulty && `- ${difficulty}`}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Current Turn</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${
                currentTurn === 'white' ? 'bg-white' : 'bg-gray-900'
              }`}
            />
            <p className="capitalize">{currentTurn}'s turn</p>
          </div>
        </div>

        {isCheck && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-red-500 px-3 py-2 rounded-md text-center font-semibold"
          >
            Check!
          </motion.div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2">Captured Pieces</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm mb-1">White captured:</p>
              <div className="flex flex-wrap gap-2">
                {capturedPieces.white.map((piece, index) => (
                  <div
                    key={`white-${index}`}
                    className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center"
                  >
                    {piece.type.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm mb-1">Black captured:</p>
              <div className="flex flex-wrap gap-2">
                {capturedPieces.black.map((piece, index) => (
                  <div
                    key={`black-${index}`}
                    className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center"
                  >
                    {piece.type.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo; 