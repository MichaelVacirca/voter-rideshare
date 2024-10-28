// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/api/health/route.ts
// Health check endpoint - keeping our pulse on the system!

import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const healthCheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'healthy',
    services: {
      database: false,
      redis: false,
    },
  };

  try {
    // Check MongoDB connection
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    healthCheck.services.database = true;

    // Check Redis connection
    await redisClient.set('health-check', 'ok');
    await redisClient.del('health-check');
    healthCheck.services.redis = true;

    return NextResponse.json(healthCheck, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    healthCheck.status = 'unhealthy';
    
    return NextResponse.json(healthCheck, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}