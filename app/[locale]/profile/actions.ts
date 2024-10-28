// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/profile/actions.ts
// Profile actions - where the user data magic happens!

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { userService } from '@/lib/services/user-service';
import { 
  UserProfile, 
  EmergencyContact,
  VERIFICATION_STATUS 
} from '@/types/user';

export async function updateProfile(
  data: Partial<UserProfile>
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const profile = await userService.getProfileByUserId(session.user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await userService.updateProfile(profile._id, data);
  revalidatePath('/profile');
}

export async function updatePreferences(
  preferences: UserProfile['preferences']
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const profile = await userService.getProfileByUserId(session.user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await userService.updateProfile(profile._id, { preferences });
  revalidatePath('/profile');
}

export async function updateEmergencyContacts(
  contacts: EmergencyContact[]
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const profile = await userService.getProfileByUserId(session.user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await userService.updateProfile(profile._id, { emergencyContacts: contacts });
  revalidatePath('/profile');
}

export async function initiateVerification() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const profile = await userService.getProfileByUserId(session.user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }

  if (!profile.phoneVerified || 
      profile.phoneVerified === VERIFICATION_STATUS.FAILED) {
    await userService.initiatePhoneVerification(profile._id);
  }

  if (!profile.emailVerified) {
    await userService.initiateEmailVerification(profile._id);
  }
}

export async function verifyCode(code: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const profile = await userService.getProfileByUserId(session.user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const success = await userService.verifyPhone(profile._id, code);
  if (success) {
    revalidatePath('/profile');
  }
  
  return success;
}