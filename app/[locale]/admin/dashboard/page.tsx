// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/dashboard/page.tsx
// Admin dashboard - command central for voter transportation!

import { Suspense } from 'react';
import { ActiveRides } from './components/active-rides';
import { RideStatistics } from './components/ride-statistics';
import { IssuesList } from './components/issues-list';
import { AdminHeader } from './components/admin-header';
import { DashboardSkeleton } from './components/dashboard-skeleton';

export const metadata = {
  title: 'Admin Dashboard | Voter Rideshare',
  description: 'Monitor and manage voter rideshare operations',
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminHeader />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<DashboardSkeleton />}>
          <RideStatistics />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ActiveRides />
          </Suspense>
        </div>
        
        <div className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <IssuesList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}