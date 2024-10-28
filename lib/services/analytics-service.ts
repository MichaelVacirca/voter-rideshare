// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/analytics-service.ts
// Analytics service - because every vote (and data point) counts!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { redisClient } from '@/lib/redis';
import { MONGODB_CONFIG } from '@/config';
import {
  AnalyticsDataPoint,
  AnalyticsQuery,
  AggregatedAnalytics,
  TIME_PERIOD,
} from '@/types/analytics';

/** Cache TTL for analytics data (5 minutes) */
const CACHE_TTL = 300;

/**
 * Service class for analytics operations
 */
export class AnalyticsService {
  private collection: Collection<AnalyticsDataPoint>;

  constructor() {
    this.collection = getCollection<AnalyticsDataPoint>(MONGODB_CONFIG.collections.analytics);
  }

  /**
   * Records a new analytics data point
   * @param dataPoint - The data point to record
   */
  async recordDataPoint(dataPoint: Omit<AnalyticsDataPoint, 'timestamp'>): Promise<void> {
    await this.collection.insertOne({
      ...dataPoint,
      timestamp: new Date(),
    });
  }

  /**
   * Gets analytics based on query parameters
   * @param query - Analytics query parameters
   * @returns Aggregated analytics data
   */
  async getAnalytics(query: AnalyticsQuery): Promise<AggregatedAnalytics> {
    const cacheKey = `analytics:${JSON.stringify(query)}`;
    
    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate period duration
    const periodDuration = this.getPeriodDuration(query.period);
    
    // Calculate previous period
    const previousStartDate = new Date(query.startDate);
    previousStartDate.setTime(previousStartDate.getTime() - periodDuration);
    
    const previousEndDate = new Date(query.endDate);
    previousEndDate.setTime(previousEndDate.getTime() - periodDuration);

    // Get current period metrics
    const metrics = await this.aggregateMetrics(
      query.startDate,
      query.endDate,
      query.metrics,
      query.region
    );

    // Get previous period metrics
    const previousMetrics = await this.aggregateMetrics(
      previousStartDate,
      previousEndDate,
      query.metrics,
      query.region
    );

    // Calculate changes
    const changes: Record<string, number> = {};
    for (const metric of Object.keys(metrics)) {
      const current = metrics[metric];
      const previous = previousMetrics[metric];
      changes[metric] = previous ? ((current - previous) / previous) * 100 : 0;
    }

    const result: AggregatedAnalytics = {
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate,
      metrics,
      previousPeriod: previousMetrics,
      changes,
    };

    // Cache results
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
  }

  /**
   * Gets time series data for specific metrics
   * @param metric - Metric to analyze
   * @param startDate - Start date
   * @param endDate - End date
   * @param region - Optional region filter
   * @returns Array of data points
   */
  async getTimeSeries(
    metric: string,
    startDate: Date,
    endDate: Date,
    region?: string
  ): Promise<AnalyticsDataPoint[]> {
    const query: any = {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
      metric,
    };

    if (region) {
      query['dimensions.region'] = region;
    }

    return this.collection
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
  }

  /**
   * Generates a summary report of key metrics
   * @param date - Date to generate report for
   * @returns Summary of key metrics
   */
  async generateDailySummary(date: Date): Promise<Record<string, number>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: '$metric',
          value: { $sum: '$value' },
        },
      },
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    
    return results.reduce((acc, curr) => {
      acc[curr._id] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }

  private async aggregateMetrics(
    startDate: Date,
    endDate: Date,
    metrics: string[],
    region?: string
  ): Promise<Record<string, number>> {
    const query: any = {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
      metric: { $in: metrics },
    };

    if (region) {
      query['dimensions.region'] = region;
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$metric',
          value: { $sum: '$value' },
        },
      },
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    
    return results.reduce((acc, curr) => {
      acc[curr._id] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }

  private getPeriodDuration(period: keyof typeof TIME_PERIOD): number {
    const DAY = 24 * 60 * 60 * 1000;
    switch (period) {
      case TIME_PERIOD.DAILY:
        return DAY;
      case TIME_PERIOD.WEEKLY:
        return 7 * DAY;
      case TIME_PERIOD.MONTHLY:
        return 30 * DAY;
      case TIME_PERIOD.YEARLY:
        return 365 * DAY;
      case TIME_PERIOD.ELECTION_CYCLE:
        return 2 * 365 * DAY;
      default:
        return DAY;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();