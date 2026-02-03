const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth, adminAuth } = require('../middleware/auth');
const { cacheUtils } = require('../config/redis');
const rateLimits = require('../middleware/rateLimiter');

const router = express.Router();

// User auction history
router.get('/user/history', auth, async (req, res) => {
  try {
    const auctions = await Auction.find({ createdBy: req.user._id })
      .populate('currentBidder', 'username')
      .populate('winner', 'username')
      .sort({ createdAt: -1 });

    res.json({ auctions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user auctions', error: error.message });
  }
});

// Get all auctions (public view)
router.get('/public', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    // const cacheKey = `auctions:public:${JSON.stringify({ status, category, page, limit })}`;
    
    // Try to get from cache first (temporarily disabled)
    // const cached = await cacheUtils.get(cacheKey);
    // if (cached) {
    //   return res.json(cached);
    // }

    const query = { status: 'active' }; // Only show active auctions to public
    if (category) query.category = category;

    const auctions = await Auction.find(query)
      .populate('createdBy', 'username')
      .populate('currentBidder', 'username')
      .sort({ auctionEndTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(query);

    const result = {
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    // Cache for 30 seconds (temporarily disabled)
    // await cacheUtils.set(cacheKey, result, 30);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auctions', error: error.message });
  }
});

// Get all auctions (admin view)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const auctions = await Auction.find(query)
      .populate('createdBy', 'username email')
      .populate('currentBidder', 'username')
      .populate('winner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(query);

    res.json({
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auctions', error: error.message });
  }
});

// Create new auction
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    // Debug: Log the user object
    console.log('User creating auction:', req.user);
    
    const auctionData = {
      ...req.body,
      createdBy: req.user._id,
      status: 'draft'
    };

    const auction = new Auction(auctionData);
    await auction.save();

    const populatedAuction = await Auction.findById(auction._id)
      .populate('createdBy', 'username email');

    res.status(201).json({
      message: 'Auction created successfully',
      auction: populatedAuction
    });
  } catch (error) {
    console.error('Auction creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create auction', 
      error: error.message,
      details: error.errors 
    });
  }
});

// Get single auction
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('currentBidder', 'username')
      .populate('winner', 'username');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json({ auction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auction', error: error.message });
  }
});

// Update auction
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Don't allow editing if auction is active
    if (auction.status === 'active') {
      return res.status(400).json({ message: 'Cannot edit active auction' });
    }

    Object.assign(auction, req.body);
    await auction.save();

    const updatedAuction = await Auction.findById(auction._id)
      .populate('createdBy', 'username email')
      .populate('currentBidder', 'username')
      .populate('winner', 'username');

    res.json({
      message: 'Auction updated successfully',
      auction: updatedAuction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update auction', error: error.message });
  }
});

// Start auction
router.post('/:id/start', auth, adminAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'draft') {
      return res.status(400).json({ message: 'Auction can only be started from draft status' });
    }

    auction.status = 'active';
    auction.currentBid = auction.startingPrice;
    await auction.save();

    res.json({
      message: 'Auction started successfully',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start auction', error: error.message });
  }
});

// End auction
router.post('/:id/end', auth, adminAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Only active auctions can be ended' });
    }

    auction.status = 'ended';
    if (auction.currentBidder) {
      auction.winner = auction.currentBidder;
      auction.finalPrice = auction.currentBid;
    }

    await auction.save();

    res.json({
      message: 'Auction ended successfully',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to end auction', error: error.message });
  }
});

// Delete auction
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete active auction' });
    }

    await Auction.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ auction: req.params.id });

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete auction', error: error.message });
  }
});

// Get auction statistics
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Promise.all([
      Auction.countDocuments({ status: 'draft' }),
      Auction.countDocuments({ status: 'active' }),
      Auction.countDocuments({ status: 'ended' }),
      Auction.countDocuments({ status: 'cancelled' }),
      Bid.countDocuments(),
      Auction.aggregate([
        { $match: { status: 'ended' } },
        { $group: { _id: null, totalRevenue: { $sum: '$finalPrice' } } }
      ])
    ]);

    res.json({
      draftAuctions: stats[0],
      activeAuctions: stats[1],
      endedAuctions: stats[2],
      cancelledAuctions: stats[3],
      totalBids: stats[4],
      totalRevenue: stats[5][0]?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;
