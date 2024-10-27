// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const rateLimiter = {
  // API rate limiter
  apiLimiter: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:api:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  }),

  // Login rate limiter
  loginLimiter: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:login:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later'
  }),

  // Ride booking rate limiter
  bookingLimiter: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:booking:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 booking attempts per windowMs
    message: 'Too many booking attempts, please try again later'
  })
};

module.exports = rateLimiter;