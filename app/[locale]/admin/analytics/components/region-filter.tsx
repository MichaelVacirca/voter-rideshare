// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/components/region-filter.tsx
// Region filter component - because location matters in elections!

'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnalyticsStore } from '../stores/analytics-store';

export function RegionFilter() {
  const { selectedRegion, setRegion } = useAnalyticsStore();

  return (
    <Select value={selectedRegion} onValueChange={setRegion}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Region" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Regions</SelectLabel>
          <SelectItem value="all">All Regions</SelectItem>
          <SelectItem value="northeast">Northeast</SelectItem>
          <SelectItem value="southeast">Southeast</SelectItem>
          <SelectItem value="midwest">Midwest</SelectItem>
          <SelectItem value="southwest">Southwest</SelectItem>
          <SelectItem value="west">West</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}