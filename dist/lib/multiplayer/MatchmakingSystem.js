"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingSystem = void 0;
class MatchmakingSystem {
    constructor(rankingSystem, onMatchFound) {
        this.rankingSystem = rankingSystem;
        this.onMatchFound = onMatchFound;
        this.activeRequests = new Map();
        this.MATCH_TIMEOUT = 60000; // 60 seconds
        this.MAX_RATING_DIFF = 200;
    }
    async addToQueue(user, preferences) {
        // Get player stats
        const stats = await this.rankingSystem.getPlayerStats(user.id);
        // Create match request
        const request = {
            user,
            stats,
            timestamp: Date.now(),
            preferences
        };
        // Add to queue
        this.activeRequests.set(user.id, request);
        // Try to find a match
        this.findMatch(request);
        // Set timeout to remove from queue
        setTimeout(() => {
            this.removeFromQueue(user.id);
        }, this.MATCH_TIMEOUT);
    }
    removeFromQueue(userId) {
        this.activeRequests.delete(userId);
    }
    async findMatch(request) {
        const matches = [];
        // Calculate match scores for all active requests
        for (const [id, otherRequest] of this.activeRequests.entries()) {
            if (id === request.user.id)
                continue;
            const score = this.calculateMatchScore(request, otherRequest);
            if (score > 0) {
                matches.push([id, score]);
            }
        }
        // Sort matches by score (descending)
        matches.sort((a, b) => b[1] - a[1]);
        // If we found a match, create the game
        if (matches.length > 0) {
            const [matchedId] = matches[0];
            const matchedRequest = this.activeRequests.get(matchedId);
            // Remove both players from queue
            this.removeFromQueue(request.user.id);
            this.removeFromQueue(matchedId);
            // Create the match
            this.onMatchFound(request.user, matchedRequest.user);
        }
    }
    calculateMatchScore(request1, request2) {
        // Base score starts at 1
        let score = 1;
        // Rating difference penalty
        const ratingDiff = Math.abs(request1.stats.rating - request2.stats.rating);
        if (ratingDiff > this.MAX_RATING_DIFF)
            return 0;
        score *= 1 - (ratingDiff / this.MAX_RATING_DIFF);
        // Time in queue bonus
        const waitTime = Math.min(Date.now() - request2.timestamp, this.MATCH_TIMEOUT);
        score *= 1 + (waitTime / this.MATCH_TIMEOUT);
        // Preference matching
        if (request1.preferences && request2.preferences) {
            // Time control preference
            if (request1.preferences.timeControl === request2.preferences.timeControl) {
                score *= 1.2;
            }
            // Color preference
            if (request1.preferences.preferredColor && request2.preferences.preferredColor) {
                if (request1.preferences.preferredColor !== request2.preferences.preferredColor) {
                    score *= 1.3;
                }
                else {
                    score *= 0.7;
                }
            }
        }
        return score;
    }
    getQueueStatus() {
        const players = Array.from(this.activeRequests.values());
        const now = Date.now();
        return {
            playersInQueue: players.length,
            averageWaitTime: players.reduce((sum, p) => sum + (now - p.timestamp), 0) / players.length,
            ratingRanges: {
                min: Math.min(...players.map(p => p.stats.rating)),
                max: Math.max(...players.map(p => p.stats.rating))
            }
        };
    }
}
exports.MatchmakingSystem = MatchmakingSystem;
//# sourceMappingURL=MatchmakingSystem.js.map