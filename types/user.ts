// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /types/user.ts
// User type definitions - because every voter needs a profile!

import { z } from 'zod';

/** Phone verification status */
export const VERIFICATION_STATUS = {
  /** Not yet verified */
  UNVERIFIED: 'UNVERIFIED',
  /** Code sent, awaiting verification */
  PENDING: 'PENDING',
  /** Successfully verified */
  VERIFIED: 'VERIFIED',
  /** Verification failed */
  FAILED: 'FAILED',
} as const;

/** User accessibility needs */
export const ACCESSIBILITY_NEEDS = {
  /** Wheelchair accessible vehicle needed */
  WHEELCHAIR: 'WHEELCHAIR',
  /** Visual assistance needed */
  VISUAL: 'VISUAL',
  /** Hearing assistance needed */
  HEARING: 'HEARING',
  /** Walking assistance needed */
  MOBILITY: 'MOBILITY',
  /** Service animal accompaniment */
  SERVICE_ANIMAL: 'SERVICE_ANIMAL',
} as const;

/** User communication preferences */
export const COMMUNICATION_PREFS = {
  /** Email notifications */
  EMAIL: 'EMAIL',
  /** SMS notifications */
  SMS: 'SMS',
  /** Push notifications */
  PUSH: 'PUSH',
  /** WhatsApp notifications */
  WHATSAPP: 'WHATSAPP',
} as const;

/** Language preferences */
export const LANGUAGES = {
  /** English */
  ENGLISH: 'en',
  /** Spanish */
  SPANISH: 'es',
  /** Chinese */
  CHINESE: 'zh',
  /** Vietnamese */
  VIETNAMESE: 'vi',
  /** Korean */
  KOREAN: 'ko',
} as const;

/** Emergency contact schema */
export const emergencyContactSchema = z.object({
  /** Full name of contact */
  name: z.string().min(1, 'Name is required'),
  /** Relationship to user */
  relationship: z.string().min(1, 'Relationship is required'),
  /** Phone number */
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  /** Email address */
  email: z.string().email().optional(),
});

/** User profile schema */
export const userProfileSchema = z.object({
  /** User's full name */
  fullName: z.string().min(1, 'Full name is required'),
  /** Phone number */
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  /** Phone verification status */
  phoneVerified: z.enum([
    VERIFICATION_STATUS.UNVERIFIED,
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.VERIFIED,
    VERIFICATION_STATUS.FAILED,
  ]),
  /** Email address */
  email: z.string().email('Invalid email address'),
  /** Email verification status */
  emailVerified: z.boolean(),
  /** Profile photo URL */
  photoUrl: z.string().url().optional(),
  /** Home address */
  address: z.string().optional(),
  /** Preferred language */
  language: z.enum(Object.values(LANGUAGES)),
  /** Accessibility needs */
  accessibilityNeeds: z.array(
    z.enum(Object.values(ACCESSIBILITY_NEEDS))
  ).optional(),
  /** Communication preferences */
  communicationPrefs: z.array(
    z.enum(Object.values(COMMUNICATION_PREFS))
  ),
  /** Emergency contacts */
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
  /** User preferences */
  preferences: z.object({
    /** Preferred gender of driver */
    preferredDriverGender: z.enum(['ANY', 'MALE', 'FEMALE']).optional(),
    /** Whether return trips are typically needed */
    requiresReturnTrip: z.boolean().default(false),
    /** Maximum walking distance (meters) */
    maxWalkingDistance: z.number().default(100),
    /** Whether to receive voting reminders */
    receiveReminders: z.boolean().default(true),
  }),
});

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

/** Database model for user profiles */
export interface UserProfileModel extends UserProfile {
  /** MongoDB ID */
  _id: string;
  /** Associated auth user ID */
  userId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Last login timestamp */
  lastLoginAt: Date;
  /** Account status */
  isActive: boolean;
  /** Whether user is also a driver */
  isDriver: boolean;
  /** Whether user is an admin */
  isAdmin: boolean;
  /** Rating as a rider */
  riderRating: number;
  /** Number of completed rides */
  completedRides: number;
  /** Number of cancelled rides */
  cancelledRides: number;
}