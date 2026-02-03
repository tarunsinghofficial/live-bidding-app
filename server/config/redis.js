const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      console.log('Continuing without Redis in development mode...');
      return null;
    }
  }
};

const getRedisClient = () => redisClient;

// Cache utility functions
const cacheUtils = {
  // Set cache with expiration
  set: async (key, value, expireInSeconds = 3600) => {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache value
  get: async (key) => {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  del: async (key) => {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Increment counter
  incr: async (key) => {
    if (!redisClient) return 0;
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  },

  // Set with TTL
  setWithTTL: async (key, value, ttlInSeconds) => {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, ttlInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set with TTL error:', error);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheUtils
};
