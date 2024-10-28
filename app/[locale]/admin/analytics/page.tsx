// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/page.tsx
// Analytics dashboard page - where data tells the story of democracy in action!

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AnalyticsDashboard from './components/analytics-dashboard';
import { DateRangePicker } from './components/date-range-picker';
import { RegionFilter } from './components/region-filter';

export const metadata = {
  title: 'Analytics Dashboard | Voter Rideshare',
  description: 'Analytics and insights for Voter Rideshare operations',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze voter transportation impact
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker />
          <RegionFilter />
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-7 w-[100px]" />
          <Skeleton className="mt-4 h-10 w-[200px]" />
        </Card>
      ))}
    </div>
  );
}