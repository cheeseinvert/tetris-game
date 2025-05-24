import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
// Serve compiled JavaScript from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));
// Serve the main HTML file for all routes (for SPA)
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');
    // Handle game events
    socket.on('scoreUpdate', (score) => {
        // Broadcast the score to all connected clients
        io.emit('scoreUpdate', score);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
//# sourceMappingURL=server.js.map