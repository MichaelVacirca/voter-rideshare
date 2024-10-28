// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/rides/request/components/location-picker.tsx
// Location picker component with map integration

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LocationSearch } from '@/components/map/location-search';
import { MapView } from '@/components/map/map-view';
import { Location } from '@/types/ride';

interface LocationPickerProps {
  type: 'pickup' | 'voting';
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  error?: string;
}

export function LocationPicker({
  type,
  onLocationSelect,
  initialLocation,
  error,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocode the clicked location
      const location = await fetch(
        `/api/geocode/reverse?lat=${lat}&lng=${lng}`
      ).then((res) => res.json());
      
      handleLocationSelect(location);
    } catch (error) {
      console.error('Failed to reverse geocode location:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          initialLocation={initialLocation}
          placeholder={`Enter ${type === 'pickup' ? 'pickup' : 'polling'} location`}
          error={error}
        />
        
        <MapView
          height="200px"
          location={selectedLocation}
          onLocationSelect={handleMapClick}
          zoom={selectedLocation ? 15 : 10}
          showPin={true}
        />
        
        {selectedLocation && (
          <div className="text-sm text-muted-foreground">
            {type === 'voting' && (
              <p className="mt-2">
                Please verify this is your correct polling location on your
                state's election website.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}