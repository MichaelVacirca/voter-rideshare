// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/rides/request/page.tsx
// Ride request page - the gateway to accessible voting!

import { Suspense } from 'react';
import { RideBookingForm } from './components/ride-booking-form';
import { LocationPicker } from './components/location-picker';
import { ReturnTripOptions } from './components/return-trip-options';
import { MapView } from '@/components/map/map-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const metadata = {
  title: 'Request a Ride | Voter Rideshare',
  description: 'Request a free ride to your polling location',
};

export default function RequestRidePage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request a Ride</h1>
          <p className="text-muted-foreground">
            Schedule a free ride to your polling location with a verified volunteer driver
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Please request your ride at least 24 hours before you plan to vote.
              All rides are provided by volunteer drivers.
            </p>
            <p>
              Make sure you have the correct polling location for your address.
              You can verify your polling place at your state's election website.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <RideBookingForm />
            </Suspense>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <MapView 
                  height="300px"
                  showRoute={true}
                  showDistance={true}
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Your ride details will be shared with verified volunteer
                    drivers in your area. We'll notify you when a driver accepts
                    your request.
                  </p>
                </div>
              </CardContent>
            </Card>

            <ReturnTripOptions />
          </div>
        </div>
      </div>
    </div>
  );
}