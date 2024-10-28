// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/rides/request/actions.ts
// Ride request actions - handling the core ride request flow

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { rideService } from '@/lib/services/ride-service';
import { geoService } from '@/lib/services/geo-service';
import { notificationService } from '@/lib/services/notification-service';
import { RideRequest, rideRequestSchema } from '@/types/ride';

/**
 * Create a new ride request
 */
export async function createRideRequest(
  data: RideRequest
): Promise<{ success: boolean; rideId?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate the request data
    const validatedData = rideRequestSchema.parse(data);

    // Verify polling location
    const pollingPlace = await geoService.verifyPollingPlace(validatedData.votingLocation);
    if (!pollingPlace?.isValid) {
      return { 
        success: false, 
        error: 'Invalid polling location. Please verify the address.' 
      };
    }

    // Create the ride request
    const ride = await rideService.createRideRequest(session.user.id, {
      ...validatedData,
      status: 'PENDING',
      pollingPlaceVerified: true,
    });

    // Send notifications
    await notificationService.notifyNewRideRequest(ride._id);

    // Revalidate relevant pages
    revalidatePath('/rides');
    revalidatePath(`/rides/${ride._id}`);

    return {
      success: true,
      rideId: ride._id,
    };
  } catch (error) {
    console.error('Error creating ride request:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid form data' };
    }
    return { success: false, error: 'Failed to create ride request' };
  }
}

/**
 * Cancel a ride request
 */
export async function cancelRideRequest(
  rideId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const ride = await rideService.getRideRequest(rideId);
    if (!ride) {
      return { success: false, error: 'Ride not found' };
    }

    if (ride.userId !== session.user.id) {
      return { success: false, error: 'Not authorized' };
    }

    await rideService.cancelRideRequest(rideId);
    
    // Notify relevant parties
    await notificationService.notifyRideCancelled(rideId);

    // Revalidate pages
    revalidatePath('/rides');
    revalidatePath(`/rides/${rideId}`);

    return { success: true };
  } catch (error) {
    console.error('Error cancelling ride request:', error);
    return { success: false, error: 'Failed to cancel ride' };
  }
}

/**
 * Update ride request details
 */
export async function updateRideRequest(
  rideId: string,
  updates: Partial<RideRequest>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const ride = await rideService.getRideRequest(rideId);
    if (!ride) {
      return { success: false, error: 'Ride not found' };
    }

    if (ride.userId !== session.user.id) {
      return { success: false, error: 'Not authorized' };
    }

    // Only allow updates to pending rides
    if (ride.status !== 'PENDING') {
      return { 
        success: false, 
        error: 'Cannot update ride that is already matched or in progress' 
      };
    }

    await rideService.updateRideRequest(rideId, updates);

    // Revalidate pages
    revalidatePath('/rides');
    revalidatePath(`/rides/${rideId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating ride request:', error);
    return { success: false, error: 'Failed to update ride' };
  }
}