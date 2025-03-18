'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import ChessGame from '@/components/ChessGame';
import { useEffect, useState } from 'react';

const GamePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidMode, setIsValidMode] = useState(true);

  const mode = searchParams.get('mode');
  const difficulty = searchParams.get('difficulty');

  useEffect(() => {
    // Validate mode and difficulty
    const validModes = ['local', 'ai', 'multiplayer'];
    const validDifficulties = ['beginner', 'intermediate', 'expert'];

    if (!mode || !validModes.includes(mode) || 
        !difficulty || !validDifficulties.includes(difficulty)) {
      setIsValidMode(false);
      // Redirect to home page after 3 seconds if invalid parameters
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [mode, difficulty, router]);

  if (!isValidMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Invalid Game Mode</h1>
          <p className="text-gray-400">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ChessGame 
        gameMode={mode as 'local' | 'ai' | 'multiplayer'} 
        difficulty={difficulty as 'beginner' | 'intermediate' | 'expert'} 
      />
    </div>
  );
};

export default GamePage; 