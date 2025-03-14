const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectToDatabase = require('./db');
const userRoutes = require('./routes/userRoutes');
const canvasRoutes = require('./routes/canvasRoutes');

const port = process.env.PORT || 3030;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with optimized settings
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000",
      "https://whiteboard-ankits-projects-75ac4c51.vercel.app/",
      "https://whiteboard-delta-lime.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"]
  },
  pingTimeout: 30000,
  pingInterval: 5000,
  transports: ['websocket', 'polling'], // Allow polling as fallback
  maxHttpBufferSize: 1e8 // 100 MB
});

// Store active canvas rooms
const activeCanvases = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join canvas room
  socket.on('joinCanvas', (canvasId) => {
    socket.join(canvasId);
    console.log(`User joined canvas: ${canvasId}`);

    // Track active users in canvas
    if (!activeCanvases.has(canvasId)) {
      activeCanvases.set(canvasId, new Set());
    }
    activeCanvases.get(canvasId).add(socket.id);

    // Notify room about new user
    io.to(canvasId).emit('userJoined', {
      count: activeCanvases.get(canvasId).size
    });
  });

  // Handle canvas updates with debouncing on server side
  let updateTimeout = null;
  socket.on('canvasUpdate', ({ canvasId, elements }) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      console.log(`Broadcasting canvas update for: ${canvasId}`);
      socket.to(canvasId).emit('canvasUpdated', elements);
    }, 16);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    activeCanvases.forEach((users, canvasId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          activeCanvases.delete(canvasId);
        } else {
          // Notify room about user leaving
          io.to(canvasId).emit('userLeft', {
            count: users.size
          });
        }
      }
    });
    console.log('User disconnected');
  });
});

connectToDatabase();

// Configure CORS for Express
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add authentication error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
  } else {
    next(err);
  }
});

app.use('/user', userRoutes);
app.use('/canvas', canvasRoutes);

server.listen(port, () => {
  console.log(`🚀 Server is listening on http://localhost:${port}`);
});