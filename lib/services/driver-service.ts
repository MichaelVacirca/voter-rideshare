// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/driver-service.ts
// Driver service - keeping our volunteer drivers on the road to democracy!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { redisClient } from '@/lib/redis';
import { backgroundCheckService } from './background-check-service';
import { MONGODB_CONFIG } from '@/config';
import {
  DriverModel,
  DriverRegistration,
  DRIVER_STATUS,
  DriverStatus,
  DriverAvailability,
} from '@/types/driver';

/** Cache TTL for driver data (1 hour) */
const CACHE_TTL = 3600;

/**
 * Service class for managing driver operations
 */
export class DriverService {
  private collection: Collection<DriverModel>;

  constructor() {
    this.collection = getCollection<DriverModel>(MONGODB_CONFIG.collections.drivers);
  }

  /**
   * Registers a new driver
   * @param userId - ID of the user becoming a driver
   * @param registration - Driver registration information
   * @returns The created driver profile
   */
  async registerDriver(userId: string, registration: DriverRegistration): Promise<DriverModel> {
    // Check if user is already a driver
    const existingDriver = await this.collection.findOne({ userId });
    if (existingDriver) {
      throw new Error('User is already registered as a driver');
    }

    // Initialize driver profile
    const now = new Date();
    const driver: Omit<DriverModel, '_id'> = {
      userId,
      registration,
      status: DRIVER_STATUS.PENDING,
      completedRides: 0,
      rating: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Create driver record
    const result = await this.collection.insertOne(driver as any);

    // Initiate background check
    const backgroundCheck = await backgroundCheckService.initiateCheck({
      driverId: result.insertedId.toString(),
      licenseNumber: registration.license.number,
      licenseState: registration.license.state,
    });

    // Update with background check ID
    await this.collection.updateOne(
      { _id: result.insertedId },
      {
        $set: {
          backgroundCheckId: backgroundCheck.id,
          status: DRIVER_STATUS.VERIFYING,
        },
      }
    );

    const driverProfile = await this.getDriver(result.insertedId.toString());
    if (!driverProfile) {
      throw new Error('Failed to create driver profile');
    }

    return driverProfile;
  }

  /**
   * Retrieves a driver profile
   * @param driverId - ID of the driver
   * @returns The driver profile if found
   */
  async getDriver(driverId: string): Promise<DriverModel | null> {
    // Check cache first
    const cached = await redisClient.get(`driver:${driverId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const driver = await this.collection.findOne({
      _id: new ObjectId(driverId),
    });

    if (driver) {
      // Cache the result
      await redisClient.setex(
        `driver:${driverId}`,
        CACHE_TTL,
        JSON.stringify(driver)
      );
      return { ...driver, _id: driver._id.toString() };
    }

    return null;
  }

  /**
   * Updates a driver's availability
   * @param driverId - ID of the driver
   * @param availability - New availability schedule
   * @returns Updated driver profile
   */
  async updateAvailability(
    driverId: string,
    availability: DriverAvailability[]
  ): Promise<DriverModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(driverId) },
      {
        $set: {
          'registration.availability': availability,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (result) {
      // Clear cache
      await redisClient.del(`driver:${driverId}`);
      return { ...result, _id: result._id.toString() };
    }

    return null;
  }

  /**
   * Updates a driver's status
   * @param driverId - ID of the driver
   * @param status - New status
   * @returns Updated driver profile
   */
  async updateStatus(
    driverId: string,
    status: DriverStatus
  ): Promise<DriverModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(driverId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (result) {
      // Clear cache
      await redisClient.del(`driver:${driverId}`);
      return { ...result, _id: result._id.toString() };
    }

    return null;
  }

  /**
   * Finds available drivers for a specific time and location
   * @param date - Date of ride
   * @param areaCode - Geographic area code
   * @returns Array of available drivers
   */
  async findAvailableDrivers(
    date: Date,
    areaCode: string
  ): Promise<DriverModel[]> {
    const timeOfDay = date.getHours() * 60 + date.getMinutes();

    const drivers = await this.collection
      .find({
        status: DRIVER_STATUS.APPROVED,
        'registration.availability': {
          $elemMatch: {
            date: {
              $gte: new Date(date.setHours(0, 0, 0, 0)),
              $lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            startTime: { $lte: timeOfDay },
            endTime: { $gte: timeOfDay },
            areaCodes: areaCode,
          },
        },
      })
      .toArray();

    return drivers.map(driver => ({
      ...driver,
      _id: driver._id.toString(),
    }));
  }
}

// Export singleton instance
export const driverService = new DriverService();