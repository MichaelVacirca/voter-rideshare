// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/schemas/ride.ts
// Ride request schema - because even democracy needs data validation!

import { z } from 'zod';

/** Valid ride statuses */
export const RIDE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/** Maximum days in advance a ride can be requested */
export const MAX_ADVANCE_DAYS = 14;

/** Minimum notice hours required for a ride */
export const MIN_NOTICE_HOURS = 24;

/**
 * Schema for validating address data
 */
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Please use two-letter state code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
});

/**
 * Schema for validating ride requests
 */
export const rideRequestSchema = z.object({
  // Voter Information
  voterName: z.string().min(2, 'Name is required'),
  voterPhone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  voterEmail: z.string().email('Invalid email address'),
  
  // Ride Details
  pickupAddress: addressSchema,
  pollingAddress: addressSchema,
  
  // Schedule
  pickupDate: z.date()
    .min(new Date(), 'Pickup date must be in the future')
    .max(
      new Date(Date.now() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000),
      `Rides can only be scheduled up to ${MAX_ADVANCE_DAYS} days in advance`
    ),
  pickupTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  
  // Accessibility
  needsWheelchairAccess: z.boolean().default(false),
  additionalPassengers: z.number().min(0).max(3),
  
  // Notes
  specialInstructions: z.string().max(500).optional(),
});

/**
 * Type for the ride request data
 */
export type RideRequest = z.infer<typeof rideRequestSchema>;

/**
 * Schema for the complete ride record including system fields
 */
export const rideSchema = rideRequestSchema.extend({
  _id: z.string(),
  status: z.enum([
    RIDE_STATUS.PENDING,
    RIDE_STATUS.ACCEPTED,
    RIDE_STATUS.COMPLETED,
    RIDE_STATUS.CANCELLED
  ]),
  driverId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  cancellationReason: z.string().optional(),
});

/**
 * Type for the complete ride record
 */
export type Ride = z.infer<typeof rideSchema>;