"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDatabaseService = void 0;
class InMemoryDatabaseService {
    constructor() {
        this.userStats = new Map();
        this.matchHistory = new Map();
    }
    calculateEloChange(playerRating, opponentRating, result) {
        const K = 32; // K-factor for rating adjustments
        const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
        const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
        return Math.round(K * (actualScore - expectedScore));
    }
    async getUserStats(userId) {
        return this.userStats.get(userId) || {
            wins: 0,
            losses: 0,
            draws: 0,
            gamesPlayed: 0,
            rating: 1200, // Starting ELO rating
            winStreak: 0
        };
    }
    async updateUserStats(userId, stats) {
        // Ensure rating stays within reasonable bounds
        stats.rating = Math.max(100, Math.min(3000, stats.rating));
        this.userStats.set(userId, stats);
    }
    async updateMatchResult(userId, opponentId, result) {
        // Get current stats
        const playerStats = await this.getUserStats(userId);
        const opponentStats = await this.getUserStats(opponentId);
        // Calculate rating changes
        const ratingChange = this.calculateEloChange(playerStats.rating, opponentStats.rating, result);
        // Update player stats
        playerStats.gamesPlayed++;
        if (result === 'win') {
            playerStats.wins++;
            playerStats.winStreak++;
            playerStats.rating += ratingChange;
        }
        else if (result === 'loss') {
            playerStats.losses++;
            playerStats.winStreak = 0;
            playerStats.rating -= ratingChange;
        }
        else {
            playerStats.draws++;
            playerStats.winStreak = 0;
            playerStats.rating += ratingChange / 2;
        }
        // Update opponent stats
        opponentStats.gamesPlayed++;
        if (result === 'win') {
            opponentStats.losses++;
            opponentStats.winStreak = 0;
            opponentStats.rating -= ratingChange;
        }
        else if (result === 'loss') {
            opponentStats.wins++;
            opponentStats.winStreak++;
            opponentStats.rating += ratingChange;
        }
        else {
            opponentStats.draws++;
            opponentStats.winStreak = 0;
            opponentStats.rating += ratingChange / 2;
        }
        // Save updated stats
        await this.updateUserStats(userId, playerStats);
        await this.updateUserStats(opponentId, opponentStats);
        // Update match history
        const opponent = {
            id: opponentId,
            username: `Player ${opponentId}`,
            email: `player${opponentId}@example.com`
        };
        const historyEntry = {
            opponent,
            result,
            date: new Date()
        };
        const playerHistory = this.matchHistory.get(userId) || [];
        playerHistory.unshift(historyEntry);
        this.matchHistory.set(userId, playerHistory.slice(0, 50)); // Keep last 50 matches
    }
    async getTopPlayers() {
        const entries = Array.from(this.userStats.entries());
        const players = entries.map(([userId, stats]) => ({
            id: userId,
            username: `Player ${userId}`,
            email: `player${userId}@example.com`,
            ...stats
        }));
        return players
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 100); // Return top 100 players
    }
    async getMatchHistory(userId) {
        return this.matchHistory.get(userId) || [];
    }
}
exports.InMemoryDatabaseService = InMemoryDatabaseService;
//# sourceMappingURL=DatabaseService.js.map