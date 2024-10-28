// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/request-ride/page.tsx
// Ride request page - where the journey begins!

import { RideRequestForm } from './ride-request-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Page component for requesting a ride
 */
export default function RequestRidePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Request a Ride</CardTitle>
          <CardDescription>
            Fill out the form below to request a ride to your polling location.
            We'll match you with a volunteer driver.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RideRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}