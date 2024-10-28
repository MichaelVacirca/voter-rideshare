// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/components/analytics-dashboard.tsx
// Analytics dashboard component - visualizing the pulse of democracy!

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { RIDE_METRICS, DRIVER_METRICS, IMPACT_METRICS, TIME_PERIOD } from '@/types/analytics';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#eab308'];

export default function AnalyticsDashboard() {
  const [timePeriod, setTimePeriod] = useState(TIME_PERIOD.WEEKLY);
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', timePeriod],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?period=${timePeriod}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Rides"
          value={analytics.metrics[RIDE_METRICS.TOTAL_REQUESTED]}
          change={analytics.changes[RIDE_METRICS.TOTAL_REQUESTED]}
        />
        <MetricCard
          title="Active Drivers"
          value={analytics.metrics[DRIVER_METRICS.ACTIVE_DRIVERS]}
          change={analytics.changes[DRIVER_METRICS.ACTIVE_DRIVERS]}
        />
        <MetricCard
          title="Voters Helped"
          value={analytics.metrics[IMPACT_METRICS.VOTERS_HELPED]}
          change={analytics.changes[IMPACT_METRICS.VOTERS_HELPED]}
        />
        <MetricCard
          title="Completion Rate"
          value={`${((analytics.metrics[RIDE_METRICS.COMPLETED] / 
            analytics.metrics[RIDE_METRICS.TOTAL_REQUESTED]) * 100).toFixed(1)}%`}
          change={analytics.changes[RIDE_METRICS.COMPLETED]}
        />
      </div>

      {/* Time Period Selector */}
      <div className="flex justify-between items-center">
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as any)}>
          <TabsList>
            <TabsTrigger value={TIME_PERIOD.DAILY}>Daily</TabsTrigger>
            <TabsTrigger value={TIME_PERIOD.WEEKLY}>Weekly</TabsTrigger>
            <TabsTrigger value={TIME_PERIOD.MONTHLY}>Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ride Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={RIDE_METRICS.COMPLETED} 
                    stroke={COLORS[0]} 
                    name="Completed Rides"
                  />
                  <Line 
                    type="monotone" 
                    dataKey={RIDE_METRICS.CANCELLED} 
                    stroke={COLORS[2]} 
                    name="Cancelled Rides"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.driverMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey={DRIVER_METRICS.ACTIVE_DRIVERS} 
                    fill={COLORS[1]}
                    name="Active Drivers"
                  />
                  <Bar 
                    dataKey={DRIVER_METRICS.NEW_REGISTRATIONS} 
                    fill={COLORS[0]}
                    name="New Registrations"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'First-Time Voters', value: analytics.metrics.firstTimeVoters },
                      { name: 'Elderly Voters', value: analytics.metrics.elderlyVoters },
                      { name: 'Disabled Voters', value: analytics.metrics.disabledVoters },
                      { name: 'Other Voters', value: analytics.metrics.otherVoters },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.impactMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Wait Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.waitTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="waitTime" 
                    stroke={COLORS[0]} 
                    name="Wait Time (minutes)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
}

function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const RADIAN = Math.PI / 180;
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}