'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function BookingDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Booking details error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-2 text-center">
            {error.message || 'An error occurred while loading the booking details'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/bookings')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
