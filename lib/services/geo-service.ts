// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/geo-service.ts
// Geo service - mapping the path to democracy!

import { Client, GeocodeResponse } from '@googlemaps/google-maps-services-js';
import { redisClient } from '@/lib/redis';
import { Location } from '@/types/ride';

/** Cache TTL for geocoding results (7 days) */
const GEOCODE_CACHE_TTL = 60 * 60 * 24 * 7;

/** Cache TTL for route calculations (1 hour) */
const ROUTE_CACHE_TTL = 60 * 60;

/** Cache TTL for polling place data (1 day) */
const POLLING_PLACE_CACHE_TTL = 60 * 60 * 24;

export class GeoService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  /**
   * Geocode an address to coordinates
   * @param location - Location object with address details
   * @returns Coordinates and formatted address
   */
  async geocodeAddress(location: Location) {
    const addressStr = this.formatAddress(location);
    const cacheKey = `geocode:${addressStr}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.geocode({
        params: {
          address: addressStr,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = {
        lat: response.data.results[0].geometry.location.lat,
        lng: response.data.results[0].geometry.location.lng,
        formattedAddress: response.data.results[0].formatted_address,
        placeId: response.data.results[0].place_id,
      };

      // Cache result
      await redisClient.setex(
        cacheKey,
        GEOCODE_CACHE_TTL,
        JSON.stringify(result)
      );

      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Calculate route between two locations
   * @param origin - Starting location
   * @param destination - Ending location
   * @returns Route details including distance and duration
   */
  async calculateRoute(origin: Location, destination: Location) {
    const originStr = this.formatAddress(origin);
    const destStr = this.formatAddress(destination);
    const cacheKey = `route:${originStr}:${destStr}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.directions({
        params: {
          origin: originStr,
          destination: destStr,
          mode: 'driving',
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

      if (response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      const result = {
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        polyline: route.overview_polyline.points,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.value,
          duration: step.duration.value,
        })),
      };

      // Cache result
      await redisClient.setex(
        cacheKey,
        ROUTE_CACHE_TTL,
        JSON.stringify(result)
      );

      return result;
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error('Failed to calculate route');
    }
  }

  /**
   * Verify if an address is a valid polling location
   * @param location - Location to verify
   * @returns Polling place details if valid
   */
  async verifyPollingPlace(location: Location) {
    const addressStr = this.formatAddress(location);
    const cacheKey = `polling:${addressStr}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // First geocode the address
      const geocoded = await this.geocodeAddress(location);

      // Then check against civic information API
      const response = await fetch(
        `https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?` +
        `address=${encodeURIComponent(geocoded.formattedAddress)}` +
        `&key=${process.env.GOOGLE_CIVIC_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to verify polling place');
      }

      const data = await response.json();
      const pollingLocation = data.pollingLocations?.[0];

      if (!pollingLocation) {
        return null;
      }

      const result = {
        isValid: true,
        name: pollingLocation.address.locationName,
        address: pollingLocation.address,
        notes: pollingLocation.notes,
        hours: pollingLocation.pollingHours,
      };

      // Cache result
      await redisClient.setex(
        cacheKey,
        POLLING_PLACE_CACHE_TTL,
        JSON.stringify(result)
      );

      return result;
    } catch (error) {
      console.error('Polling place verification error:', error);
      throw new Error('Failed to verify polling place');
    }
  }

  /**
   * Get location suggestions based on partial input
   * @param input - Partial address input
   * @returns Array of address suggestions
   */
  async getLocationSuggestions(input: string) {
    try {
      const response = await this.client.placeAutocomplete({
        params: {
          input,
          types: ['address'],
          componentRestrictions: { country: 'US' },
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

      return response.data.predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      console.error('Location suggestions error:', error);
      throw new Error('Failed to get location suggestions');
    }
  }

  private formatAddress(location: Location): string {
    return `${location.street}, ${location.city}, ${location.state} ${location.zipCode}`;
  }
}

export const geoService = new GeoService();