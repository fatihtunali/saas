'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  Package,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { Booking } from '@/types/bookings';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { differenceInDays } from 'date-fns';

interface OverviewTabProps {
  booking: Booking;
}

export function OverviewTab({ booking }: OverviewTabProps) {
  // Calculate days until departure
  const daysUntilTravel = differenceInDays(new Date(booking.travelStartDate), new Date());

  // Calculate completion percentage (based on having services, passengers, payments)
  const calculateCompletion = () => {
    let completed = 0;
    let total = 4;

    if (booking.status === 'CONFIRMED') completed++;
    if (booking.services && booking.services.length > 0) completed++;
    if (booking.passengers && booking.passengers.length > 0) completed++;
    if (booking.paidAmount && booking.paidAmount > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="space-y-6">
      {/* Row 1: Booking Information & Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking Code</p>
                <p className="font-mono font-semibold">{booking.bookingCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline" className="mt-1">
                  {booking.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="text-sm font-medium">{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="text-sm font-medium">{booking.createdByName || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Source</p>
                <p className="text-sm font-medium">{booking.bookingSource || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Client Name</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-semibold text-lg">{booking.clientName || 'Unknown'}</p>
                {booking.clientType && <Badge variant="secondary">{booking.clientType}</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Contact Details</p>
              {booking.clientEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${booking.clientEmail}`}
                    className="hover:underline text-primary"
                  >
                    {booking.clientEmail}
                  </a>
                </div>
              )}
              {booking.clientPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${booking.clientPhone}`} className="hover:underline text-primary">
                    {booking.clientPhone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trip Details & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-semibold text-lg">{booking.destination || 'N/A'}</p>
              {booking.country && (
                <p className="text-sm text-muted-foreground">{booking.country}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Travel Dates</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{formatDate(booking.travelStartDate)}</p>
                </div>
                <p className="text-sm font-medium">to {formatDate(booking.travelEndDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold mt-1">{booking.numberOfNights || 0} nights</p>
                <p className="text-xs text-muted-foreground">
                  {(booking.numberOfNights || 0) + 1} days
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Travelers</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {booking.numAdults} Adult{booking.numAdults > 1 ? 's' : ''}
                    </p>
                    {booking.numChildren > 0 && (
                      <p className="text-sm font-medium">
                        {booking.numChildren} Child{booking.numChildren > 1 ? 'ren' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {booking.numChildren > 0 && booking.childrenAges && (
                <div>
                  <p className="text-sm text-muted-foreground">Children Ages</p>
                  <p className="text-sm font-medium mt-1">
                    {booking.childrenAges.join(', ')} years
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold">{formatCurrency(booking.totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Markup ({Number(booking.markupPercentage).toFixed(1)}%)
                </p>
                <p className="text-lg font-semibold text-green-600">
                  +{formatCurrency(booking.profitAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(booking.taxAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Selling Price</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(booking.totalWithTax)}
                </p>
              </div>
            </div>

            {booking.discountAmount > 0 && (
              <div className="p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  Discount Applied: -{formatCurrency(booking.discountAmount)}
                </p>
              </div>
            )}

            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Deposit Paid</p>
                <p className="font-semibold">{formatCurrency(booking.paidAmount || 0)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className="font-semibold text-orange-600">
                  {formatCurrency(
                    booking.balanceAmount || booking.totalWithTax - (booking.paidAmount || 0)
                  )}
                </p>
              </div>
              {booking.paymentStatus && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge
                    variant={
                      booking.paymentStatus === 'PAID'
                        ? 'default'
                        : booking.paymentStatus === 'PARTIAL'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {booking.paymentStatus}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Quick Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{booking.services?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Services</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{booking.passengers?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Passengers</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{daysUntilTravel > 0 ? daysUntilTravel : 0}</p>
              <p className="text-sm text-muted-foreground">Days Until Departure</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{completionPercentage}%</p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact (if exists) */}
      {booking.emergencyContactName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{booking.emergencyContactName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.emergencyContactPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium">{booking.emergencyContactRelationship || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Requests & Notes */}
      {(booking.specialRequests || booking.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Notes & Special Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.specialRequests && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Special Requests</p>
                <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
                  {booking.specialRequests}
                </p>
              </div>
            )}
            {booking.internalNotes && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Internal Notes</p>
                <p className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  {booking.internalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
