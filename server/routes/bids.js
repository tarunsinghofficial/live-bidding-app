const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth } = require('../middleware/auth');
const { cacheUtils } = require('../config/redis');
const rateLimits = require('../middleware/rateLimiter');

const router = express.Router();
const viewCache = new Map();
const VIEW_TTL_MS = 5 * 60 * 1000;

const shouldCountView = (auctionId, viewId) => {
  if (!viewId) return true;
  const key = `${auctionId}:${viewId}`;
  const now = Date.now();
  const lastSeen = viewCache.get(key);
  if (lastSeen && now - lastSeen < VIEW_TTL_MS) {
    return false;
  }
  viewCache.set(key, now);
  return true;
};

// Place bid on auction
router.post('/:id/bid', auth, async (req, res) => {
  try {
    console.log('Bid request received:', {
      auctionId: req.params.id,
      amount: req.body.amount,
      user: req.user ? req.user.username : 'No user'
    });

    const { amount } = req.body;
    const auctionId = req.params.id;
    const userId = req.user._id;

    // Validate bid amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    // Get auction and check if it's active
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (auction.auctionEndTime <= new Date()) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Check if user is the current highest bidder
    if (auction.currentBidder && auction.currentBidder.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You are already the highest bidder' });
    }

    // Check minimum bid increment
    const minBid = (auction.currentBid || auction.startingPrice) + (auction.settings?.minBidIncrement || 10);
    if (amount < minBid) {
      return res.status(400).json({ 
        message: `Minimum bid is $${minBid.toFixed(2)}` 
      });
    }

    // Create bid record
    const bid = new Bid({
      auction: auctionId,
      bidder: userId,
      amount,
      status: 'active'
    });

    await bid.save();

    // Update auction
    auction.currentBid = amount;
    auction.currentBidder = userId;
    auction.bidCount = (auction.bidCount || 0) + 1;

    // Auto-extend auction if enabled and bid is placed in last minutes
    if (auction.settings?.autoExtend) {
      const timeLeft = auction.auctionEndTime - new Date();
      const extendThreshold = (auction.settings?.extendMinutes || 5) * 60 * 1000; // 5 minutes default
      
      if (timeLeft <= extendThreshold) {
        auction.auctionEndTime = new Date(auction.auctionEndTime.getTime() + extendThreshold);
      }
    }

    await auction.save();

    // Clear cache (temporarily disabled)
    // await cacheUtils.del(`auctions:public:*`);
    // await cacheUtils.del(`auction:${auctionId}`);

    // Populate user info for response
    const populatedAuction = await Auction.findById(auctionId)
      .populate('currentBidder', 'username')
      .populate('createdBy', 'username');

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${auctionId}`).emit('bidPlaced', {
        auction: populatedAuction,
        bid: {
          amount,
          bidder: { username: req.user.username },
          timestamp: bid.timestamp
        }
      });
    }

    res.json({
      message: 'Bid placed successfully',
      auction: populatedAuction,
      bid
    });

  } catch (error) {
    console.error('Bid placement error:', error);
    res.status(500).json({ message: 'Failed to place bid', error: error.message });
  }
});

// User bid history
router.get('/user/history', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('auction', 'title images currentBid startingPrice auctionEndTime status winner')
      .sort({ timestamp: -1 });

    res.json({ bids });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bid history', error: error.message });
  }
});

// Get single auction (public view)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // const cacheKey = `auction:${id}`;
    
    // Try cache first (temporarily disabled)
    // const cached = await cacheUtils.get(cacheKey);
    // if (cached) {
    //   return res.json({ auction: cached });
    // }

    const auction = await Auction.findById(id)
      .populate('createdBy', 'username')
      .populate('currentBidder', 'username')
      .populate('winner', 'username');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Increment view count (deduped per view id)
    const viewId = req.header('X-View-Id');
    if (shouldCountView(id, viewId)) {
      auction.metadata.views = (auction.metadata.views || 0) + 1;
      await auction.save();
    }

    // Cache for 60 seconds (temporarily disabled)
    // await cacheUtils.set(cacheKey, auction, 60);

    res.json({ auction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auction', error: error.message });
  }
});

// Get auction bids
router.get('/:id/bids', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    // const cacheKey = `auction:${id}:bids:${page}:${limit}`;
    
    // Try cache first (temporarily disabled)
    // const cached = await cacheUtils.get(cacheKey);
    // if (cached) {
    //   return res.json(cached);
    // }

    const bids = await Bid.find({ auction: id })
      .populate('bidder', 'username')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bid.countDocuments({ auction: id });

    const result = {
      bids,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    // Cache for 30 seconds (temporarily disabled)
    // await cacheUtils.set(cacheKey, result, 30);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bids', error: error.message });
  }
});

module.exports = router;
