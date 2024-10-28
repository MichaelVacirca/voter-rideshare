// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/user-service.ts
// User service - managing the profiles of democracy's participants!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { redisClient } from '@/lib/redis';
import { MONGODB_CONFIG } from '@/config';
import { UserProfile, UserProfileModel, VERIFICATION_STATUS } from '@/types/user';
import { sendVerificationSMS } from '@/lib/sms';
import { sendVerificationEmail } from '@/lib/email';

/** Cache TTL for user data (1 hour) */
const CACHE_TTL = 3600;

/**
 * Service class for user operations
 */
export class UserService {
  private collection: Collection<UserProfileModel>;

  constructor() {
    this.collection = getCollection<UserProfileModel>(MONGODB_CONFIG.collections.users);
  }

  /**
   * Creates a new user profile
   * @param userId - Auth user ID
   * @param profile - User profile data
   */
  async createProfile(
    userId: string, 
    profile: UserProfile
  ): Promise<UserProfileModel> {
    const now = new Date();

    const userProfile: Omit<UserProfileModel, '_id'> = {
      ...profile,
      userId,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      isActive: true,
      isDriver: false,
      isAdmin: false,
      riderRating: 5.0,
      completedRides: 0,
      cancelledRides: 0,
    };

    const result = await this.collection.insertOne(userProfile as any);
    
    const createdProfile = await this.getProfile(result.insertedId.toString());
    if (!createdProfile) {
      throw new Error('Failed to create user profile');
    }

    // Initiate verification processes
    if (!profile.phoneVerified) {
      await this.initiatePhoneVerification(createdProfile._id);
    }

    if (!profile.emailVerified) {
      await this.initiateEmailVerification(createdProfile._id);
    }

    return createdProfile;
  }

  /**
   * Retrieves a user profile
   * @param profileId - Profile ID
   */
  async getProfile(profileId: string): Promise<UserProfileModel | null> {
    // Check cache
    const cached = await redisClient.get(`user:${profileId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const profile = await this.collection.findOne({
      _id: new ObjectId(profileId),
    });

    if (profile) {
      // Cache the result
      await redisClient.setex(
        `user:${profileId}`,
        CACHE_TTL,
        JSON.stringify(profile)
      );
      return { ...profile, _id: profile._id.toString() };
    }

    return null;
  }

  /**
   * Updates a user profile
   * @param profileId - Profile ID
   * @param updates - Profile updates
   */
  async updateProfile(
    profileId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfileModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(profileId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (result) {
      // Clear cache
      await redisClient.del(`user:${profileId}`);
      return { ...result, _id: result._id.toString() };
    }

    return null;
  }

  /**
   * Initiates phone verification
   * @param profileId - Profile ID
   */
  async initiatePhoneVerification(profileId: string): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in Redis with 5-minute expiry
    await redisClient.setex(`verify:phone:${profileId}`, 300, verificationCode);

    // Update profile status
    await this.updateProfile(profileId, {
      phoneVerified: VERIFICATION_STATUS.PENDING,
    });

    // Send verification SMS
    await sendVerificationSMS(profile.phone, verificationCode);
  }

  /**
   * Verifies phone number
   * @param profileId - Profile ID
   * @param code - Verification code
   */
  async verifyPhone(profileId: string, code: string): Promise<boolean> {
    const storedCode = await redisClient.get(`verify:phone:${profileId}`);
    
    if (storedCode === code) {
      await this.updateProfile(profileId, {
        phoneVerified: VERIFICATION_STATUS.VERIFIED,
      });
      await redisClient.del(`verify:phone:${profileId}`);
      return true;
    }

    return false;
  }

  /**
   * Initiates email verification
   * @param profileId - Profile ID
   */
  async initiateEmailVerification(profileId: string): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    
    // Store token in Redis with 24-hour expiry
    await redisClient.setex(`verify:email:${profileId}`, 86400, verificationToken);

    // Send verification email
    await sendVerificationEmail(profile.email, verificationToken);
  }

  /**
   * Verifies email address
   * @param token - Verification token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const pattern = `verify:email:*`;
    const keys = await redisClient.keys(pattern);
    
    for (const key of keys) {
      const storedToken = await redisClient.get(key);
      if (storedToken === token) {
        const profileId = key.split(':')[2];
        await this.updateProfile(profileId, {
          emailVerified: true,
        });
        await redisClient.del(key);
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const userService = new UserService();