'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import ChessBoard from './ChessBoard';
import { GameState, Position, ChessPiece, GameResult } from '@/types';
import { LayerIndex } from '@/types/index';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ChessEngine } from '@/lib/chess/engine';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import GameInfo from './GameInfo';

interface ChessGameProps {
  gameMode: 'singleplayer' | 'multiplayer' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'tutorial' | 'puzzles' | 'analysis';
  tutorialMode?: boolean;
  puzzleMode?: boolean;
  analysisMode?: boolean;
}

const ChessGame: React.FC<ChessGameProps> = ({ 
  gameMode, 
  difficulty,
  tutorialMode,
  puzzleMode,
  analysisMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<ChessEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GameResult | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const chessEngine = new ChessEngine();
        setEngine(chessEngine);
        
        // Get initial game state
        const board = chessEngine.getBoard();
        const currentTurn = 'white'; // Engine starts with white
        
        const initialState: GameState = {
          board,
          currentTurn,
          isCheck: false,
          isCheckmate: false,
          isStalemate: false,
          capturedPieces: { white: [], black: [] },
          moveHistory: [],
          moves: [],
          pieces: {
            white: [],
            black: [],
            find: () => undefined,
            filter: () => [],
            some: () => false,
            flatMap: () => [],
            push: () => {}
          }
        };
        
        setGameState(initialState);
        setLoading(false);
      } catch (error) {
        setError('Failed to initialize game');
        setLoading(false);
      }
    };

    initializeGame();
  }, [gameMode, difficulty, tutorialMode, puzzleMode, analysisMode]);

  const handleSquareClick = async (position: Position) => {
    if (!gameState || loading || !engine) return;

    try {
      if (!selectedPiece) {
        const piece = gameState.board[position.layer as LayerIndex][position.y][position.x];
        if (piece && piece.color === gameState.currentTurn) {
          setSelectedPiece(position);
        }
      } else {
        const success = engine.makeMove(selectedPiece, position);
        if (success) {
          // Update game state
          const newBoard = engine.getBoard();
          const newGameState: GameState = {
            ...gameState,
            board: newBoard,
            currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
            isCheck: engine.getGameState() === 'IN_CHECK',
            isCheckmate: engine.getGameState() === 'WHITE_WINS' || engine.getGameState() === 'BLACK_WINS',
            isStalemate: engine.getGameState() === 'STALEMATE'
          };
          setGameState(newGameState);
          setSelectedPiece(null);
        }
      }
    } catch (error) {
      setError('Invalid move');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUndoMove = () => {
    if (engine) {
      const success = engine.undoMove();
      if (success) {
        const newBoard = engine.getBoard();
        const newGameState: GameState = {
          ...gameState!,
          board: newBoard,
          currentTurn: gameState!.currentTurn === 'white' ? 'black' : 'white'
        };
        setGameState(newGameState);
      }
    }
  };

  const handleResign = () => {
    if (gameMode === 'multiplayer') {
      console.log('Resign requested');
    }
  };

  const handleOfferDraw = () => {
    if (gameMode === 'multiplayer') {
      console.log('Draw offer requested');
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!gameState || !engine) {
    return null;
  }

  return (
    <div className="relative h-screen">
      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10">
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

      {/* Game Controls */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10">
        <div className="flex space-x-2">
          <button
            onClick={handleUndoMove}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Undo
          </button>
          <button
            onClick={handleResign}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Resign
          </button>
          <button
            onClick={handleOfferDraw}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Draw
          </button>
        </div>
      </div>

      {/* 3D Chess Board */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 5, 8], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #1a202c, #2d3748)' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <ChessBoard
            gameState={gameState}
            selectedPiece={selectedPiece}
            onSquareClick={handleSquareClick}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />
          
          <Environment preset="sunset" />
        </Canvas>
      </div>

      {/* Captured Pieces Display */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10">
        <h3 className="text-sm font-semibold mb-2">Captured Pieces</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-300 mb-1">White</p>
            {renderCapturedPieces(gameState.capturedPieces.white, 'white')}
          </div>
          <div>
            <p className="text-xs text-gray-300 mb-1">Black</p>
            {renderCapturedPieces(gameState.capturedPieces.black, 'black')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame; 