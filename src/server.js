const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory with logging
const publicPath = path.join(__dirname, '../public');
console.log('Serving static files from:', publicPath);

// Serve static files with proper MIME types
app.use(express.static(publicPath));

// Explicit route for sound files
app.use('/sounds', express.static(path.join(publicPath, 'sounds'), {
  setHeaders: (res, path) => {
    // Set proper MIME type for audio files
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
    console.log('Serving sound file:', path);
  }
}));

// Log all static file requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test route to check if server is working
app.get('/test', (req, res) => {
  res.send('Server is working!');
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Game state
const gameState = {
  players: {},
  leaderboard: []
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Add player to game state
  socket.on('join', (playerName) => {
    gameState.players[socket.id] = {
      name: playerName,
      score: 0,
      level: 1,
      lines: 0
    };
    socket.emit('gameState', gameState);
  });

  // Handle player movement
  socket.on('move', (direction) => {
    // Broadcast the move to all other players
    socket.broadcast.emit('playerMoved', {
      playerId: socket.id,
      direction: direction
    });
  });

  // Handle score updates
  socket.on('updateScore', (scoreData) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].score = scoreData.score;
      gameState.players[socket.id].level = scoreData.level;
      gameState.players[socket.id].lines = scoreData.lines;
      
      // Update leaderboard
      updateLeaderboard();
      io.emit('leaderboardUpdate', gameState.leaderboard);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    delete gameState.players[socket.id];
    updateLeaderboard();
    io.emit('leaderboardUpdate', gameState.leaderboard);
  });
});

// Helper function to update leaderboard
function updateLeaderboard() {
  gameState.leaderboard = Object.values(gameState.players)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
