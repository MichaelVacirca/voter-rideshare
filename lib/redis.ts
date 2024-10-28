// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/redis.ts
// Redis configuration - caching for speed and reliability!

import { Redis } from 'ioredis';
import { REDIS_CONFIG } from '@/config';

if (!process.env.REDIS_URL) {
  throw new Error('Please add your Redis URL to .env');
}

const globalForRedis = global as unknown as {
  redis: Redis | undefined;
};

const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export const redisClient = {
  get: async (key: string) => {
    try {
      return await redis.get(REDIS_CONFIG.keyPrefix + key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  set: async (key: string, value: string) => {
    try {
      return await redis.set(REDIS_CONFIG.keyPrefix + key, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },

  setex: async (key: string, seconds: number, value: string) => {
    try {
      return await redis.setex(REDIS_CONFIG.keyPrefix + key, seconds, value);
    } catch (error) {
      console.error('Redis setex error:', error);
    }
  },

  del: async (key: string) => {
    try {
      return await redis.del(REDIS_CONFIG.keyPrefix + key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  },

  keys: async (pattern: string) => {
    try {
      return await redis.keys(REDIS_CONFIG.keyPrefix + pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  },
};