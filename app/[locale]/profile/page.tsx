// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/profile/page.tsx
// Profile page - where voters manage their rideshare destiny!

import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './components/profile-form';
import { PreferencesForm } from './components/preferences-form';
import { EmergencyContactsForm } from './components/emergency-contacts-form';
import { VerificationStatus } from './components/verification-status';
import { ProfileSkeleton } from './components/profile-skeleton';
import { auth } from '@/lib/auth';
import { userService } from '@/lib/services/user-service';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const profile = await userService.getProfileByUserId(session.user.id);

  return (
    <div className="container max-w-3xl py-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your profile and preferences for Voter Rideshare.
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        <Suspense fallback={<ProfileSkeleton />}>
          <VerificationStatus 
            emailVerified={profile?.emailVerified}
            phoneVerified={profile?.phoneVerified}
          />

          <div className="space-y-8">
            <ProfileForm initialData={profile} />
            <Separator />
            <PreferencesForm initialData={profile?.preferences} />
            <Separator />
            <EmergencyContactsForm 
              initialContacts={profile?.emergencyContacts}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}