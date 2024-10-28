// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /components/error-boundary.tsx
// Error boundary component - gracefully handling the unexpected!

'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    Sentry.showReportDialog({
      eventId: Sentry.captureException(this.state.error),
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We apologize for the inconvenience. Our team has been notified and
                is working to fix the issue.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={this.handleReportError}>
                Report Issue
              </Button>
              <Button onClick={this.handleReload}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}