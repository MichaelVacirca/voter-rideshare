// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /middleware/rate-limit.ts
// Rate limiting middleware - protecting our resources!

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redisClient } from '@/lib/redis';

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in seconds */
  window: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 100,
  window: 60,
};

const ENDPOINTS_CONFIG: Record<string, RateLimitConfig> = {
  '/api/rides': { limit: 50, window: 60 },
  '/api/auth': { limit: 20, window: 60 },
};

export async function rateLimit(
  request: NextRequest,
  response: NextResponse
) {
  const ip = request.ip || 'anonymous';
  const path = request.nextUrl.pathname;
  
  const config = ENDPOINTS_CONFIG[path] || DEFAULT_CONFIG;
  const key = `rate-limit:${ip}:${path}`;

  try {
    const current = await redisClient.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= config.limit) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': config.window.toString(),
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Math.ceil(Date.now() / 1000) + config.window).toString(),
        },
      });
    }

    await redisClient.setex(key, config.window, (count + 1).toString());

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      (config.limit - (count + 1)).toString()
    );
    response.headers.set(
      'X-RateLimit-Reset',
      (Math.ceil(Date.now() / 1000) + config.window).toString()
    );

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request
    return response;
  }
}