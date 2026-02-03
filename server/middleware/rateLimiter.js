const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

// General rate limiting
const createRateLimit = (windowMs, max, message) => {
  const redisClient = getRedisClient();
  
  return rateLimit({
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }) : undefined,
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // Auth endpoints - stricter limits
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts, please try again later'
  ),

  // General API limits
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests, please try again later'
  ),

  // Bidding - very strict to prevent spam
  bidding: createRateLimit(
    60 * 1000, // 1 minute
    10, // 10 bids per minute
    'Too many bids, please slow down'
  ),

  // Auction creation - admin only but still limited
  auctionCreation: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 auctions per hour
    'Too many auctions created, please try again later'
  )
};

module.exports = rateLimits;
