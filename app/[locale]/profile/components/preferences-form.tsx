// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/profile/components/preferences-form.tsx
// Preferences form component - customizing your rideshare experience!

'use client';

import { useState } from 'react';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ACCESSIBILITY_NEEDS, COMMUNICATION_PREFS } from '@/types/user';
import { updatePreferences } from '../actions';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';

interface PreferencesFormProps {
  initialData?: UserProfile['preferences'];
}

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      preferences: {
        preferredDriverGender: initialData?.preferredDriverGender || 'ANY',
        requiresReturnTrip: initialData?.requiresReturnTrip || false,
        maxWalkingDistance: initialData?.maxWalkingDistance || 100,
        receiveReminders: initialData?.receiveReminders || true,
      },
    },
  });

  async function onSubmit(data: { preferences: UserProfile['preferences'] }) {
    setIsLoading(true);
    try {
      await updatePreferences(data.preferences);
      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been successfully saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your ride experience and communication preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="preferences.preferredDriverGender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Driver Gender</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ANY">No Preference</SelectItem>
                    <SelectItem value="FEMALE">Female Driver</SelectItem>
                    <SelectItem value="MALE">Male Driver</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  We'll try our best to match you with your preference.
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferences.requiresReturnTrip"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Return Trip</FormLabel>
                  <FormDescription>
                    Always request a return trip after voting
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
            name="preferences.maxWalkingDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Walking Distance</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={500}
                    step={50}
                  />
                </FormControl>
                <FormDescription>
                  Maximum distance (in meters) you're comfortable walking
                  to/from the vehicle. Current: {field.value}m
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Accessibility Needs</FormLabel>
            <div className="flex flex-wrap gap-2">
              {Object.values(ACCESSIBILITY_NEEDS).map((need) => (
                <Badge
                  key={need}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    // Toggle accessibility need
                  }}
                >
                  {need.toLowerCase().replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <FormLabel>Communication Preferences</FormLabel>
            <div className="flex flex-wrap gap-2">
              {Object.values(COMMUNICATION_PREFS).map((pref) => (
                <Badge
                  key={pref}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    // Toggle communication preference
                  }}
                >
                  {pref.toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Preferences
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}