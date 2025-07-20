const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Store active games and players
const games = new Map();
const players = new Map(); // socket -> player info

// WebSocket connection handling
wss.on('connection', (ws) => {
  let gameId = null;
  let playerId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type, data);

      switch (data.type) {
        case 'joinGame':
          gameId = data.gameId;
          playerId = data.playerId;
          
          // Set playerId on the socket object for broadcasting
          ws.playerId = playerId;
          players.set(ws, { gameId, playerId });
          
          if (!games.has(gameId)) {
            games.set(gameId, {
              players: new Map(), // playerId -> socket
              currentTurn: 'white',
              moves: [],
              gameState: null,
              playerColors: new Map() // playerId -> color
            });
          }
          
          const game = games.get(gameId);
          game.players.set(playerId, ws);
          
          // Assign colors if this is the first or second player
          if (game.playerColors.size === 0) {
            game.playerColors.set(playerId, 'white');
          } else if (game.playerColors.size === 1) {
            game.playerColors.set(playerId, 'black');
          }
          
          // Notify all players in the game
          broadcastToGame(gameId, {
            type: 'playerJoined',
            playerId,
            color: game.playerColors.get(playerId)
          });

          // If two players have joined, start the game
          if (game.players.size === 2) {
            // Initialize game state here if needed
            broadcastToGame(gameId, {
              type: 'gameStart',
              players: Array.from(game.players.keys()),
              colors: Object.fromEntries(game.playerColors)
            });
          }
          break;

        case 'move':
          if (gameId && games.has(gameId)) {
            const game = games.get(gameId);
            const playerColor = game.playerColors.get(playerId);
            
            // Validate that it's the player's turn
            if (playerColor !== game.currentTurn) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Not your turn'
              }));
              return;
            }
            
            game.moves.push(data.move);
            game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
            
            // Update game state if provided
            if (data.gameState) {
              game.gameState = data.gameState;
            }
            
            broadcastToGame(gameId, {
              type: 'move',
              move: data.move,
              currentTurn: game.currentTurn,
              gameState: game.gameState
            });
          }
          break;

        case 'chat':
          if (gameId && games.has(gameId)) {
            broadcastToGame(gameId, {
              type: 'chat',
              message: data.message,
              playerId,
              timestamp: Date.now()
            });
          }
          break;

        case 'resign':
          if (gameId && games.has(gameId)) {
            const game = games.get(gameId);
            const winner = game.currentTurn === 'white' ? 'black' : 'white';
            
            broadcastToGame(gameId, {
              type: 'gameEnd',
              winner,
              reason: 'resignation',
              resignedPlayer: playerId
            });
            
            // Clean up the game
            games.delete(gameId);
          }
          break;

        case 'drawOffer':
          if (gameId && games.has(gameId)) {
            broadcastToGame(gameId, { 
              type: 'drawOffer',
              playerId
            });
          }
          break;

        case 'drawResponse':
          if (gameId && games.has(gameId)) {
            if (data.accepted) {
              broadcastToGame(gameId, {
                type: 'gameEnd',
                reason: 'draw'
              });
              games.delete(gameId);
            } else {
              broadcastToGame(gameId, {
                type: 'drawDeclined',
                playerId
              });
            }
          }
          break;

        case 'requestActiveUsers':
          // Count active users across all games
          const activeUsers = new Set();
          games.forEach(game => {
            game.players.forEach((socket, playerId) => {
              if (socket.readyState === WebSocket.OPEN) {
                activeUsers.add(playerId);
              }
            });
          });
          
          ws.send(JSON.stringify({
            type: 'activeUsers',
            count: activeUsers.size,
            users: Array.from(activeUsers)
          }));
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected:', playerId);
    
    if (gameId && games.has(gameId)) {
      const game = games.get(gameId);
      game.players.delete(playerId);
      game.playerColors.delete(playerId);
      
      if (game.players.size === 0) {
        games.delete(gameId);
      } else {
        broadcastToGame(gameId, {
          type: 'playerLeft',
          playerId
        });
      }
    }
    
    players.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastToGame(gameId, data) {
  const game = games.get(gameId);
  if (!game) return;

  game.players.forEach((socket, playerId) => {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending message to player:', playerId, error);
      }
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeGames: games.size,
    activePlayers: players.size
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
}); 