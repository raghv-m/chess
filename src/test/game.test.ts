import { GameModeManager } from '../lib/game/GameModeManager';
import { DatabaseService } from '../lib/auth/types';

// Mock database service for testing
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

async function testGame() {
  // Initialize game manager
  const gameManager = new GameModeManager(mockDb);

  // Test AI mode
  console.log('Testing AI mode...');
  await gameManager.initializeGameMode('ai', {
    difficulty: 'intermediate'
  });
  
  // Make a move (e2 to e4)
  const moveResult = await gameManager.makeMove(
    { x: 4, y: 1, layer: 0 }, // from e2
    { x: 4, y: 3, layer: 0 }  // to e4
  );
  console.log('Move result:', moveResult);
  console.log('Game state:', gameManager.getGameState());

  // Test multiplayer mode
  console.log('\nTesting multiplayer mode...');
  const testUser = {
    id: 'test123',
    username: 'TestPlayer',
    email: 'test@example.com'
  };

  try {
    await gameManager.initializeGameMode('multiplayer', {
      user: testUser,
      serverUrl: 'ws://localhost:3000'
    });
    console.log('Multiplayer mode initialized');
  } catch (error) {
    console.log('Multiplayer connection error:', error);
  }

  // Test local mode
  console.log('\nTesting local mode...');
  await gameManager.initializeGameMode('local');
  const localMoveResult = await gameManager.makeMove(
    { x: 4, y: 1, layer: 0 }, // from e2
    { x: 4, y: 3, layer: 0 }  // to e4
  );
  console.log('Local move result:', localMoveResult);
}

// Run the test
testGame().catch(console.error); 