// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/ride-service.ts
// Ride service - driving your data to its destination!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { RideRequest, RideRequestModel, RIDE_STATUS } from '@/types/ride';
import { MONGODB_CONFIG } from '@/config';

/** Cache key prefix for ride requests */
const CACHE_PREFIX = 'ride:';

/**
 * Service class for handling ride-related operations
 */
export class RideService {
  private collection: Collection<RideRequestModel>;

  constructor() {
    this.collection = getCollection<RideRequestModel>(MONGODB_CONFIG.collections.rides);
  }

  /**
   * Creates a new ride request
   * @param userId - ID of the user requesting the ride
   * @param request - Ride request details
   * @returns The created ride request
   */
  async createRideRequest(userId: string, request: RideRequest): Promise<RideRequestModel> {
    const now = new Date();
    
    const rideRequest: Omit<RideRequestModel, '_id'> = {
      ...request,
      userId,
      status: RIDE_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(rideRequest as any);
    
    return {
      ...rideRequest,
      _id: result.insertedId.toString(),
    };
  }

  /**
   * Retrieves a ride request by ID
   * @param rideId - ID of the ride request
   * @returns The ride request if found
   */
  async getRideRequest(rideId: string): Promise<RideRequestModel | null> {
    const result = await this.collection.findOne({
      _id: new ObjectId(rideId),
    });

    return result ? { ...result, _id: result._id.toString() } : null;
  }

  /**
   * Updates the status of a ride request
   * @param rideId - ID of the ride request
   * @param status - New status
   * @returns The updated ride request
   */
  async updateRideStatus(rideId: string, status: RideStatus): Promise<RideRequestModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(rideId) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result ? { ...result, _id: result._id.toString() } : null;
  }

  /**
   * Lists ride requests for a user
   * @param userId - ID of the user
   * @returns Array of ride requests
   */
  async listUserRides(userId: string): Promise<RideRequestModel[]> {
    const rides = await this.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return rides.map(ride => ({
      ...ride,
      _id: ride._id.toString(),
    }));
  }

  /**
   * Cancels a ride request
   * @param rideId - ID of the ride request
   * @param userId - ID of the user cancelling the ride
   * @returns The cancelled ride request
   */
  async cancelRide(rideId: string, userId: string): Promise<RideRequestModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { 
        _id: new ObjectId(rideId),
        userId,
        status: { $nin: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED] },
      },
      {
        $set: {
          status: RIDE_STATUS.CANCELLED,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result ? { ...result, _id: result._id.toString() } : null;
  }
}

// Export singleton instance
export const rideService = new RideService();