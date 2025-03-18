"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = require("http");
const server = (0, http_1.createServer)();
const wss = new ws_1.WebSocketServer({ server });
const activeSessions = new Map();
const userSessions = new Map();
wss.on('connection', (ws) => {
    let userId;
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'auth':
                userId = data.userId;
                userSessions.set(userId, ws);
                break;
            case 'create_game':
                const gameId = Math.random().toString(36).substring(7);
                const session = {
                    id: gameId,
                    players: {
                        white: data.player1,
                        black: data.player2
                    },
                    gameState: data.initialState,
                    moves: []
                };
                activeSessions.set(gameId, session);
                // Notify both players
                const player1Ws = userSessions.get(data.player1.id);
                const player2Ws = userSessions.get(data.player2.id);
                if (player1Ws && player2Ws) {
                    player1Ws.send(JSON.stringify({
                        type: 'game_start',
                        gameId,
                        color: 'white',
                        opponent: data.player2
                    }));
                    player2Ws.send(JSON.stringify({
                        type: 'game_start',
                        gameId,
                        color: 'black',
                        opponent: data.player1
                    }));
                }
                break;
            case 'move':
                const { gameId, move } = data;
                const gameSession = activeSessions.get(gameId);
                if (gameSession) {
                    gameSession.moves.push(move);
                    gameSession.gameState = data.newState;
                    // Notify opponent
                    const opponent = move.piece.color === 'white'
                        ? gameSession.players.black
                        : gameSession.players.white;
                    const opponentWs = userSessions.get(opponent.id);
                    if (opponentWs) {
                        opponentWs.send(JSON.stringify({
                            type: 'opponent_move',
                            move,
                            gameState: gameSession.gameState
                        }));
                    }
                }
                break;
            case 'chat':
                const { gameId: chatGameId, message } = data;
                const chatSession = activeSessions.get(chatGameId);
                if (chatSession) {
                    // Broadcast chat message to both players
                    const wsConnections = [
                        userSessions.get(chatSession.players.white.id),
                        userSessions.get(chatSession.players.black.id)
                    ];
                    wsConnections.forEach(conn => {
                        if (conn && conn !== ws) {
                            conn.send(JSON.stringify({
                                type: 'chat_message',
                                message
                            }));
                        }
                    });
                }
                break;
            case 'resign':
                const { gameId: resignGameId } = data;
                const resignSession = activeSessions.get(resignGameId);
                if (resignSession) {
                    const winner = userId === resignSession.players.white.id
                        ? resignSession.players.black
                        : resignSession.players.white;
                    // Notify both players
                    [resignSession.players.white.id, resignSession.players.black.id]
                        .map(id => userSessions.get(id))
                        .forEach(conn => {
                        if (conn) {
                            conn.send(JSON.stringify({
                                type: 'game_end',
                                reason: 'resignation',
                                winner
                            }));
                        }
                    });
                    activeSessions.delete(resignGameId);
                }
                break;
        }
    });
    ws.on('close', () => {
        if (userId) {
            userSessions.delete(userId);
            // Handle disconnection in active games
            for (const [gameId, session] of activeSessions) {
                if (session.players.white.id === userId || session.players.black.id === userId) {
                    const winner = session.players.white.id === userId
                        ? session.players.black
                        : session.players.white;
                    const opponentId = winner.id;
                    const opponentWs = userSessions.get(opponentId);
                    if (opponentWs) {
                        opponentWs.send(JSON.stringify({
                            type: 'game_end',
                            reason: 'disconnection',
                            winner
                        }));
                    }
                    activeSessions.delete(gameId);
                }
            }
        }
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map