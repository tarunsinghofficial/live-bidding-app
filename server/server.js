const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const items = require("./data/data");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

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

// Lock mechanism for handling race conditions
// we're using Map to store locks per item
const bidLocks = new Map();

/**
 * Acquire a lock for an item to prevent concurrent bids
 * Returns true if lock was acquired, false if already locked
 */
function acquireLock(itemId) {
  if (bidLocks.has(itemId)) {
    return false; // Lock already exists
  }
  bidLocks.set(itemId, Date.now());
  return true;
}

/**
 * Release the lock for an item
 */
function releaseLock(itemId) {
  bidLocks.delete(itemId);
}

/**
 * socket.io connection handling
 */
io.on("connection", (socket) => {
  console.log(`Client connected with ID- ${socket.id}`);

  // Send current items to new connected client
  socket.emit(
    "items_update",
    items.map((item) => ({
      id: item.id,
      title: item.title,
      startingPrice: item.startingPrice,
      currentBid: item.currentBid,
      auctionEndTime: item.auctionEndTime,
      highestBidder: item.highestBidder,
    })),
  );

  /**
   * Handle BID_PLACED event
   * Validates bid and handles race conditions
   */
  socket.on("BID_PLACED", (bidData) => {
    const { itemId, bidAmount, userId } = bidData;

    // validate input
    if (!itemId || !bidAmount || !userId) {
      socket.emit("BID_ERROR", {
        error:
          "Missing required fields: itemId, bidAmount, and userId are required",
      });
      return;
    }

    // Find the item
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      socket.emit("BID_ERROR", {
        error: "Item not found",
      });
      return;
    }

    // Check if auction has ended
    const now = new Date();
    const endTime = new Date(item.auctionEndTime);
    if (now >= endTime) {
      socket.emit("BID_ERROR", {
        error: "Auction has ended",
      });
      return;
    }

    // acquire lock to handle race
    if (!acquireLock(itemId)) {
      // another bid is being processed, reject this one
      socket.emit("BID_ERROR", {
        error: "Outbid - Another bid was processed first. Please try again.",
      });
      return;
    }

    try {
      // check conditions after acquiring lock
      const currentItem = items.find((i) => i.id === itemId);
      const currentTime = new Date();
      const currentEndTime = new Date(currentItem.auctionEndTime);

      if (currentTime >= currentEndTime) {
        releaseLock(itemId);
        socket.emit("BID_ERROR", {
          error: "Auction has ended",
        });
        return;
      }

      // vvalidate bid amount
      if (bidAmount <= currentItem.currentBid) {
        releaseLock(itemId);
        socket.emit("BID_ERROR", {
          error: `Bid must be higher than current bid of $${currentItem.currentBid}`,
        });
        return;
      }

      // update the item
      const previousBidder = currentItem.highestBidder;
      currentItem.currentBid = bidAmount;
      currentItem.highestBidder = userId;

      // releasing lock before broadcasting
      releaseLock(itemId);

      // finally broadcast UPDATE_BID to all connected clients
      io.emit("UPDATE_BID", {
        itemId: itemId,
        currentBid: bidAmount,
        highestBidder: userId,
        previousBidder: previousBidder,
        timestamp: new Date().toISOString(),
      });

      // Send success msg to the bidder
      socket.emit("BID_SUCCESS", {
        itemId: itemId,
        currentBid: bidAmount,
        message: "Your bid was placed successfully!",
      });

      console.log(
        `Bid placed: Item ${itemId}, Amount: $${bidAmount}, Bidder: ${userId}`,
      );
    } catch (error) {
      // lock is released even on error
      releaseLock(itemId);
      console.error("Error processing bid:", error);
      socket.emit("BID_ERROR", {
        error: "An error occurred while processing your bid",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});
