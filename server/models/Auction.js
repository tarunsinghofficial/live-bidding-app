const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'vehicles', 'jewelry', 'art', 'collectibles', 'fashion', 'home', 'sports', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reservePrice: {
    type: Number,
    min: 0
  },
  currentBid: {
    type: Number,
    default: 0
  },
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bidCount: {
    type: Number,
    default: 0
  },
  auctionEndTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalPrice: {
    type: Number
  },
  settings: {
    autoExtend: { type: Boolean, default: true },
    extendMinutes: { type: Number, default: 5 },
    minBidIncrement: { type: Number, default: 10 }
  },
  metadata: {
    views: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

auctionSchema.index({ auctionEndTime: 1 });
auctionSchema.index({ status: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
