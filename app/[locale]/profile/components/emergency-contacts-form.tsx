// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/profile/components/emergency-contacts-form.tsx
// Emergency contacts form - because safety comes first!

'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { 
  EmergencyContact, 
  emergencyContactSchema 
} from '@/types/user';
import { updateEmergencyContacts } from '../actions';

interface EmergencyContactsFormProps {
  initialContacts?: EmergencyContact[];
}

export function EmergencyContactsForm({ 
  initialContacts = [] 
}: EmergencyContactsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(emergencyContactSchema.array()),
    defaultValues: {
      contacts: initialContacts.length > 0 
        ? initialContacts 
        : [{ name: '', relationship: '', phone: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  async function onSubmit(data: { contacts: EmergencyContact[] }) {
    setIsLoading(true);
    try {
      await updateEmergencyContacts(data.contacts);
      toast({
        title: 'Emergency Contacts Updated',
        description: 'Your emergency contacts have been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update emergency contacts. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Emergency Contacts</h3>
        <p className="text-sm text-muted-foreground">
          Add emergency contacts who can be reached if needed during your ride.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact {index + 1}</CardTitle>
                  <CardDescription>
                    Emergency contact information
                  </CardDescription>
                </div>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ 
              name: '', 
              relationship: '', 
              phone: '', 
              email: '' 
            })}
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Another Contact
          </Button>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Emergency Contacts
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}