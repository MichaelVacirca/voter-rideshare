// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /components/map/map-view.tsx
// Map view component - your window into the journey!

'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Location } from '@/types/ride';
import { decodePolyline } from '@/lib/utils';

interface MapViewProps {
  pickup?: Location;
  destination?: Location;
  currentLocation?: { lat: number; lng: number };
  routePolyline?: string;
  width?: string | number;
  height?: string | number;
  showRoute?: boolean;
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void;
}

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of US
const defaultZoom = 4;

export function MapView({
  pickup,
  destination,
  currentLocation,
  routePolyline,
  width = '100%',
  height = '400px',
  showRoute = true,
  onLocationSelect,
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map>();
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (routePolyline) {
      setPath(decodePolyline(routePolyline));
    }
  }, [routePolyline]);

  const fitBounds = (map: google.maps.Map) => {
    if (!map || (!pickup && !destination)) return;

    const bounds = new google.maps.LatLngBounds();
    if (pickup) bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    if (destination) bounds.extend({ lat: destination.lat, lng: destination.lng });
    if (currentLocation) bounds.extend(currentLocation);

    map.fitBounds(bounds, { padding: 60 });
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    fitBounds(map);
  };

  const handleMapClick = (e: google.maps.MouseEvent) => {
    if (onLocationSelect) {
      onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  return (
    <Card>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={{ width, height }}
          center={currentLocation || defaultCenter}
          zoom={defaultZoom}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
        >
          {pickup && (
            <Marker
              position={{ lat: pickup.lat, lng: pickup.lng }}
              label="P"
              title="Pickup Location"
            />
          )}
          
          {destination && (
            <Marker
              position={{ lat: destination.lat, lng: destination.lng }}
              label="D"
              title="Destination"
            />
          )}

          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4CAF50',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
              title="Current Location"
            />
          )}

          {showRoute && path.length > 0 && (
            <Polyline
              path={path}
              options={{
                strokeColor: '#2196F3',
                strokeOpacity: 0.8,
                strokeWeight: 5,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </Card>
  );
}