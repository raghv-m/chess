"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingSystem = void 0;
class RankingSystem {
    constructor(db) {
        this.db = db;
    }
    async updateMatchResult(userId, opponentId, result) {
        const playerStats = await this.db.getUserStats(userId);
        const opponentStats = await this.db.getUserStats(opponentId);
        // Calculate rating changes
        const [playerNewRating, opponentNewRating] = this.calculateRatingChanges(playerStats.rating, opponentStats.rating, result);
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
    calculateRatingChanges(playerRating, opponentRating, result) {
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
    getKFactor(rating) {
        const rank = RankingSystem.RANKS
            .slice()
            .reverse()
            .find(r => rating >= r.minRating);
        return rank?.kFactor || RankingSystem.K_FACTOR_BASE;
    }
    boundRating(rating) {
        return Math.max(100, Math.min(3000, rating));
    }
    getRank(rating) {
        const rank = RankingSystem.RANKS
            .slice()
            .reverse()
            .find(r => rating >= r.minRating);
        return rank?.name || 'Novice';
    }
    getNextRank(rating) {
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
    async getLeaderboard(limit = 100) {
        const players = await this.db.getTopPlayers();
        return players.slice(0, limit).map(player => ({
            ...player,
            rank: this.getRank(player.rating)
        }));
    }
    async getPlayerStats(userId) {
        const stats = await this.db.getUserStats(userId);
        const rank = this.getRank(stats.rating);
        const nextRank = this.getNextRank(stats.rating);
        return {
            ...stats,
            rank,
            ...(nextRank && { nextRank })
        };
    }
    async getMatchHistory(userId, limit = 10) {
        const history = await this.db.getMatchHistory(userId);
        return history.slice(0, limit);
    }
}
exports.RankingSystem = RankingSystem;
RankingSystem.INITIAL_RATING = 1200;
RankingSystem.K_FACTOR_BASE = 32;
RankingSystem.RANKS = [
    { name: 'Novice', minRating: 0, kFactor: 40 },
    { name: 'Beginner', minRating: 1000, kFactor: 36 },
    { name: 'Intermediate', minRating: 1200, kFactor: 32 },
    { name: 'Advanced', minRating: 1400, kFactor: 28 },
    { name: 'Expert', minRating: 1600, kFactor: 24 },
    { name: 'Master', minRating: 1800, kFactor: 20 },
    { name: 'Grandmaster', minRating: 2000, kFactor: 16 }
];
//# sourceMappingURL=RankingSystem.js.map