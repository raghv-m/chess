'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import ChessBoard from './ChessBoard';
import { GameState, Position, ChessPiece, GameResult } from '@/types';
import { LayerIndex, GameState as EngineGameState, Position as EnginePosition } from '@/types/index';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ChessEngine } from '@/lib/chess/engine';
import { ChessAI } from '@/lib/ai/ChessAI';
import { moveListString, moveToString } from '@/lib/chess/notation';
import { saveGame } from '@/lib/chess/gameHistory';
import type { AIWorkerResponse } from '@/lib/ai/ai.worker';
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
  // Singleplayer means "you against the computer": you play white, the computer plays black.
  const vsComputer = gameMode === 'singleplayer' &&
    (difficulty === 'beginner' || difficulty === 'intermediate' || difficulty === 'expert');
  const ai = useMemo(
    () => new ChessAI(vsComputer ? (difficulty as 'beginner' | 'intermediate' | 'expert') : 'intermediate'),
    [difficulty, vsComputer]
  );
  const [aiThinking, setAiThinking] = useState(false);
  const [promotionPending, setPromotionPending] = useState<{ from: Position; to: Position } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  // Search runs in a Web Worker so the expert level never freezes the board.
  // Falls back to the main thread where workers are unavailable.
  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    const worker = new Worker(new URL('../lib/ai/ai.worker.ts', import.meta.url));
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);
  // Handlers read the engine through a ref so timers never see a stale copy.
  const engineRef = useRef<ChessEngine | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const chessEngine = new ChessEngine();
        engineRef.current = chessEngine;
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

  const isOverState = (eng: ChessEngine) => {
    const st = eng.getGameState();
    return st === EngineGameState.WHITE_WINS || st === EngineGameState.BLACK_WINS ||
      st === EngineGameState.STALEMATE || st === EngineGameState.DRAW;
  };

  // Keep finished games in this browser's history.
  const recordFinishedGame = (eng: ChessEngine, resultText: string) => {
    saveGame({
      mode: vsComputer ? 'computer' : 'local',
      difficulty: vsComputer ? (difficulty as 'beginner' | 'intermediate' | 'expert') : undefined,
      result: resultText,
      moves: eng.getMoveHistory().map(m => moveToString(m))
    });
  };

  // Copy the engine's position and result into React state.
  const syncFromEngine = (eng: ChessEngine) => {
    const engineState = eng.getGameState();
    setGameState(prev => ({
      ...prev!,
      board: eng.getBoard(),
      currentTurn: eng.getCurrentPlayer(),
      isCheck: engineState === EngineGameState.IN_CHECK,
      isCheckmate: engineState === EngineGameState.WHITE_WINS || engineState === EngineGameState.BLACK_WINS,
      isStalemate: engineState === EngineGameState.STALEMATE
    }));
    setSelectedPiece(null);

    if (engineState === EngineGameState.WHITE_WINS || engineState === EngineGameState.BLACK_WINS) {
      setIsGameOver(true);
      const winnerColor = engineState === EngineGameState.WHITE_WINS ? 'white' : 'black';
      setResult({ winner: winnerColor, reason: 'checkmate' });
      recordFinishedGame(eng, `${winnerColor === 'white' ? 'White' : 'Black'} wins (checkmate)`);
    } else if (engineState === EngineGameState.STALEMATE) {
      setIsGameOver(true);
      setResult({ winner: 'draw', reason: 'stalemate' });
      recordFinishedGame(eng, 'Draw (stalemate)');
    } else if (engineState === EngineGameState.DRAW) {
      setIsGameOver(true);
      setResult({ winner: 'draw', reason: 'draw' });
      recordFinishedGame(eng, `Draw (${eng.getDrawReason() ?? 'draw'})`.replace(/-/g, ' '));
    }
  };

  const handleClaimDraw = () => {
    const eng = engineRef.current;
    if (!eng) return;
    if (eng.claimDraw()) syncFromEngine(eng);
  };

  // The computer answers after a short pause so the human can see the move land.
  const scheduleComputerMove = () => {
    setAiThinking(true);
    setTimeout(() => {
      const eng = engineRef.current;
      const finish = (move: { from: Position; to: Position } | null) => {
        const current = engineRef.current;
        if (current && move) {
          current.makeMove(move.from as EnginePosition, move.to as EnginePosition);
        }
        if (current) syncFromEngine(current);
        setAiThinking(false);
      };

      if (!eng || eng.getCurrentPlayer() !== 'black' || isOverState(eng)) {
        setAiThinking(false);
        return;
      }

      const worker = workerRef.current;
      if (!worker) {
        finish(ai.chooseMove(eng));
        return;
      }

      const id = ++requestIdRef.current;
      const onMessage = (event: MessageEvent<AIWorkerResponse>) => {
        if (event.data.id !== id) return;
        worker.removeEventListener('message', onMessage);
        if (event.data.error) {
          finish(ai.chooseMove(eng));
          return;
        }
        finish(event.data.move as { from: Position; to: Position } | null);
      };
      worker.addEventListener('message', onMessage);
      const level = (vsComputer ? difficulty : 'intermediate') as 'beginner' | 'intermediate' | 'expert';
      worker.postMessage({ id, snapshot: eng.toSnapshot(), difficulty: level });
    }, 300);
  };

  const choosePromotion = (type: 'queen' | 'rook' | 'bishop' | 'knight') => {
    const eng = engineRef.current;
    const pending = promotionPending;
    if (!eng || !pending) return;
    setPromotionPending(null);
    setSelectedPiece(null);
    const success = eng.makeMove(pending.from as EnginePosition, pending.to as EnginePosition, type);
    if (success) {
      syncFromEngine(eng);
      if (vsComputer && !isOverState(eng)) {
        scheduleComputerMove();
      }
    }
  };

  const handleSquareClick = async (position: Position) => {
    const eng = engineRef.current;
    if (!gameState || loading || !eng || isGameOver || promotionPending) return;
    // While the computer is thinking, or on its turn, the board is not yours.
    if (vsComputer && (aiThinking || eng.getCurrentPlayer() !== 'white')) return;

    try {
      if (!selectedPiece) {
        const piece = gameState.board[position.layer as LayerIndex][position.y][position.x];
        if (piece && piece.color === eng.getCurrentPlayer()) {
          setSelectedPiece(position);
        }
      } else {
        const from = { ...selectedPiece, layer: selectedPiece.layer as LayerIndex };
        const to = { ...position, layer: position.layer as LayerIndex };

        // Pawn reaching the last rank: ask which piece to promote to first.
        const mover = eng.getPieceAt(from);
        const lastRank = mover?.color === 'white' ? 7 : 0;
        const isPromotion =
          mover?.type === 'pawn' &&
          to.y === lastRank &&
          eng.getValidMoves(from).some(m => m.x === to.x && m.y === to.y && m.layer === to.layer);
        if (isPromotion) {
          setPromotionPending({ from, to });
          setSelectedPiece(null);
          return;
        }

        const success = eng.makeMove(from, to);
        if (success) {
          syncFromEngine(eng);
          if (vsComputer && !isOverState(eng)) {
            scheduleComputerMove();
          }
        } else {
          setSelectedPiece(null);
        }
      }
    } catch (error) {
      setError('Invalid move');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUndoMove = () => {
    const eng = engineRef.current;
    if (!eng || aiThinking) return;
    // Against the computer, one undo takes back the computer's reply and the
    // human move before it, so it is white's turn again.
    const undone = eng.undoMove();
    if (undone && vsComputer && eng.getCurrentPlayer() === 'black') {
      eng.undoMove();
    }
    setIsGameOver(false);
    setResult(null);
    syncFromEngine(eng);
  };

  // Local resign: the side to move concedes, the opponent wins.
  // (Online resign lives in OnlineChessGame and goes through the API.)
  const handleResign = () => {
    if (isGameOver || !gameState) return;
    const winner = gameState.currentTurn === 'white' ? 'black' : 'white';
    setResult({ winner, reason: 'resignation' });
    setIsGameOver(true);
    const resigner = gameState.currentTurn;
    const eng = engineRef.current;
    if (eng) recordFinishedGame(eng, `${winner === 'white' ? 'White' : 'Black'} wins (resignation, ${resigner} resigned)`);
  };

  // Local draw: both sides are the same person at one screen, so the
  // Draw button agrees the game drawn immediately.
  const handleOfferDraw = () => {
    if (isGameOver) return;
    setResult({ winner: 'draw', reason: 'draw' });
    setIsGameOver(true);
    const eng = engineRef.current;
    if (eng) recordFinishedGame(eng, 'Draw (agreed)');
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
      <div className="absolute top-4 left-4 bg-walnut/90 border border-brass/30 backdrop-blur-sm p-4 rounded-lg text-bone z-10">
        <h2 className="text-xl font-bold mb-2">
          {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Game
        </h2>
        <p className="text-sm text-gray-300 mb-2">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
        <p className="text-sm">
          Current Turn: {gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1)}
        </p>
        {vsComputer && (
          <p className="text-sm text-gray-300 mt-1" role="status" aria-live="polite">
            {aiThinking ? 'Computer is thinking…' : gameState.currentTurn === 'white' ? 'Your move' : ''}
          </p>
        )}
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

      {/* Final result banner */}
      {result && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-walnut/95 border border-brass/30 p-5 rounded-lg text-bone z-10 text-center">
          <p className="text-lg font-bold">
            {result.winner === 'draw'
              ? `Game drawn (${result.reason.replace(/[_-]/g, ' ')})`
              : `${result.winner === 'white' ? 'White' : 'Black'} wins (${result.reason.replace(/[_-]/g, ' ')})`}
          </p>
        </div>
      )}

      {/* Game Controls */}
      <div className="absolute top-4 right-4 bg-walnut/90 border border-brass/30 backdrop-blur-sm p-4 rounded-lg text-bone z-10">
        <div className="flex space-x-2">
          <button
            onClick={handleUndoMove}
            className="bg-brass hover:bg-brass-light text-ink font-semibold px-3 py-1 rounded text-sm transition-colors"
          >
            Undo
          </button>
          <button
            onClick={handleResign}
            className="bg-oxblood hover:bg-oxblood/80 text-bone px-3 py-1 rounded text-sm transition-colors"
          >
            Resign
          </button>
          <button
            onClick={handleOfferDraw}
            className="bg-brass/70 hover:bg-brass text-ink font-semibold px-3 py-1 rounded text-sm transition-colors"
          >
            Draw
          </button>
          <a
            href="/history"
            className="bg-walnut border border-brass/40 hover:border-brass px-3 py-1 rounded text-sm text-bone transition-colors"
          >
            History
          </a>
          {!isGameOver && engineRef.current?.getClaimableDraw() && (
            <button
              onClick={handleClaimDraw}
              className="bg-brass/70 hover:bg-brass text-ink font-semibold px-3 py-1 rounded text-sm transition-colors"
            >
              Claim draw
            </button>
          )}
        </div>
        {engineRef.current && engineRef.current.getMoveHistory().length > 0 && (
          <p className="mt-3 max-w-xs break-words text-xs text-bone/70 font-mono">
            {moveListString(engineRef.current)}
          </p>
        )}
      </div>

      {/* 3D Chess Board */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 5, 8], fov: 50 }}
          style={{ background: '#15120F' }}
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

      {/* Promotion picker */}
      {promotionPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <div className="bg-walnut border border-brass/30 p-6 rounded-lg text-bone text-center">
            <h3 className="text-lg font-semibold mb-4">Promote pawn to</h3>
            <div className="flex space-x-3">
              {(['queen', 'rook', 'bishop', 'knight'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => choosePromotion(type)}
                  className="bg-brass/20 hover:bg-brass/40 text-bone px-4 py-2 rounded capitalize transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Captured Pieces Display */}
      <div className="absolute bottom-4 left-4 bg-walnut/90 border border-brass/30 backdrop-blur-sm p-4 rounded-lg text-bone z-10">
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
