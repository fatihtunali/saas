'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Mail,
  Hotel,
  User,
  UtensilsCrossed,
  Ticket,
  Package,
  Car,
  Flag,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { useQuotation, useQuotationServices, useQuotations } from '@/hooks/use-quotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils/formatters';
import type { QuotationServiceType } from '@/types/quotations';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'viewed':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getServiceIcon = (type: QuotationServiceType) => {
  switch (type) {
    case 'hotel':
      return <Hotel className="h-4 w-4" />;
    case 'guide':
      return <User className="h-4 w-4" />;
    case 'restaurant':
      return <UtensilsCrossed className="h-4 w-4" />;
    case 'entrance_fee':
      return <Ticket className="h-4 w-4" />;
    case 'extra':
      return <Package className="h-4 w-4" />;
    case 'vehicle':
      return <Car className="h-4 w-4" />;
    case 'tour_company':
      return <Flag className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function QuotationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { quotation, isLoading: quotationLoading } = useQuotation(id);
  const { services, isLoading: servicesLoading } = useQuotationServices(id);
  const { deleteQuotation, isDeleting } = useQuotations();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleDelete = async () => {
    await deleteQuotation(id);
    setDeleteDialogOpen(false);
    router.push('/dashboard/quotations');
  };

  const handleConvertToBooking = async () => {
    try {
      setIsConverting(true);

      // Update quotation status to 'accepted' - backend will auto-create booking
      const response = await api.put(`/quotations/${id}`, {
        status: 'accepted'
      });

      console.log('Convert response:', response);

      // Response is the quotation object directly (not wrapped in .data)
      if (response?.booking_created && response?.booking_id) {
        toast.success(`Booking created successfully! Redirecting to booking...`);
        setConvertDialogOpen(false);

        // Redirect to the new booking page
        setTimeout(() => {
          router.push(`/dashboard/bookings/${response.booking_id}`);
        }, 1500);
      } else {
        toast.error('Failed to create booking from quotation');
      }
    } catch (error: any) {
      console.error('Error converting quotation to booking:', error);
      toast.error(error.response?.data?.error || 'Failed to convert quotation to booking');
    } finally {
      setIsConverting(false);
    }
  };

  if (quotationLoading || servicesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Quotation not found</h3>
          <Button className="mt-4" onClick={() => router.push('/dashboard/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  const totalServices = services.reduce(
    (sum, service) => sum + (Number(service.totalPrice) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quotation.quotationCode || `Q-${quotation.id}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              Quotation details and services
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {quotation.status === 'accepted' && !quotation.convertedToBookingId && (
            <Button
              onClick={() => setConvertDialogOpen(true)}
              disabled={isConverting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Convert to Booking
            </Button>
          )}
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/quotations/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quotation Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
            <CardDescription>Basic quotation information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`mt-1 ${getStatusColor(quotation.status)}`}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p className="mt-1">{quotation.currency || 'EUR'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Travel Dates</p>
                <p className="mt-1">
                  {formatDate(quotation.travelDatesFrom)} - {formatDate(quotation.travelDatesTo)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passengers</p>
                <p className="mt-1">{quotation.numPassengers || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                <p className="mt-1">
                  {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="mt-1 text-lg font-semibold">
                  {quotation.totalAmount
                    ? `${Number(quotation.totalAmount).toFixed(2)} ${quotation.currency || 'EUR'}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {quotation.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client Notes</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              </>
            )}

            {quotation.internalNotes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Internal Notes</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap bg-yellow-50 p-3 rounded-md">
                    {quotation.internalNotes}
                  </p>
                </div>
              </>
            )}

            {quotation.convertedToBookingId && (
              <>
                <Separator />
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Converted to Booking
                  </p>
                  <Link
                    href={`/dashboard/bookings/${quotation.convertedToBookingId}`}
                    className="text-sm text-green-700 hover:text-green-900 underline"
                  >
                    View Booking #{quotation.convertedToBookingId}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Details about the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Name</p>
              <p className="mt-1">
                {quotation.clientName || quotation.operatorClientName || 'N/A'}
              </p>
            </div>
            {quotation.clientEmail && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1">{quotation.clientEmail}</p>
              </div>
            )}
            {quotation.clientPhone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1">{quotation.clientPhone}</p>
              </div>
            )}
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Created: {formatDate(quotation.createdAt)}</p>
              <p>Last Updated: {formatDate(quotation.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            {services.length} service{services.length !== 1 ? 's' : ''} included in this quotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No services added to this quotation yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getServiceIcon(service.serviceType)}
                        <span className="capitalize">
                          {service.serviceType.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{service.serviceDescription || 'N/A'}</TableCell>
                    <TableCell>
                      {service.serviceDate ? formatDate(service.serviceDate) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">{service.quantity || '-'}</TableCell>
                    <TableCell className="text-right">
                      {service.unitPrice
                        ? `${Number(service.unitPrice).toFixed(2)} ${service.currency || quotation.currency || 'EUR'}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {service.totalPrice
                        ? `${Number(service.totalPrice).toFixed(2)} ${service.currency || quotation.currency || 'EUR'}`
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-semibold">
                    Total Services:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {totalServices.toFixed(2)} {quotation.currency || 'EUR'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Quotation"
        description={`Are you sure you want to delete quotation ${quotation.quotationCode || `Q-${quotation.id}`}? This action cannot be undone and will also delete all associated services.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Convert to Booking Confirmation Dialog */}
      <ConfirmDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        title="Convert to Booking"
        description={`Are you sure you want to convert quotation ${quotation.quotationCode || `Q-${quotation.id}`} to a booking? This will create a new confirmed booking with all services from this quotation.`}
        confirmText="Convert to Booking"
        cancelText="Cancel"
        onConfirm={handleConvertToBooking}
        variant="default"
      />
    </div>
  );
}
