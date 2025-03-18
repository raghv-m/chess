'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChessGame } from '@/components/ChessGame';
import { ChatBox } from '@/components/ChatBox';
import { GameModeManager } from '@/lib/game/GameModeManager';
import { ChatMessage, GameState, Position } from '@/types';
import { User } from '@/lib/auth/types';

const createInitialBoard = () => {
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

  return {
    board: [
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
    ],
    currentTurn: 'white',
    isCheckmate: false,
    isStalemate: false,
    moves: []
  } as GameState;
};

export default function GamePage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'local' | 'ai' | 'multiplayer';
  const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'expert';
  
  const [gameManager, setGameManager] = useState<GameModeManager>();
  const [gameState, setGameState] = useState<GameState>(createInitialBoard());
  const [opponent, setOpponent] = useState<User>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(mode === 'multiplayer');

  useEffect(() => {
    const initializeGame = async () => {
      const manager = new GameModeManager();
      
      await manager.initializeGameMode(mode, {
        difficulty,
        serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
        user: {
          id: 'temp-user-id',
          username: 'Player',
          email: ''
        }
      });

      manager.setCallbacks({
        onGameStart: (opponent) => {
          setOpponent(opponent);
          setIsWaiting(false);
        },
        onMove: () => {
          setGameState(manager.getGameState());
        },
        onGameEnd: (result) => {
          addChatMessage({
            id: Date.now().toString(),
            userId: 'system',
            username: 'System',
            message: `Game Over! ${result.winner ? `${result.winner} wins` : 'Draw'} by ${result.reason}`,
            timestamp: Date.now()
          });
        },
        onChatMessage: (message) => {
          setChatMessages(prev => [...prev, message]);
        },
        onError: (error) => {
          console.error('Game error:', error);
          addChatMessage({
            id: Date.now().toString(),
            userId: 'system',
            username: 'System',
            message: `Error: ${error.message}`,
            timestamp: Date.now()
          });
        }
      });

      setGameManager(manager);
      setGameState(manager.getGameState());
    };

    initializeGame();

    return () => {
      gameManager?.cleanup();
    };
  }, [mode, difficulty]);

  const handleMove = async (from: Position, to: Position) => {
    if (!gameManager) return;
    
    const success = await gameManager.makeMove(from, to);
    if (success) {
      const newState = gameManager.getGameState();
      setGameState(newState);
      
      // Add move to chat
      const piece = gameState.board[from.layer][from.y][from.x];
      if (piece) {
        addChatMessage({
          id: Date.now().toString(),
          userId: 'move',
          username: 'Move',
          message: `${piece.color} ${piece.type} moved from ${formatPosition(from)} to ${formatPosition(to)}`,
          timestamp: Date.now()
        });
      }
    }
  };

  const handleSendMessage = (message: string) => {
    if (gameManager) {
      gameManager.sendChatMessage(message);
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const formatPosition = (pos: Position): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[pos.x]}${8 - pos.y}${pos.layer > 0 ? ` (L${pos.layer + 1})` : ''}`;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex-1 relative">
        {isWaiting ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-2">Finding Opponent</h2>
              <p className="text-gray-300">Please wait while we match you with a player...</p>
            </div>
          </div>
        ) : null}
        <ChessGame
          gameState={gameState}
          onMove={handleMove}
        />
      </div>
      
      {mode === 'multiplayer' && (
        <div className="w-96 bg-gray-800 border-l border-gray-700">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {opponent ? `Playing against ${opponent.username}` : 'Game Chat'}
              </h2>
            </div>
            <ChatBox
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
} 