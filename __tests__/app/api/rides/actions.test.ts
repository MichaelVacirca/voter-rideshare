// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /__tests__/app/api/rides/actions.test.ts
// Tests for ride actions - because democracy needs reliable transportation!

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { redisClient } from '@/lib/redis';
import { rideService } from '@/lib/services/ride-service';
import { RIDE_STATUS } from '@/types/ride';
import {
  createRideRequest,
  updateRideStatus,
  cancelRide,
  assignDriver,
  listUserRides,
} from './actions';

// Mock dependencies
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('@/lib/services/ride-service', () => ({
  rideService: {
    createRideRequest: jest.fn(),
    getRideRequest: jest.fn(),
    updateRideStatus: jest.fn(),
    assignDriver: jest.fn(),
    listUserRides: jest.fn(),
  },
}));

describe('Ride Actions', () => {
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockDriver = {
    id: 'driver123',
    name: 'Test Driver',
    email: 'driver@example.com',
    isDriver: true,
  };

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
    jest.clearAllMocks();
  });

  describe('createRideRequest', () => {
    it('creates ride request successfully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (rideService.createRideRequest as jest.Mock).mockResolvedValue({
        _id: 'ride123',
        ...mockRideRequest,
      });

      const result = await createRideRequest(mockRideRequest);

      expect(result.success).toBe(true);
      expect(result.data?.rideId).toBe('ride123');
      expect(revalidatePath).toHaveBeenCalledWith('/rides');
      expect(redisClient.del).toHaveBeenCalledWith(`user:${mockUser.id}:rides`);
    });

    it('fails when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await createRideRequest(mockRideRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
      expect(rideService.createRideRequest).not.toHaveBeenCalled();
    });

    it('handles validation errors gracefully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      
      const invalidRequest = {
        ...mockRideRequest,
        passengers: 10, // Exceeds maximum allowed
      };

      const result = await createRideRequest(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid form data');
      expect(rideService.createRideRequest).not.toHaveBeenCalled();
    });
  });

  describe('updateRideStatus', () => {
    const mockRide = {
      _id: 'ride123',
      userId: mockUser.id,
      status: RIDE_STATUS.PENDING,
    };

    it('updates status successfully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(mockRide);

      const result = await updateRideStatus('ride123', RIDE_STATUS.CONFIRMED);

      expect(result.success).toBe(true);
      expect(rideService.updateRideStatus).toHaveBeenCalledWith(
        'ride123',
        RIDE_STATUS.CONFIRMED
      );
      expect(revalidatePath).toHaveBeenCalledWith('/rides/ride123');
      expect(redisClient.del).toHaveBeenCalledWith('ride:ride123');
    });

    it('fails when user is unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValue({ 
        user: { ...mockUser, id: 'different-user' } 
      });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(mockRide);

      const result = await updateRideStatus('ride123', RIDE_STATUS.CONFIRMED);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(rideService.updateRideStatus).not.toHaveBeenCalled();
    });

    it('fails when ride is not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(null);

      const result = await updateRideStatus('ride123', RIDE_STATUS.CONFIRMED);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ride not found');
      expect(rideService.updateRideStatus).not.toHaveBeenCalled();
    });
  });

  describe('cancelRide', () => {
    const mockRide = {
      _id: 'ride123',
      userId: mockUser.id,
      status: RIDE_STATUS.PENDING,
    };

    it('cancels ride successfully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(mockRide);

      const result = await cancelRide('ride123');

      expect(result.success).toBe(true);
      expect(rideService.updateRideStatus).toHaveBeenCalledWith(
        'ride123',
        RIDE_STATUS.CANCELLED
      );
      expect(revalidatePath).toHaveBeenCalledWith('/rides/ride123');
      expect(redisClient.del).toHaveBeenCalledWith('ride:ride123');
    });

    it('fails when cancelling completed ride', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue({
        ...mockRide,
        status: RIDE_STATUS.COMPLETED,
      });

      const result = await cancelRide('ride123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel completed ride');
      expect(rideService.updateRideStatus).not.toHaveBeenCalled();
    });
  });

  describe('assignDriver', () => {
    const mockRide = {
      _id: 'ride123',
      userId: mockUser.id,
      status: RIDE_STATUS.PENDING,
    };

    it('assigns driver successfully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockDriver });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(mockRide);

      const result = await assignDriver('ride123');

      expect(result.success).toBe(true);
      expect(rideService.assignDriver).toHaveBeenCalledWith(
        'ride123',
        mockDriver.id
      );
      expect(revalidatePath).toHaveBeenCalledWith('/rides/ride123');
      expect(redisClient.del).toHaveBeenCalledWith('ride:ride123');
    });

    it('fails when user is not a driver', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser }); // Regular user, not a driver
      (rideService.getRideRequest as jest.Mock).mockResolvedValue(mockRide);

      const result = await assignDriver('ride123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be an authorized driver');
      expect(rideService.assignDriver).not.toHaveBeenCalled();
    });

    it('fails when ride is not available', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockDriver });
      (rideService.getRideRequest as jest.Mock).mockResolvedValue({
        ...mockRide,
        status: RIDE_STATUS.CONFIRMED,
      });

      const result = await assignDriver('ride123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ride is not available');
      expect(rideService.assignDriver).not.toHaveBeenCalled();
    });
  });

  describe('listUserRides', () => {
    it('returns cached rides when available', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      const cachedRides = [{ _id: 'ride123' }];
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedRides));

      const result = await listUserRides();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedRides);
      expect(rideService.listUserRides).not.toHaveBeenCalled();
    });

    it('fetches and caches rides when cache is empty', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const rides = [{ _id: 'ride123' }];
      (rideService.listUserRides as jest.Mock).mockResolvedValue(rides);

      const result = await listUserRides();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(rides);
      expect(rideService.listUserRides).toHaveBeenCalledWith(mockUser.id);
      expect(redisClient.setex).toHaveBeenCalledWith(
        `user:${mockUser.id}:rides`,
        300,
        JSON.stringify(rides)
      );
    });

    it('handles unauthenticated users', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await listUserRides();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
      expect(rideService.listUserRides).not.toHaveBeenCalled();
    });

    it('handles service errors gracefully', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (rideService.listUserRides as jest.Mock).mockRejectedValue(new Error('Service error'));

      const result = await listUserRides();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to list rides');
    });
  });
});