// middlewares/cache.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const cache = {
  // Cache middleware
  cacheResponse: (duration) => {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl || req.url}`;
      
      try {
        const cachedResponse = await redis.get(key);
        
        if (cachedResponse) {
          return res.json(JSON.parse(cachedResponse));
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function(body) {
          redis.setex(key, duration, JSON.stringify(body));
          return originalJson.call(this, body);
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Clear cache by pattern
  clearCache: (pattern) => {
    return async (req, res, next) => {
      try {
        const keys = await redis.keys(`cache:${pattern}`);
        if (keys.length) {
          await redis.del(keys);
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Cache with user-specific data
  cacheUserResponse: (duration) => {
    return async (req, res, next) => {
      if (req.method !== 'GET' || !req.user) {
        return next();
      }

      const key = `cache:${req.user._id}:${req.originalUrl || req.url}`;
      
      try {
        const cachedResponse = await redis.get(key);
        
        if (cachedResponse) {
          return res.json(JSON.parse(cachedResponse));
        }

        const originalJson = res.json;
        res.json = function(body) {
          redis.setex(key, duration, JSON.stringify(body));
          return originalJson.call(this, body);
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }
};

module.exports = cache;