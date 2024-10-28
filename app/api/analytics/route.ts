// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/api/analytics/route.ts
// Analytics API routes - serving up fresh, hot metrics!

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyticsService } from '@/lib/services/analytics-service';
import { analyticsQuerySchema } from '@/types/analytics';

/**
 * GET handler for analytics data
 * @param request - The incoming request
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const query = analyticsQuerySchema.parse({
      startDate: new Date(searchParams.get('startDate') || ''),
      endDate: new Date(searchParams.get('endDate') || ''),
      period: searchParams.get('period'),
      region: searchParams.get('region'),
      metrics: searchParams.getAll('metrics'),
    });

    const analytics = await analyticsService.getAnalytics(query);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for recording analytics events
 * @param request - The incoming request
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    await analyticsService.recordDataPoint(body);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}