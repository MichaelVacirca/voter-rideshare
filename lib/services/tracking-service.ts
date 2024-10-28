// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/tracking-service.ts
// Tracking service - real-time location tracking for safer rides!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { redisClient } from '@/lib/redis';
import { pusher } from '@/lib/pusher';
import { MONGODB_CONFIG } from '@/config';
import { RideStatus } from '@/types/ride';
import { geoService } from './geo-service';

interface LocationUpdate {
  rideId: string;
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface RideLocation extends LocationUpdate {
  eta?: number;
  distanceRemaining?: number;
}

export class TrackingService {
  private collection: Collection;
  private readonly LOCATION_TTL = 300; // 5 minutes
  private readonly UPDATE_THRESHOLD = 5; // seconds

  constructor() {
    this.collection = getCollection(MONGODB_CONFIG.collections.tracking);
  }

  /**
   * Update driver's location for a ride
   */
  async updateLocation(update: LocationUpdate): Promise<void> {
    const lastUpdate = await redisClient.get(`location:${update.rideId}`);
    
    if (lastUpdate) {
      const lastTimestamp = new Date(JSON.parse(lastUpdate).timestamp);
      const timeDiff = (update.timestamp.getTime() - lastTimestamp.getTime()) / 1000;
      
      // Throttle updates
      if (timeDiff < this.UPDATE_THRESHOLD) {
        return;
      }
    }

    // Store in Redis for real-time access
    await redisClient.setex(
      `location:${update.rideId}`,
      this.LOCATION_TTL,
      JSON.stringify(update)
    );

    // Store in MongoDB for history
    await this.collection.insertOne({
      ...update,
      createdAt: new Date()
    });

    // Calculate ETA and remaining distance
    const ride = await this.getRideDetails(update.rideId);
    if (ride && ride.destination) {
      const routeInfo = await geoService.calculateRoute(
        { lat: update.lat, lng: update.lng },
        ride.destination
      );

      const locationUpdate: RideLocation = {
        ...update,
        eta: routeInfo.duration,
        distanceRemaining: routeInfo.distance
      };

      // Broadcast update to all ride participants
      await this.broadcastLocationUpdate(update.rideId, locationUpdate);
    }
  }

  /**
   * Get current location for a ride
   */
  async getCurrentLocation(rideId: string): Promise<RideLocation | null> {
    const cached = await redisClient.get(`location:${rideId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  /**
   * Get location history for a ride
   */
  async getLocationHistory(
    rideId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<LocationUpdate[]> {
    const query: any = { rideId };
    
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    const history = await this.collection
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();

    return history;
  }

  /**
   * Start tracking a ride
   */
  async startTracking(rideId: string): Promise<void> {
    await redisClient.set(`tracking:${rideId}`, 'active');
    await this.updateRideStatus(rideId, 'IN_PROGRESS');
  }

  /**
   * Stop tracking a ride
   */
  async stopTracking(rideId: string): Promise<void> {
    await redisClient.del(`tracking:${rideId}`);
    await redisClient.del(`location:${rideId}`);
    await this.updateRideStatus(rideId, 'COMPLETED');
  }

  /**
   * Check if a ride is being tracked
   */
  async isTracking(rideId: string): Promise<boolean> {
    const status = await redisClient.get(`tracking:${rideId}`);
    return status === 'active';
  }

  private async getRideDetails(rideId: string) {
    // Implementation to get ride details from ride service
    // This would typically include destination and other ride info
    return null;
  }

  private async updateRideStatus(rideId: string, status: RideStatus) {
    // Implementation to update ride status
  }

  private async broadcastLocationUpdate(
    rideId: string,
    location: RideLocation
  ): Promise<void> {
    // Broadcast to relevant channels
    await pusher.trigger(`ride-${rideId}`, 'location-update', location);
  }
}

export const trackingService = new TrackingService();