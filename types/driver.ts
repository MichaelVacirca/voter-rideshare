// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /types/driver.ts 
// Driver type definitions - because every superhero needs a proper origin story!

import { z } from 'zod';

/** Status of driver verification */
export const DRIVER_STATUS = {
  /** Initial application submitted */
  PENDING: 'PENDING',
  /** Background check in progress */
  VERIFYING: 'VERIFYING',
  /** Approved to drive */
  APPROVED: 'APPROVED',
  /** Not approved or suspended */
  REJECTED: 'REJECTED',
  /** Temporarily deactivated */
  SUSPENDED: 'SUSPENDED',
} as const;

/** Vehicle type options */
export const VEHICLE_TYPE = {
  /** Standard car */
  SEDAN: 'SEDAN',
  /** Larger vehicle */
  SUV: 'SUV',
  /** Wheelchair accessible */
  ACCESSIBLE: 'ACCESSIBLE',
} as const;

/** Validation schema for vehicle information */
export const vehicleSchema = z.object({
  /** Make of the vehicle */
  make: z.string().min(1, 'Vehicle make is required'),
  /** Model of the vehicle */
  model: z.string().min(1, 'Vehicle model is required'),
  /** Year of the vehicle */
  year: z.number()
    .min(2000, 'Vehicle must be 2000 or newer')
    .max(new Date().getFullYear() + 1),
  /** License plate */
  licensePlate: z.string().min(1, 'License plate is required'),
  /** Vehicle type */
  type: z.enum([
    VEHICLE_TYPE.SEDAN,
    VEHICLE_TYPE.SUV,
    VEHICLE_TYPE.ACCESSIBLE,
  ]),
  /** Number of available seats */
  seats: z.number().min(2).max(8),
  /** Whether vehicle has child seats */
  hasChildSeats: z.boolean(),
  /** Insurance provider */
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  /** Insurance policy number */
  insurancePolicy: z.string().min(1, 'Insurance policy number is required'),
});

/** Validation schema for driver availability */
export const availabilitySchema = z.object({
  /** Date of availability */
  date: z.date(),
  /** Start time in minutes from midnight */
  startTime: z.number().min(0).max(1440),
  /** End time in minutes from midnight */
  endTime: z.number().min(0).max(1440),
  /** Geographic area codes driver is willing to serve */
  areaCodes: z.array(z.string()),
});

/** Validation schema for driver registration */
export const driverRegistrationSchema = z.object({
  /** Driver's license information */
  license: z.object({
    /** License number */
    number: z.string().min(1, 'License number is required'),
    /** State of issue */
    state: z.string().length(2, 'Please use two-letter state code'),
    /** Expiration date */
    expiration: z.date().min(new Date(), 'License must not be expired'),
  }),
  /** Vehicle information */
  vehicle: vehicleSchema,
  /** Background check consent */
  backgroundCheckConsent: z.literal(true, {
    errorMap: () => ({ message: 'Background check consent is required' }),
  }),
  /** Commitment to voter rights */
  voterRightsCommitment: z.literal(true, {
    errorMap: () => ({ message: 'Must commit to supporting voter rights' }),
  }),
  /** Emergency contact */
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
    relationship: z.string().min(1, 'Relationship is required'),
  }),
  /** Availability schedule */
  availability: z.array(availabilitySchema),
  /** Additional notes */
  notes: z.string().optional(),
});

export type VehicleInfo = z.infer<typeof vehicleSchema>;
export type DriverAvailability = z.infer<typeof availabilitySchema>;
export type DriverRegistration = z.infer<typeof driverRegistrationSchema>;
export type DriverStatus = keyof typeof DRIVER_STATUS;

/** Database model for driver profiles */
export interface DriverModel {
  /** Unique identifier */
  _id: string;
  /** Associated user ID */
  userId: string;
  /** Driver's registration info */
  registration: DriverRegistration;
  /** Verification status */
  status: DriverStatus;
  /** Number of completed rides */
  completedRides: number;
  /** Average rating */
  rating: number;
  /** Background check reference ID */
  backgroundCheckId?: string;
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
  /** Last background check date */
  lastBackgroundCheck?: Date;
}