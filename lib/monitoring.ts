// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/monitoring.ts
// Monitoring setup - keeping an eye on our democracy delivery system!

import * as Sentry from '@sentry/nextjs';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Integrations } from '@sentry/node';
import { MetricsAggregator } from '@opentelemetry/metrics-aggregator';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
    new Integrations.BrowserTracing(),
  ],
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});

// Initialize metrics
const metrics = new MetricsAggregator();

export const monitoring = {
  /**
   * Track application metrics
   */
  trackMetric: async (
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ) => {
    try {
      await metrics.recordMetric(name, value, {
        timestamp: Date.now(),
        tags: {
          environment: process.env.NODE_ENV || 'development',
          ...tags,
        },
      });
    } catch (error) {
      console.error('Error tracking metric:', error);
    }
  },

  /**
   * Track performance timing
   */
  trackPerformance: async (
    name: string,
    duration: number,
    tags: Record<string, string> = {}
  ) => {
    try {
      await metrics.recordHistogram(`perf.${name}`, duration, {
        timestamp: Date.now(),
        tags: {
          environment: process.env.NODE_ENV || 'development',
          ...tags,
        },
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  },

  /**
   * Track custom events
   */
  trackEvent: async (
    name: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      Sentry.captureMessage(name, {
        level: 'info',
        extra: properties,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  /**
   * Track errors
   */
  trackError: async (
    error: Error,
    context: Record<string, any> = {}
  ) => {
    try {
      Sentry.captureException(error, {
        extra: context,
      });
    } catch (err) {
      console.error('Error tracking error:', err);
    }
  },

  /**
   * Start request timing
   */
  startTiming: (name: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      monitoring.trackPerformance(name, duration);
    };
  },
};