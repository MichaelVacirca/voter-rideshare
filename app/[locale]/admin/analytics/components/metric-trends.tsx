// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/components/metric-trends.tsx
// Metric trends component - visualizing our journey to full voter participation!

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsStore } from '../stores/analytics-store';
import { useMemo } from 'react';

interface TrendData {
  timestamp: string;
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface MetricTrendsProps {
  data: TrendData[];
  title: string;
  metric: string;
  color?: string;
  formatter?: (value: number) => string;
}

export function MetricTrends({
  data,
  title,
  metric,
  color = '#2563eb',
  formatter = (value) => value.toString(),
}: MetricTrendsProps) {
  const { timePeriod } = useAnalyticsStore();

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedValue: formatter(item.value),
    }));
  }, [data, formatter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timePeriod === 'DAILY'
                    ? date.toLocaleDateString()
                    : date.toLocaleDateString(undefined, { month: 'short' });
                }}
              />
              <YAxis tickFormatter={formatter} />
              <Tooltip
                formatter={(value: number) => [formatter(value), metric]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                name={metric}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <TrendIndicator data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

function TrendIndicator({ data }: { data: TrendData[] }) {
  const lastTwoPoints = data.slice(-2);
  const trend = lastTwoPoints[1]?.trend || 'stable';
  const percentage = calculateTrendPercentage(lastTwoPoints);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`text-sm font-medium ${
          trend === 'increasing'
            ? 'text-green-600'
            : trend === 'decreasing'
            ? 'text-red-600'
            : 'text-gray-600'
        }`}
      >
        {trend === 'increasing' ? '↑' : trend === 'decreasing' ? '↓' : '→'}
        {percentage}%
      </div>
      <span className="text-sm text-gray-500">
        vs previous {data.length} periods
      </span>
    </div>
  );
}

function calculateTrendPercentage(points: TrendData[]): number {
  if (points.length < 2) return 0;
  const [previous, current] = points;
  const percentageChange =
    ((current.value - previous.value) / previous.value) * 100;
  return Math.round(percentageChange * 10) / 10;
}