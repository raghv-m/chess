const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Store active games
const games = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  let gameId = null;
  let playerId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'joinGame':
        gameId = data.gameId;
        playerId = data.playerId;
        
        if (!games.has(gameId)) {
          games.set(gameId, {
            players: new Set(),
            currentTurn: 'white',
            moves: []
          });
        }
        
        const game = games.get(gameId);
        game.players.add(playerId);
        
        // Notify all players in the game
        broadcastToGame(gameId, {
          type: 'playerJoined',
          playerId
        });

        // If two players have joined, start the game
        if (game.players.size === 2) {
          broadcastToGame(gameId, {
            type: 'gameStart',
            players: Array.from(game.players)
          });
        }
        break;

      case 'move':
        if (gameId && games.has(gameId)) {
          const game = games.get(gameId);
          game.moves.push(data.move);
          game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
          
          broadcastToGame(gameId, {
            type: 'move',
            move: data.move,
            currentTurn: game.currentTurn
          });
        }
        break;

      case 'chat':
        if (gameId && games.has(gameId)) {
          broadcastToGame(gameId, {
            type: 'chat',
            message: data.message,
            playerId
          });
        }
        break;

      case 'resign':
        if (gameId && games.has(gameId)) {
          broadcastToGame(gameId, {
            type: 'gameEnd',
            winner: game.currentTurn === 'white' ? 'black' : 'white',
            reason: 'resignation'
          });
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
    }
  });

  ws.on('close', () => {
    if (gameId && games.has(gameId)) {
      const game = games.get(gameId);
      game.players.delete(playerId);
      
      if (game.players.size === 0) {
        games.delete(gameId);
      } else {
        broadcastToGame(gameId, {
          type: 'playerLeft',
          playerId
        });
      }
    }
  });
});

function broadcastToGame(gameId, data) {
  const game = games.get(gameId);
  if (!game) return;

  game.players.forEach(playerId => {
    const client = Array.from(wss.clients).find(
      client => client.playerId === playerId
    );
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 