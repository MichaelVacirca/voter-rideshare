// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/api/rides/route.ts
// API routes for external ride integrations - because sometimes other systems need a lift too!

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { rideService } from '@/lib/services/ride-service';
import { rideRequestSchema } from '@/types/ride';

/**
 * GET handler for retrieving rides
 * @param request - The incoming request
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const rides = await rideService.listRides({
      status: status ?? undefined,
      limit,
      offset,
      userId: session.user.isDriver ? undefined : session.user.id,
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating rides
 * @param request - The incoming request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = rideRequestSchema.parse(body);

    const rideRequest = await rideService.createRideRequest(
      session.user.id,
      validatedData
    );

    return NextResponse.json(rideRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating ride:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}