// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/request-ride/ride-request-form.tsx
// Ride request form - where democracy meets the road!

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RideRequest, rideRequestSchema, PICKUP_TIME_WINDOWS } from '@/types/ride';
import { createRideRequest } from './actions';

/**
 * Form component for requesting a ride
 */
export function RideRequestForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RideRequest>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      passengers: 1,
      mobilityNeeds: false,
      returnRideNeeded: false,
    },
  });

  const onSubmit = async (data: RideRequest) => {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const result = await createRideRequest(data);
      if (result.success) {
        router.push(`/rides/${result.rideId}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Pickup Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pickup Location</h3>
          <FormField
            control={form.control}
            name="pickupLocation.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupLocation.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupLocation.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pickupLocation.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Voting Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Voting Location</h3>
          <FormField
            control={form.control}
            name="votingLocation.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="votingLocation.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="votingLocation.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="votingLocation.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ride Details</h3>
          
          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Pickup Time</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeWindow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Window</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flexibility window" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PICKUP_TIME_WINDOWS.map((window) => (
                      <SelectItem key={window} value={window.toString()}>
                        {window} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  How flexible are you with the pickup time?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Passengers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={4} 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Maximum 4 passengers per vehicle
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobilityNeeds"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Mobility Assistance Needed</FormLabel>
                  <FormDescription>
                    Check if you need a wheelchair-accessible vehicle or other mobility assistance
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnRideNeeded"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Return Ride Needed</FormLabel>
                  <FormDescription>
                    Check if you need a ride back from the polling location
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Any additional information for your driver..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Request Ride'}
        </Button>
      </form>
    </Form>
  );
}