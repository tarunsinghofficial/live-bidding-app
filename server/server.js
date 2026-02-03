require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const rateLimits = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Connect to database and Redis
connectDB();
// connectRedis(); // Temporarily disabled for development

app.use(cors());
app.use(express.json());

// Apply rate limiting (Redis-based temporarily disabled)
// app.use('/api/auth', rateLimits.auth);
// app.use('/api', rateLimits.api);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// configure CORS for socket
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/**
 * Get server time in ISO format to ensure all clients sync with server time
 */
app.get("/api/time", (req, res) => {
  res.json({ serverTime: new Date().toISOString() });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * REST API: GET /items
 * Returns list of auction items
 */
app.get("/api/items", (req, res) => {
  const itemsResponse = items.map((item) => ({
    id: item.id,
    title: item.title,
    startingPrice: item.startingPrice,
    currentBid: item.currentBid,
    auctionEndTime: item.auctionEndTime,
  }));

  res.json(itemsResponse);
});

// Store io instance for use in routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  // Leave auction room
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction:${auctionId}`);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
