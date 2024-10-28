// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/auth/components/auth-form.tsx
// Authentication form - your gateway to civic engagement!

'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AuthFormProps {
  type?: 'signin' | 'signup';
}

export function AuthForm({ type = 'signin' }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>('');
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'A sign in link has been sent to your email address.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {type === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => signIn('google', { callbackUrl })}
            disabled={isLoading}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => signIn('apple', { callbackUrl })}
            disabled={isLoading}
          >
            <Icons.apple className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {type === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}