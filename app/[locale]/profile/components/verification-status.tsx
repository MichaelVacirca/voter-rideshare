// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/profile/components/verification-status.tsx
// Verification status component - because trust is the foundation of democracy!

'use client';

import { useState } from 'react';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { VERIFICATION_STATUS } from '@/types/user';
import { initiateVerification, verifyCode } from '../actions';

interface VerificationStatusProps {
  emailVerified?: boolean;
  phoneVerified?: VERIFICATION_STATUS;
}

export function VerificationStatus({ 
  emailVerified, 
  phoneVerified 
}: VerificationStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleInitiateVerification = async () => {
    setIsVerifying(true);
    try {
      await initiateVerification();
      setIsDialogOpen(true);
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    try {
      const success = await verifyCode(verificationCode);
      if (success) {
        setIsDialogOpen(false);
        toast({
          title: 'Verification Successful',
          description: 'Your phone number has been verified.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Code',
          description: 'Please check the code and try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to verify code. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {!emailVerified && (
        <Alert variant="warning">
          <Icons.mail className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please verify your email address to ensure you receive important updates.
            <Button 
              variant="link" 
              className="pl-0"
              onClick={handleInitiateVerification}
              disabled={isVerifying}
            >
              Resend verification email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {phoneVerified !== VERIFICATION_STATUS.VERIFIED && (
        <Alert variant="warning">
          <Icons.phone className="h-4 w-4" />
          <AlertTitle>Phone Verification Required</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Verify your phone number to enable ride notifications and communication
              with your driver.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInitiateVerification}
              disabled={isVerifying}
            >
              {isVerifying && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Verify Phone Number
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit code to your phone. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              pattern="\d*"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}