// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /__tests__/lib/services/ride-service.test.ts
// Tests for the ride service - keeping our backend honest!

import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { RideService } from '@/lib/services/ride-service';
import { RIDE_STATUS, RideRequestModel } from '@/types/ride';

// Mock MongoDB
jest.mock('mongodb');

describe('RideService', () => {
  let rideService: RideService;
  let mockCollection: jest.Mocked<Collection>;

  const mockRideRequest = {
    pickupLocation: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    votingLocation: {
      street: '456 Voting Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    pickupTime: new Date('2024-11-05T09:00:00'),
    timeWindow: '30',
    passengers: 1,
    mobilityNeeds: false,
    returnRideNeeded: false,
    specialInstructions: 'Call upon arrival',
  };

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    (MongoClient as jest.Mock).mockImplementation(() => ({
      db: () => ({
        collection: () => mockCollection,
      }),
    }));

    rideService = new RideService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRideRequest', () => {
    it('successfully creates a ride request', async () => {
      const userId = 'user123';
      const mockInsertedId = new ObjectId();
      
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId: mockInsertedId,
      });

      const result = await rideService.createRideRequest(userId, mockRideRequest);

      expect(result).toEqual(expect.objectContaining({
        _id: mockInsertedId.toString(),
        userId,
        status: RIDE_STATUS.PENDING,
        ...mockRideRequest,
      }));

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          status: RIDE_STATUS.PENDING,
          ...mockRideRequest,
        })
      );
    });

    it('throws error when insertion fails', async () => {
      mockCollection.insertOne.mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        rideService.createRideRequest('user123', mockRideRequest)
      ).rejects.toThrow('DB Error');
    });
  });

  describe('getRideRequest', () => {
    it('successfully retrieves a ride request', async () => {
      const mockRideId = new ObjectId();
      const mockRide = {
        _id: mockRideId,
        ...mockRideRequest,
        userId: 'user123',
        status: RIDE_STATUS.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(mockRide);

      const result = await rideService.getRideRequest(mockRideId.toString());

      expect(result).toEqual({
        ...mockRide,
        _id: mockRideId.toString(),
      });

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: mockRideId,
      });
    });

    it('returns null when ride not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const result = await rideService.getRideRequest('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateRideStatus', () => {
    it('successfully updates ride status', async () => {
      const mockRideId = new ObjectId();
      const mockRide = {
        _id: mockRideId,
        ...mockRideRequest,
        userId: 'user123',
        status: RIDE_STATUS.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(mockRide);

      const result = await rideService.updateRideStatus(
        mockRideId.toString(),
        RIDE_STATUS.CONFIRMED
      );

      expect(result).toEqual({
        ...mockRide,
        _id: mockRideId.toString(),
      });

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockRideId },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: RIDE_STATUS.CONFIRMED,
          }),
        }),
        expect.any(Object)
      );
    });
  });
});