'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChessGame from '@/components/ChessGame';
import PlayFriendPanel from '@/components/PlayFriendPanel';

const validModes = ['singleplayer', 'multiplayer', 'practice'];
const validDifficulties = ['beginner', 'intermediate', 'expert', 'tutorial', 'puzzles', 'analysis'];

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const difficulty = searchParams.get('difficulty');

  useEffect(() => {
    // Online multiplayer is link-based and needs no difficulty selection.
    if (mode === 'multiplayer') {
      return;
    }
    // Validate mode and difficulty
    if (!mode || !validModes.includes(mode) ||
        !difficulty || !validDifficulties.includes(difficulty)) {
      router.push('/');
      return;
    }
  }, [mode, difficulty, router]);

  // Multiplayer: create a shareable link or join by code. The actual game
  // is played at /game/<code>.
  if (mode === 'multiplayer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-4xl font-bold mb-8">Multiplayer</h1>
          <PlayFriendPanel />
        </div>
      </div>
    );
  }

  if (!mode || !difficulty) {
    return null;
  }

  // Map practice mode difficulties to their respective components
  if (mode === 'practice') {
    switch (difficulty) {
      case 'tutorial':
        return <ChessGame gameMode={mode} difficulty={difficulty} tutorialMode={true} />;
      case 'puzzles':
        return <ChessGame gameMode={mode} difficulty={difficulty} puzzleMode={true} />;
      case 'analysis':
        return <ChessGame gameMode={mode} difficulty={difficulty} analysisMode={true} />;
      default:
        return null;
    }
  }

  // For singleplayer mode
  return (
    <ChessGame
      gameMode={mode as 'singleplayer' | 'multiplayer'}
      difficulty={difficulty as 'beginner' | 'intermediate' | 'expert'}
    />
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GamePageContent />
    </Suspense>
  );
}
