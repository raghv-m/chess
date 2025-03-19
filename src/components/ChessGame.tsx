'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import ChessBoard from './ChessBoard';
import { GameState, Position, ChessPiece, GameResult } from '@/types/index';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GameModeManager } from '@/lib/game/GameModeManager';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import GameInfo from './GameInfo';

interface ChessGameProps {
  gameMode: 'local' | 'ai' | 'multiplayer';
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'tutorial' | 'puzzles' | 'analysis';
}

const ChessGame: React.FC<ChessGameProps> = ({ gameMode, difficulty }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameManager] = useState(() => new GameModeManager());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Position | undefined>();
  const [isGameOver, setIsGameOver] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const initializeGame = async () => {
      try {
        await gameManager.initializeGameMode(gameMode, { difficulty });
    gameManager.setCallbacks({
          onMove: (newState) => {
            setGameState(newState);
            setSelectedPiece(null);
      },
      onGameEnd: (result) => {
            setGameResult(result);
          },
          onError: (message) => {
            setError(message);
            setTimeout(() => setError(null), 3000);
          }
        });
        const initialState = gameManager.getGameState();
        setGameState(initialState);
        setTimeout(() => setIsLoading(false), 1000);
      } catch (error) {
        setError('Failed to initialize game');
        setIsLoading(false);
      }
    };

    initializeGame();

    return () => {
      gameManager.cleanup();
    };
  }, [gameMode, difficulty]);

  const handleSquareClick = async (position: Position) => {
    if (!gameState || isLoading) return;

    try {
      if (!selectedPiece) {
        const piece = gameState.board[position.layer][position.y][position.x];
        if (piece && piece.color === gameState.currentTurn) {
          setSelectedPiece(position);
          const validMoves = gameManager.getValidMoves(position);
        }
    } else {
        const success = await gameManager.makeMove(selectedPiece, position);
        if (success) {
          setSelectedPiece(null);
        }
      }
    } catch (error) {
      setError('Invalid move');
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderCapturedPieces = (pieces: ChessPiece[], color: 'white' | 'black') => (
    <div className="flex flex-wrap gap-1 p-2">
      {pieces.map((piece, index) => (
        <div
          key={index}
          className={`w-8 h-8 flex items-center justify-center rounded-full 
            ${color === 'white' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
        >
          {piece.type.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Chess Game</h2>
          <p className="text-gray-400">Preparing your {gameMode} match...</p>
        </motion.div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorMessage message="Failed to load game" />
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <Canvas camera={{ position: [0, 5, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ChessBoard
          gameState={gameState}
          selectedPiece={selectedPiece}
          onSquareClick={handleSquareClick}
        />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">
          {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Game
        </h2>
        <p className="text-sm text-gray-300 mb-2">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
        <p className="text-sm">
          Current Turn: {gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1)}
        </p>
      </div>

      {/* Game Status Messages */}
      <AnimatePresence>
        {(gameState.isCheck || gameState.isCheckmate || gameState.isStalemate || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 p-4 rounded-lg text-white"
            style={{
              backgroundColor: error ? 'rgba(220, 38, 38, 0.9)' : 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {error ? (
              <p className="font-bold">{error}</p>
            ) : gameState.isCheckmate ? (
              <p className="font-bold">Checkmate! {gameState.currentTurn === 'white' ? 'Black' : 'White'} wins!</p>
            ) : gameState.isStalemate ? (
              <p className="font-bold">Stalemate! The game is a draw.</p>
            ) : gameState.isCheck ? (
              <p className="font-bold">Check!</p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captured Pieces */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-white font-bold mb-2">White Captures</h3>
          <div className="flex gap-2">
            {gameState.capturedPieces.white.map((piece, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded">
                {piece.type.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-white font-bold mb-2">Black Captures</h3>
          <div className="flex gap-2">
            {gameState.capturedPieces.black.map((piece, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded">
                {piece.type.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="w-full bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">3D Chess</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Player Info Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">White Player</h2>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">♔</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Player 1</p>
                    <p className="text-gray-400 text-sm">Rating: 1500</p>
                  </div>
                </div>
              </div>

              {/* Captured Pieces Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-2">Captured Pieces</h2>
                {renderCapturedPieces(gameState.capturedPieces.white, 'white')}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="aspect-square relative">
        <Canvas
          shadows
                  camera={{ position: [0, 5, 5], fov: 75 }}
          className="w-full h-full"
        >
                  <PerspectiveCamera makeDefault />
          <OrbitControls
                    enablePan={!isMobile}
                    enableZoom={!isMobile}
                    enableRotate={!isMobile}
                    minDistance={3}
                    maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
                  />
                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                  />
                  <Environment preset="sunset" />
          <ChessBoard
                    gameState={gameState}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
          />
        </Canvas>
              </div>
            </div>

            {/* Game Controls */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-lg transition-colors border border-white/10">
                Undo Move
              </button>
              <button className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-500 px-4 py-3 rounded-lg transition-colors border border-red-500/20">
                Resign Game
              </button>
              <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-lg transition-colors border border-white/10">
                Offer Draw
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Opponent Info Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Black Player</h2>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-2xl">♚</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Player 2</p>
                    <p className="text-gray-400 text-sm">Rating: 1520</p>
                  </div>
                </div>
              </div>

              {/* Move History Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-2">Move History</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameState.moves.map((move, index) => (
                    <div key={index} className="text-gray-300 text-sm">
                      {index + 1}. {move.piece.type} {String.fromCharCode(97 + move.from.x)}{8 - move.from.y} 
                      → {String.fromCharCode(97 + move.to.x)}{8 - move.to.y}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Stats Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-2">Game Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Moves</span>
                    <span className="text-white">{gameState.moves.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">10:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 block mb-2">Board Theme</label>
                  <select className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600">
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="neon">Neon</option>
          </select>
                </div>
                <div>
                  <label className="text-gray-300 block mb-2">Sound Effects</label>
                  <div className="flex items-center">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
                    <span className="ml-2 text-white">Enable sound effects</span>
                  </div>
                </div>
          <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Game Over</h2>
              <p className="text-gray-300 mb-6">
                {gameState.isCheckmate ? 'Checkmate!' : 'Stalemate!'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsGameOver(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={() => setIsGameOver(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Review Game
          </button>
        </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessGame; 