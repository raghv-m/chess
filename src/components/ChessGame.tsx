'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameModeManager } from '../lib/game/GameModeManager';
import { DatabaseService, User } from '../lib/auth/types';
import { Position, GameState, ChatMessage } from '@/types';
import { ChessBoard } from './ChessBoard';
import { ChatBox } from './ChatBox';
import { GameControls } from './GameControls';

// Mock database service
const mockDb: DatabaseService = {
  getUserStats: async () => ({
    rating: 1200,
    wins: 0,
    losses: 0,
    draws: 0,
    gamesPlayed: 0,
    winStreak: 0
  }),
  updateUserStats: async () => {},
  getTopPlayers: async () => [],
  getMatchHistory: async () => []
};

const createInitialBoard = () => {
  // Create deep copies of arrays to prevent reference issues
  const emptyRow = () => Array(8).fill(null);
  const whitePawns = () => Array(8).fill({ type: 'pawn', color: 'white' });
  const blackPawns = () => Array(8).fill({ type: 'pawn', color: 'black' });
  
  const backRow = (color: 'white' | 'black') => [
    { type: 'rook', color },
    { type: 'knight', color },
    { type: 'bishop', color },
    { type: 'queen', color },
    { type: 'king', color },
    { type: 'bishop', color },
    { type: 'knight', color },
    { type: 'rook', color }
  ];

  // Initialize board with proper structure
  const board = [
    [
      backRow('white'),
      whitePawns(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      blackPawns(),
      backRow('black')
    ]
  ];

  return {
    board,
    currentTurn: 'white',
    isCheckmate: false,
    isStalemate: false,
    moves: []
  } as GameState;
};

const INITIAL_BOARD = createInitialBoard();

interface ChessGameProps {
  gameState?: GameState;
  onMove?: (from: Position, to: Position) => void;
}

export function ChessGame({ gameState: initialGameState, onMove }: ChessGameProps) {
  const [gameManager, setGameManager] = useState<GameModeManager>();
  const [currentGameState, setCurrentGameState] = useState<GameState>(initialGameState || {
    board: [Array(8).fill(Array(8).fill(null))],
    currentTurn: 'white',
    isCheckmate: false,
    isStalemate: false,
    moves: []
  });
  const [selectedMode, setSelectedMode] = useState<'ai' | 'multiplayer' | 'local'>('local');
  const [selectedSquare, setSelectedSquare] = useState<Position>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const controlsRef = useRef();
  
  // Initialize game manager
  useEffect(() => {
    const manager = new GameModeManager(mockDb);
    setGameManager(manager);
    const initialState = manager.getGameState();
    if (initialState?.board?.[0]) {
      setCurrentGameState(initialState);
    }

    return () => {
      manager.cleanup();
    };
  }, []);

  useEffect(() => {
    if (initialGameState) {
      setCurrentGameState(initialGameState);
    }
  }, [initialGameState]);

  // Start game mode
  const startGame = async () => {
    if (!gameManager) return;

    const testUser: User = {
      id: 'test123',
      username: 'TestPlayer',
      email: 'test@example.com'
    };

    await gameManager.initializeGameMode(selectedMode, {
      difficulty: 'intermediate',
      serverUrl: 'ws://localhost:3000',
      user: testUser
    });

    gameManager.setCallbacks({
      onGameStart: (opponent) => {
        console.log('Game started with:', opponent);
        addChatMessage({
          id: Date.now().toString(),
          userId: 'system',
          username: 'System',
          message: `Game started against ${opponent.username}`,
          timestamp: Date.now()
        });
      },
      onGameEnd: (result) => {
        console.log('Game ended:', result);
        addChatMessage({
          id: Date.now().toString(),
          userId: 'system',
          username: 'System',
          message: `Game Over! ${result.winner ? `${result.winner} wins` : 'Draw'} by ${result.reason}`,
          timestamp: Date.now()
        });
      }
    });

    setCurrentGameState(gameManager.getGameState());
  };

  // Handle square click
  const handleSquareClick = (position: Position) => {
    if (!gameManager || !currentGameState) return;

    if (selectedSquare) {
      // Attempt to make a move
      if (onMove) {
        onMove(selectedSquare, position);
      }
      setSelectedSquare(undefined);
    } else {
      const piece = currentGameState.board[position.layer][position.y][position.x];
      if (piece && piece.color === currentGameState.currentTurn) {
        setSelectedSquare(position);
      }
    }
  };

  // Handle chat message
  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const formatPosition = (pos: Position): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[pos.x]}${pos.y + 1}${pos.layer > 0 ? ` (L${pos.layer + 1})` : ''}`;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 10, 10], fov: 50 }}
          shadows
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            enabled={!isRotating}
          />
          <ChessBoard
            gameState={currentGameState}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
          />
        </Canvas>

        <div className="absolute top-4 left-4 space-y-4">
          <select 
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as any)}
            className="mr-2 p-2 border rounded bg-white"
          >
            <option value="local">Local Game</option>
            <option value="ai">vs AI</option>
            <option value="multiplayer">Multiplayer</option>
          </select>
          <button 
            onClick={startGame}
            className="block bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Game
          </button>
        </div>

        <GameControls
          onResign={() => gameManager?.resign()}
          onOfferDraw={() => gameManager?.offerDraw()}
          onToggleChat={() => setShowChat(!showChat)}
          onToggleRotation={() => setIsRotating(!isRotating)}
        />
      </div>

      {showChat && (
        <ChatBox
          messages={chatMessages}
          onSendMessage={(text) => {
            addChatMessage({
              id: Date.now().toString(),
              userId: 'test123',
              username: 'TestPlayer',
              message: text,
              timestamp: Date.now()
            });
          }}
        />
      )}
    </div>
  );
} 