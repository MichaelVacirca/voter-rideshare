// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/request-ride/actions.ts
// Server actions for ride requests - where the backend magic happens!

'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { rideService } from '@/lib/services/ride-service';
import { RideRequest, rideRequestSchema } from '@/types/ride';

/**
 * Creates a new ride request
 * @param formData - The ride request form data
 * @returns Success status and ride ID or error message
 */
export async function createRideRequest(formData: RideRequest): Promise<{ success: boolean; rideId?: string; error?: string }> {
  try {
    // Validate the session
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'You must be logged in to request a ride',
      };
    }

    // Validate the form data
    const validatedData = rideRequestSchema.parse(formData);

    // Create the ride request
    const rideRequest = await rideService.createRideRequest(
      session.user.id,
      validatedData
    );

    // Revalidate the rides list page
    revalidatePath('/rides');

    return {
      success: true,
      rideId: rideRequest._id,
    };
  } catch (error) {
    console.error('Error creating ride request:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}