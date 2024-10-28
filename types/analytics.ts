// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /types/analytics.ts
// Analytics type definitions - measuring democracy's odometer!

import { z } from 'zod';

/** Time periods for analytics aggregation */
export const TIME_PERIOD = {
  /** Daily statistics */
  DAILY: 'DAILY',
  /** Weekly statistics */
  WEEKLY: 'WEEKLY',
  /** Monthly statistics */
  MONTHLY: 'MONTHLY',
  /** Yearly statistics */
  YEARLY: 'YEARLY',
  /** Election cycle */
  ELECTION_CYCLE: 'ELECTION_CYCLE',
} as const;

/** Metrics for rides */
export const RIDE_METRICS = {
  /** Total rides requested */
  TOTAL_REQUESTED: 'TOTAL_REQUESTED',
  /** Successfully completed rides */
  COMPLETED: 'COMPLETED',
  /** Cancelled rides */
  CANCELLED: 'CANCELLED',
  /** Average wait time */
  AVG_WAIT_TIME: 'AVG_WAIT_TIME',
  /** Average ride duration */
  AVG_RIDE_DURATION: 'AVG_RIDE_DURATION',
  /** Number of return trips */
  RETURN_TRIPS: 'RETURN_TRIPS',
} as const;

/** Metrics for drivers */
export const DRIVER_METRICS = {
  /** Total active drivers */
  ACTIVE_DRIVERS: 'ACTIVE_DRIVERS',
  /** New driver registrations */
  NEW_REGISTRATIONS: 'NEW_REGISTRATIONS',
  /** Average rides per driver */
  AVG_RIDES_PER_DRIVER: 'AVG_RIDES_PER_DRIVER',
  /** Driver satisfaction score */
  SATISFACTION_SCORE: 'SATISFACTION_SCORE',
} as const;

/** Metrics for impact */
export const IMPACT_METRICS = {
  /** Total voters helped */
  VOTERS_HELPED: 'VOTERS_HELPED',
  /** Estimated voting time saved */
  TIME_SAVED: 'TIME_SAVED',
  /** Community engagement score */
  COMMUNITY_ENGAGEMENT: 'COMMUNITY_ENGAGEMENT',
  /** Accessibility assistance provided */
  ACCESSIBILITY_ASSISTS: 'ACCESSIBILITY_ASSISTS',
} as const;

/** Schema for analytics query parameters */
export const analyticsQuerySchema = z.object({
  /** Start date for analysis */
  startDate: z.date(),
  /** End date for analysis */
  endDate: z.date(),
  /** Time period for aggregation */
  period: z.enum([
    TIME_PERIOD.DAILY,
    TIME_PERIOD.WEEKLY,
    TIME_PERIOD.MONTHLY,
    TIME_PERIOD.YEARLY,
    TIME_PERIOD.ELECTION_CYCLE,
  ]),
  /** Geographic region for filtering */
  region: z.string().optional(),
  /** Specific metrics to include */
  metrics: z.array(
    z.enum([
      ...Object.values(RIDE_METRICS),
      ...Object.values(DRIVER_METRICS),
      ...Object.values(IMPACT_METRICS),
    ])
  ),
});

/** Type for analytics data point */
export interface AnalyticsDataPoint {
  /** Timestamp for the data point */
  timestamp: Date;
  /** Metric name */
  metric: string;
  /** Metric value */
  value: number;
  /** Additional dimensions */
  dimensions?: Record<string, string | number>;
}

/** Type for aggregated analytics */
export interface AggregatedAnalytics {
  /** Time period of aggregation */
  period: keyof typeof TIME_PERIOD;
  /** Start date of period */
  startDate: Date;
  /** End date of period */
  endDate: Date;
  /** Metrics and their values */
  metrics: Record<string, number>;
  /** Previous period values for comparison */
  previousPeriod?: Record<string, number>;
  /** Percentage changes from previous period */
  changes?: Record<string, number>;
}

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;