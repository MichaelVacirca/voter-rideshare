// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /types/ride.ts
// Ride type definitions - because TypeScript keeps our promises type-safe!

import { z } from 'zod';

/** Time window in minutes for pickup flexibility */
export const PICKUP_TIME_WINDOWS = [15, 30, 45, 60] as const;

/** Status of a ride request */
export const RIDE_STATUS = {
  /** Initial state when ride is first requested */
  PENDING: 'PENDING',
  /** Driver has been matched but not confirmed */
  MATCHED: 'MATCHED',
  /** Driver has confirmed the ride */
  CONFIRMED: 'CONFIRMED',
  /** Ride is in progress */
  IN_PROGRESS: 'IN_PROGRESS',
  /** Ride has been completed */
  COMPLETED: 'COMPLETED',
  /** Ride was cancelled */
  CANCELLED: 'CANCELLED',
} as const;

/** Validation schema for location data */
export const locationSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'Please use two-letter state code'),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  /** Optional additional instructions */
  notes: z.string().optional(),
});

/** Validation schema for ride requests */
export const rideRequestSchema = z.object({
  /** Pickup location details */
  pickupLocation: locationSchema,
  /** Voting location details */
  votingLocation: locationSchema,
  /** Desired pickup date and time */
  pickupTime: z.date({
    required_error: 'Please select a pickup time',
  }),
  /** Acceptable time window for pickup in minutes */
  timeWindow: z.enum(['15', '30', '45', '60'], {
    invalid_type_error: 'Please select a valid time window',
  }),
  /** Number of passengers */
  passengers: z.number()
    .int()
    .min(1, 'At least one passenger required')
    .max(4, 'Maximum 4 passengers allowed'),
  /** Any mobility accommodations needed */
  mobilityNeeds: z.boolean(),
  /** Additional notes for the driver */
  specialInstructions: z.string().optional(),
  /** Whether return ride is needed */
  returnRideNeeded: z.boolean(),
});

/** Type for ride request based on schema */
export type RideRequest = z.infer<typeof rideRequestSchema>;

/** Type for location based on schema */
export type Location = z.infer<typeof locationSchema>;

/** Status type from ride status const */
export type RideStatus = typeof RIDE_STATUS[keyof typeof RIDE_STATUS];

/** Database model for ride requests */
export interface RideRequestModel extends RideRequest {
  /** Unique identifier for the ride */
  _id: string;
  /** User who requested the ride */
  userId: string;
  /** Current status of the ride */
  status: RideStatus;
  /** Driver assigned to the ride */
  driverId?: string;
  /** Timestamp when ride was requested */
  createdAt: Date;
  /** Timestamp of last update */
  updatedAt: Date;
}