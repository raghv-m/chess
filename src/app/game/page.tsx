'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChessGame from '@/components/ChessGame';

const validModes = ['singleplayer', 'multiplayer', 'practice'];
const validDifficulties = ['beginner', 'intermediate', 'expert', 'tutorial', 'puzzles', 'analysis'];

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const difficulty = searchParams.get('difficulty');

  useEffect(() => {
    // Validate mode and difficulty
    if (!mode || !validModes.includes(mode) ||
        !difficulty || !validDifficulties.includes(difficulty)) {
      router.push('/');
      return;
    }
  }, [mode, difficulty, router]);

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

  // For singleplayer and multiplayer modes
  return (
    <ChessGame 
      gameMode={mode as 'singleplayer' | 'multiplayer'} 
      difficulty={difficulty as 'beginner' | 'intermediate' | 'expert'} 
    />
  );
} 