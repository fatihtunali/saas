'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, FileText, Mail, Calendar, User } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types/bookings';
import { formatDate } from '@/lib/utils/formatters';
import { VoucherGenerator } from '@/components/features/vouchers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BookingHeaderProps {
  booking: Booking;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const colors: Record<BookingStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <Badge className={colors[status]} variant="outline">
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function BookingHeader({ booking }: BookingHeaderProps) {
  const router = useRouter();
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/bookings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-mono">{booking.bookingCode}</h1>
            <p className="text-muted-foreground text-sm">Booking Details</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Quick Info Card */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Info */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold truncate">{booking.clientName || 'Unknown'}</p>
                  {booking.clientType && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {booking.clientType}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Travel Dates */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Travel Dates</p>
                  <p className="font-semibold text-sm">
                    {formatDate(booking.travelStartDate)} - {formatDate(booking.travelEndDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.numberOfNights || 0} nights • {booking.passengerCount || 0} travelers
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:justify-end">
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowVoucherDialog(true)}
                  disabled={!booking.services || booking.services.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Vouchers
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                {booking.status !== 'CANCELLED' && (
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Generator Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Vouchers</DialogTitle>
            <DialogDescription>
              Select services to generate vouchers for booking {booking.bookingCode}
            </DialogDescription>
          </DialogHeader>
          <VoucherGenerator
            booking={booking}
            services={booking.services || []}
            passengers={booking.passengers || []}
            onVoucherGenerated={() => {
              // Optional: Refresh booking data or show success message
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
