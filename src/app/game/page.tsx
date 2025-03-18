'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameState } from '@/types';
import { GameModeManager } from '@/lib/game/GameModeManager';

export default function GamePage() {
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameModeManager, setGameModeManager] = useState<GameModeManager | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode') as 'local' | 'ai' | 'multiplayer';
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'expert';
    const roomId = searchParams.get('roomId');

    if (!mode) {
      console.error('No game mode specified');
      return;
    }

    const manager = new GameModeManager();
    manager.initializeGameMode(mode, {
      difficulty,
      roomId: roomId || undefined
    });

    manager.setCallbacks({
      onMove: (newState) => {
        setGameState(newState);
      },
      onGameEnd: () => {
        // Handle game end
      },
      onError: (error) => {
        console.error('Game error:', error);
      }
    });

    setGameModeManager(manager);
    setGameState(manager.getGameState());

    return () => {
      manager.cleanup();
    };
  }, [searchParams]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">3D Chess Game</h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* Game board will be rendered here */}
          <div className="text-center">Game board coming soon...</div>
        </div>
      </div>
    </div>
  );
} 