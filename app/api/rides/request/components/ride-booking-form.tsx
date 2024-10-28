// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/rides/request/components/ride-booking-form.tsx
// The main form component for booking rides

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocationSearch } from '@/components/map/location-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { createRideRequest } from '../actions';
import { RideRequest, rideRequestSchema } from '@/types/ride';
import { Loader2, CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PickupTime {
  date: Date;
  time: string;
}

export function RideBookingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RideRequest>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      passengers: 1,
      mobilityNeeds: false,
      returnRideNeeded: false,
    },
  });

  async function onSubmit(data: RideRequest) {
    setIsLoading(true);
    try {
      const result = await createRideRequest(data);
      if (result.success) {
        toast({
          title: 'Ride Requested',
          description: 'We will notify you when a driver accepts your request.',
        });
        router.push(`/rides/${result.rideId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to request ride',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleLocationSelect = (type: 'pickup' | 'voting', location: any) => {
    form.setValue(type === 'pickup' ? 'pickupLocation' : 'votingLocation', location);
    form.trigger(type === 'pickup' ? 'pickupLocation' : 'votingLocation');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pickupLocation"
          render={() => (
            <FormItem>
              <FormLabel>Pickup Location</FormLabel>
              <LocationSearch
                onLocationSelect={(location) => handleLocationSelect('pickup', location)}
                placeholder="Enter your pickup address"
                error={form.formState.errors.pickupLocation?.street?.message}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="votingLocation"
          render={() => (
            <FormItem>
              <FormLabel>Polling Location</FormLabel>
              <LocationSearch
                onLocationSelect={(location) => handleLocationSelect('voting', location)}
                placeholder="Enter your polling place address"
                error={form.formState.errors.votingLocation?.street?.message}
              />
              <FormDescription>
                Make sure this is your assigned polling location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pickup Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date(2024, 11, 31)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  className="mt-2"
                  onChange={(e) => {
                    const date = field.value || new Date();
                    const [hours, minutes] = e.target.value.split(':');
                    date.setHours(parseInt(hours), parseInt(minutes));
                    field.onChange(date);
                  }}
                />
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
        </div>

        <FormField
          control={form.control}
          name="mobilityNeeds"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Accessibility Needs
                </FormLabel>
                <FormDescription>
                  Request a wheelchair accessible vehicle or mobility assistance
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="returnRideNeeded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Return Trip
                </FormLabel>
                <FormDescription>
                  Request a ride back after voting
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting Ride...
            </>
          ) : (
            'Request Ride'
          )}
        </Button>
      </form>
    </Form>
  );
}