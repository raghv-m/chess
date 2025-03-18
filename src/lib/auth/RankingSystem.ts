import { User, UserStats, DatabaseService, GameResult } from './types';

export class RankingSystem {
  private static readonly INITIAL_RATING = 1200;
  private static readonly K_FACTOR_BASE = 32;
  private static readonly RANKS = [
    { name: 'Novice', minRating: 0, kFactor: 40 },
    { name: 'Beginner', minRating: 1000, kFactor: 36 },
    { name: 'Intermediate', minRating: 1200, kFactor: 32 },
    { name: 'Advanced', minRating: 1400, kFactor: 28 },
    { name: 'Expert', minRating: 1600, kFactor: 24 },
    { name: 'Master', minRating: 1800, kFactor: 20 },
    { name: 'Grandmaster', minRating: 2000, kFactor: 16 }
  ];

  constructor(private db: DatabaseService) {}

  public async updateMatchResult(
    userId: string,
    opponentId: string,
    result: 'win' | 'loss' | 'draw'
  ): Promise<void> {
    const playerStats = await this.db.getUserStats(userId);
    const opponentStats = await this.db.getUserStats(opponentId);

    // Calculate rating changes
    const [playerNewRating, opponentNewRating] = this.calculateRatingChanges(
      playerStats.rating,
      opponentStats.rating,
      result
    );

    // Update player stats
    await this.db.updateMatchResult(userId, opponentId, result);

    // Update ratings
    await this.db.updateUserStats(userId, {
      ...playerStats,
      rating: playerNewRating
    });

    await this.db.updateUserStats(opponentId, {
      ...opponentStats,
      rating: opponentNewRating
    });
  }

  private calculateRatingChanges(
    playerRating: number,
    opponentRating: number,
    result: 'win' | 'loss' | 'draw'
  ): [number, number] {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;

    // Get K-factors based on ratings
    const playerKFactor = this.getKFactor(playerRating);
    const opponentKFactor = this.getKFactor(opponentRating);

    // Calculate rating changes
    const playerRatingChange = Math.round(playerKFactor * (actualScore - expectedScore));
    const opponentRatingChange = Math.round(opponentKFactor * (expectedScore - actualScore));

    // Apply rating changes with bounds
    const playerNewRating = this.boundRating(playerRating + playerRatingChange);
    const opponentNewRating = this.boundRating(opponentRating + opponentRatingChange);

    return [playerNewRating, opponentNewRating];
  }

  private getKFactor(rating: number): number {
    const rank = RankingSystem.RANKS
      .slice()
      .reverse()
      .find(r => rating >= r.minRating);
    return rank?.kFactor || RankingSystem.K_FACTOR_BASE;
  }

  private boundRating(rating: number): number {
    return Math.max(100, Math.min(3000, rating));
  }

  public getRank(rating: number): string {
    const rank = RankingSystem.RANKS
      .slice()
      .reverse()
      .find(r => rating >= r.minRating);
    return rank?.name || 'Novice';
  }

  public getNextRank(rating: number): { name: string; pointsNeeded: number } | null {
    const currentRankIndex = RankingSystem.RANKS.findIndex(r => r.minRating > rating) - 1;
    if (currentRankIndex < RankingSystem.RANKS.length - 1) {
      const nextRank = RankingSystem.RANKS[currentRankIndex + 1];
      return {
        name: nextRank.name,
        pointsNeeded: nextRank.minRating - rating
      };
    }
    return null;
  }

  public async getLeaderboard(limit: number = 100): Promise<Array<User & UserStats>> {
    const players = await this.db.getTopPlayers();
    return players.slice(0, limit).map(player => ({
      ...player,
      rank: this.getRank(player.rating)
    }));
  }

  public async getPlayerStats(userId: string): Promise<UserStats & { rank: string; nextRank?: { name: string; pointsNeeded: number } }> {
    const stats = await this.db.getUserStats(userId);
    const rank = this.getRank(stats.rating);
    const nextRank = this.getNextRank(stats.rating);

    return {
      ...stats,
      rank,
      ...(nextRank && { nextRank })
    };
  }

  public async getMatchHistory(userId: string, limit: number = 10): Promise<GameResult[]> {
    const history = await this.db.getMatchHistory(userId);
    return history.slice(0, limit);
  }
} 