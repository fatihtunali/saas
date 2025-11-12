'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Bookings page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-destructive/10 p-6 mb-6">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>

        <p className="text-muted-foreground text-center max-w-md mb-2">
          An error occurred while loading the bookings page.
        </p>

        {error.message && (
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6 font-mono bg-muted px-4 py-2 rounded">
            {error.message}
          </p>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => (window.location.href = '/dashboard')}>
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground mt-6">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
