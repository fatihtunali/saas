'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Users,
  MapPin,
  List,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTourCompanies } from '@/hooks/use-tour-companies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TourCompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tourCompanyId = parseInt(params.id as string);
  const { useTourCompany, deleteTourCompany, isDeleting } = useTourCompanies();
  const { data: tourCompany, isLoading } = useTourCompany(tourCompanyId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteTourCompany(tourCompanyId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/tour-companies');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tourCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Tour company not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{tourCompany.company_name}</h1>
              <StatusBadge status={tourCompany.is_active ? 'Active' : 'Inactive'} />
            </div>
            {tourCompany.tour_name && (
              <p className="text-muted-foreground mt-1">{tourCompany.tour_name}</p>
            )}
            <div className="flex gap-2 mt-2">
              {tourCompany.tour_type && <Badge variant="outline">{tourCompany.tour_type}</Badge>}
              {(tourCompany.duration_days || tourCompany.duration_hours) && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {tourCompany.duration_days && `${tourCompany.duration_days}d`}
                  {tourCompany.duration_days && tourCompany.duration_hours && ' '}
                  {tourCompany.duration_hours && `${tourCompany.duration_hours}h`}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/tour-companies/${tourCompanyId}/edit`)}
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

      {/* Tour Image */}
      {tourCompany.picture_url && (
        <Card>
          <CardContent className="p-0">
            <img
              src={tourCompany.picture_url}
              alt={tourCompany.tour_name || tourCompany.company_name}
              className="w-full h-80 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tourCompany.min_passengers && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Minimum Passengers</p>
                <p className="text-lg font-semibold">{tourCompany.min_passengers}</p>
              </div>
            )}
            {tourCompany.max_passengers && (
              <>
                {tourCompany.min_passengers && <Separator />}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Maximum Passengers</p>
                  <p className="text-lg font-semibold">{tourCompany.max_passengers}</p>
                </div>
              </>
            )}
            {tourCompany.current_bookings !== null && (
              <>
                {(tourCompany.min_passengers || tourCompany.max_passengers) && <Separator />}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Bookings</p>
                  <p className="text-lg font-semibold">{tourCompany.current_bookings}</p>
                </div>
              </>
            )}
            {!tourCompany.min_passengers &&
              !tourCompany.max_passengers &&
              tourCompany.current_bookings === null && (
                <p className="text-sm text-muted-foreground">No capacity information available</p>
              )}
          </CardContent>
        </Card>

        {/* SIC Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              SIC Pricing
            </CardTitle>
            <CardDescription>
              Seat-in-Coach pricing in {tourCompany.currency || 'TRY'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tourCompany.sic_price ? (
              <div>
                <p className="text-3xl font-bold text-primary">
                  {parseFloat(tourCompany.sic_price).toFixed(2)} {tourCompany.currency || 'TRY'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per person</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No SIC pricing available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Private Tour Pricing */}
      {(tourCompany.pvt_price_2_pax ||
        tourCompany.pvt_price_4_pax ||
        tourCompany.pvt_price_6_pax ||
        tourCompany.pvt_price_8_pax ||
        tourCompany.pvt_price_10_pax) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Private Tour Pricing
            </CardTitle>
            <CardDescription>Per vehicle rates in {tourCompany.currency || 'TRY'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number of Passengers</TableHead>
                  <TableHead className="text-right">Price per Vehicle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tourCompany.pvt_price_2_pax && (
                  <TableRow>
                    <TableCell className="font-medium">2 Passengers</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(tourCompany.pvt_price_2_pax).toFixed(2)}{' '}
                      {tourCompany.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {tourCompany.pvt_price_4_pax && (
                  <TableRow>
                    <TableCell className="font-medium">4 Passengers</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(tourCompany.pvt_price_4_pax).toFixed(2)}{' '}
                      {tourCompany.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {tourCompany.pvt_price_6_pax && (
                  <TableRow>
                    <TableCell className="font-medium">6 Passengers</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(tourCompany.pvt_price_6_pax).toFixed(2)}{' '}
                      {tourCompany.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {tourCompany.pvt_price_8_pax && (
                  <TableRow>
                    <TableCell className="font-medium">8 Passengers</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(tourCompany.pvt_price_8_pax).toFixed(2)}{' '}
                      {tourCompany.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {tourCompany.pvt_price_10_pax && (
                  <TableRow>
                    <TableCell className="font-medium">10 Passengers</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(tourCompany.pvt_price_10_pax).toFixed(2)}{' '}
                      {tourCompany.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Itinerary */}
      {tourCompany.itinerary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{tourCompany.itinerary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inclusions */}
        {tourCompany.inclusions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Inclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{tourCompany.inclusions}</p>
            </CardContent>
          </Card>
        )}

        {/* Exclusions */}
        {tourCompany.exclusions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{tourCompany.exclusions}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {tourCompany.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tourCompany.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/tour-companies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tour Companies List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tour Company"
        description="Are you sure you want to delete this tour company? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
