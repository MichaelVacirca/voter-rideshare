// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/stores/analytics-store.ts
// Analytics store - keeping our metrics organized and accessible!

import { create } from 'zustand';
import { TIME_PERIOD } from '@/types/analytics';

interface DateRange {
  from: Date;
  to: Date;
}

interface AnalyticsState {
  selectedRegion: string;
  dateRange: DateRange;
  timePeriod: keyof typeof TIME_PERIOD;
  isLoading: boolean;
  error: string | null;
  setRegion: (region: string) => void;
  setDateRange: (range: DateRange) => void;
  setTimePeriod: (period: keyof typeof TIME_PERIOD) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  selectedRegion: 'all',
  dateRange: {
    from: new Date(),
    to: new Date(),
  },
  timePeriod: TIME_PERIOD.WEEKLY,
  isLoading: false,
  error: null,
  setRegion: (region) => set({ selectedRegion: region }),
  setDateRange: (range) => set({ dateRange: range }),
  setTimePeriod: (period) => set({ timePeriod: period }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));