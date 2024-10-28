// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/matching-service.ts
// Matching service - connecting voters with their democracy chauffeurs!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { redisClient } from '@/lib/redis';
import { MONGODB_CONFIG } from '@/config';
import { RideRequestModel, RIDE_STATUS } from '@/types/ride';
import { DriverModel, DRIVER_STATUS } from '@/types/driver';
import { calculateDistance, calculateETA } from '@/lib/geo';
import { NotificationService } from './notification-service';

/** Maximum distance for driver matching (in kilometers) */
const MAX_MATCH_DISTANCE = 20;

/** Cache duration for driver availability (5 minutes) */
const AVAILABILITY_CACHE_TTL = 300;

export class MatchingService {
  private rideCollection: Collection<RideRequestModel>;
  private driverCollection: Collection<DriverModel>;
  private notificationService: NotificationService;

  constructor() {
    this.rideCollection = getCollection<RideRequestModel>(
      MONGODB_CONFIG.collections.rides
    );
    this.driverCollection = getCollection<DriverModel>(
      MONGODB_CONFIG.collections.drivers
    );
    this.notificationService = new NotificationService();
  }

  /**
   * Find best matching driver for a ride request
   * @param rideId - ID of the ride request
   * @returns Matched driver if found
   */
  async findMatch(rideId: string): Promise<DriverModel | null> {
    const ride = await this.rideCollection.findOne({
      _id: new ObjectId(rideId),
      status: RIDE_STATUS.PENDING,
    });

    if (!ride) {
      throw new Error('Ride not found or not in pending status');
    }

    // Get available drivers
    const availableDrivers = await this.getAvailableDrivers(
      ride.pickupLocation,
      ride.pickupTime,
      ride.mobilityNeeds
    );

    // Score and rank drivers
    const rankedDrivers = await this.rankDrivers(
      availableDrivers,
      ride
    );

    // Return best match
    return rankedDrivers[0] || null;
  }

  /**
   * Get available drivers for a given location and time
   */
  private async getAvailableDrivers(
    location: any,
    pickupTime: Date,
    mobilityNeeds: boolean
  ): Promise<DriverModel[]> {
    // Check cache first
    const cacheKey = `available:${pickupTime.toISOString()}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query for available drivers
    const drivers = await this.driverCollection.find({
      status: DRIVER_STATUS.APPROVED,
      'vehicle.isAccessible': mobilityNeeds ? true : { $in: [true, false] },
      'availability': {
        $elemMatch: {
          date: {
            $gte: new Date(pickupTime.setHours(0, 0, 0, 0)),
            $lt: new Date(pickupTime.setHours(23, 59, 59, 999)),
          },
          startTime: { $lte: pickupTime },
          endTime: { $gte: pickupTime },
        },
      },
    }).toArray();

    // Cache results
    await redisClient.setex(
      cacheKey,
      AVAILABILITY_CACHE_TTL,
      JSON.stringify(drivers)
    );

    return drivers;
  }

  /**
   * Score and rank drivers based on various factors
   */
  private async rankDrivers(
    drivers: DriverModel[],
    ride: RideRequestModel
  ): Promise<DriverModel[]> {
    const scoredDrivers = await Promise.all(
      drivers.map(async (driver) => {
        const distance = await calculateDistance(
          driver.currentLocation,
          ride.pickupLocation
        );

        // Skip if too far
        if (distance > MAX_MATCH_DISTANCE) {
          return null;
        }

        const score = this.calculateMatchScore(driver, ride, distance);
        return { driver, score };
      })
    );

    // Filter out null entries and sort by score
    return scoredDrivers
      .filter((item): item is { driver: DriverModel; score: number } => 
        item !== null
      )
      .sort((a, b) => b.score - a.score)
      .map(item => item.driver);
  }

  /**
   * Calculate match score based on various factors
   */
  private calculateMatchScore(
    driver: DriverModel,
    ride: RideRequestModel,
    distance: number
  ): number {
    let score = 0;

    // Distance score (closer is better)
    score += (MAX_MATCH_DISTANCE - distance) * 2;

    // Rating score
    score += driver.rating * 10;

    // Experience score
    score += Math.min(driver.completedRides * 0.5, 25);

    // Preferred gender match
    if (ride.preferences?.preferredDriverGender === driver.gender) {
      score += 20;
    }

    // Language match
    if (driver.languages?.includes(ride.preferences?.language)) {
      score += 15;
    }

    return score;
  }

  /**
   * Confirm a match between driver and rider
   */
  async confirmMatch(
    rideId: string,
    driverId: string
  ): Promise<boolean> {
    const result = await this.rideCollection.updateOne(
      {
        _id: new ObjectId(rideId),
        status: RIDE_STATUS.PENDING,
      },
      {
        $set: {
          driverId,
          status: RIDE_STATUS.MATCHED,
          matchedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      // Notify both parties
      await this.notificationService.notifyMatch(rideId);
      return true;
    }

    return false;
  }

  /**
   * Handle driver response to match
   */
  async handleDriverResponse(
    rideId: string,
    driverId: string,
    accepted: boolean
  ): Promise<void> {
    if (accepted) {
      await this.rideCollection.updateOne(
        { _id: new ObjectId(rideId) },
        {
          $set: {
            status: RIDE_STATUS.CONFIRMED,
            confirmedAt: new Date(),
          },
        }
      );
      
      await this.notificationService.notifyRideConfirmed(rideId);
    } else {
      // Reset ride to pending and try next driver
      await this.rideCollection.updateOne(
        { _id: new ObjectId(rideId) },
        {
          $set: {
            status: RIDE_STATUS.PENDING,
            driverId: null,
          },
        }
      );

      // Try to find another match
      const nextDriver = await this.findMatch(rideId);
      if (nextDriver) {
        await this.confirmMatch(rideId, nextDriver._id);
      }
    }
  }
}

export const matchingService = new MatchingService();