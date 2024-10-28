// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/rides/request/components/return-trip-options.tsx
// Return trip options component for scheduling return rides

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, ArrowRight, Calendar } from 'lucide-react';
import { addMinutes, format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const returnTripSchema = z.object({
  needsReturn: z.boolean(),
  estimatedDuration: z.number().min(5).max(120),
  preferredReturnTime: z.string().optional(),
  flexibleTiming: z.boolean().default(true),
  returnTimeBuffer: z.enum(['15', '30', '45', '60']).optional(),
  specialInstructions: z.string().max(200).optional(),
});

type ReturnTripForm = z.infer<typeof returnTripSchema>;

interface ReturnTripOptionsProps {
  onUpdate: (returnTrip: ReturnTripForm) => void;
  initialPickupTime?: Date;
}

export function ReturnTripOptions({ 
  onUpdate,
  initialPickupTime 
}: ReturnTripOptionsProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [estimatedReturnTime, setEstimatedReturnTime] = useState<Date | null>(null);

  const form = useForm<ReturnTripForm>({
    resolver: zodResolver(returnTripSchema),
    defaultValues: {
      needsReturn: false,
      estimatedDuration: 30,
      flexibleTiming: true,
      returnTimeBuffer: '30',
    },
  });

  const watchNeedsReturn = form.watch('needsReturn');
  const watchEstimatedDuration = form.watch('estimatedDuration');
  const watchFlexibleTiming = form.watch('flexibleTiming');

  // Update estimated return time when duration changes
  const updateEstimatedTime = (duration: number) => {
    if (initialPickupTime) {
      const estimated = addMinutes(initialPickupTime, duration);
      setEstimatedReturnTime(estimated);
    }
  };

  // Handle form changes
  const onFormChange = (values: ReturnTripForm) => {
    updateEstimatedTime(values.estimatedDuration);
    onUpdate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onChange={form.handleSubmit(onFormChange)} className="space-y-4">
            <FormField
              control={form.control}
              name="needsReturn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Need a Return Ride?</FormLabel>
                    <FormDescription>
                      Schedule a ride back after voting
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

            {watchNeedsReturn && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Voting Duration</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            min={5}
                            max={120}
                            className="w-20"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(value);
                              updateEstimatedTime(value);
                            }}
                          />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">minutes</span>
                      </div>
                      <FormDescription>
                        How long do you expect to spend at the polling place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {estimatedReturnTime && (
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Estimated return time: {format(estimatedReturnTime, 'h:mm a')}
                      </span>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="flexibleTiming"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Flexible Return Time</FormLabel>
                        <FormDescription>
                          Allow for some flexibility in return pickup time
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

                {watchFlexibleTiming && (
                  <FormField
                    control={form.control}
                    name="returnTimeBuffer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Buffer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time buffer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">±15 minutes</SelectItem>
                            <SelectItem value="30">±30 minutes</SelectItem>
                            <SelectItem value="45">±45 minutes</SelectItem>
                            <SelectItem value="60">±1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How flexible can you be with the return pickup time?
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Any special instructions for return trip"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Add any special instructions for your return trip
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                    >
                      Review Return Trip Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Return Trip Details</DialogTitle>
                      <DialogDescription>
                        Review and confirm your return trip preferences
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Estimated return: {estimatedReturnTime && 
                              format(estimatedReturnTime, 'h:mm a')}
                          </span>
                        </div>
                        {watchFlexibleTiming && (
                          <div className="text-sm text-muted-foreground">
                            Flexible window: ±{form.getValues('returnTimeBuffer')} minutes
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        We'll arrange for a driver to pick you up after you're done voting.
                        You can always adjust the return time if needed.
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}