export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  rating: number;
  winStreak: number;
}

export interface GameResult {
  opponent: User;
  result: 'win' | 'loss' | 'draw';
  date: Date;
}

export interface DatabaseService {
  getUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, stats: UserStats): Promise<void>;
  updateMatchResult(userId: string, opponentId: string, result: 'win' | 'loss' | 'draw'): Promise<void>;
  getTopPlayers(): Promise<Array<User & UserStats>>;
  getMatchHistory(userId: string): Promise<GameResult[]>;
}

export interface PlayerStats {
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winStreak: number;
  rank?: string;
}

export interface GameInvite {
  id: string;
  from: User;
  to: User;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  boardStyle: 'classic' | 'modern';
  pieceStyle: 'classic' | 'modern';
  soundEnabled: boolean;
  notifications: boolean;
} 