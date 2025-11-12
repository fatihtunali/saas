'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, DollarSign, Clock, Car, Navigation2, Timer } from 'lucide-react';
import { useVehicleRentals } from '@/hooks/use-vehicle-rentals';
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

export default function VehicleRentalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rentalId = parseInt(params.id as string);
  const { useVehicleRental, deleteVehicleRental, isDeleting } = useVehicleRentals();
  const { data: rental, isLoading } = useVehicleRental(rentalId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteVehicleRental(rentalId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/vehicle-rentals');
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

  if (!rental) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Vehicle rental not found</p>
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
              <h1 className="text-3xl font-bold">Vehicle Rental #{rental.id}</h1>
              <StatusBadge status={rental.is_active ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-muted-foreground mt-1">Rental Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/vehicle-rentals/${rentalId}/edit`)}
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

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rental.vehicle_company && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vehicle Company</p>
              <Badge variant="secondary" className="text-base py-1 px-3">
                {rental.vehicle_company.company_name}
              </Badge>
            </div>
          )}
          {rental.vehicle_type && rental.vehicle_company && <Separator />}
          {rental.vehicle_type && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
              <Badge variant="outline" className="text-base py-1 px-3">
                {rental.vehicle_type.vehicle_type}
              </Badge>
            </div>
          )}
          {!rental.vehicle_company && !rental.vehicle_type && (
            <p className="text-sm text-muted-foreground">No vehicle information available</p>
          )}
        </CardContent>
      </Card>

      {/* Rental Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Rental Pricing
          </CardTitle>
          <CardDescription>Rates in {rental.currency || 'TRY'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rental.full_day_price && (
                <TableRow>
                  <TableCell className="font-medium">Full Day</TableCell>
                  <TableCell>{rental.full_day_hours ? `${rental.full_day_hours}h` : '-'}</TableCell>
                  <TableCell>{rental.full_day_km ? `${rental.full_day_km} km` : '-'}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(rental.full_day_price).toFixed(2)} {rental.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {rental.half_day_price && (
                <TableRow>
                  <TableCell className="font-medium">Half Day</TableCell>
                  <TableCell>{rental.half_day_hours ? `${rental.half_day_hours}h` : '-'}</TableCell>
                  <TableCell>{rental.half_day_km ? `${rental.half_day_km} km` : '-'}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(rental.half_day_price).toFixed(2)} {rental.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {rental.night_rental_price && (
                <TableRow>
                  <TableCell className="font-medium">Night Rental</TableCell>
                  <TableCell>
                    {rental.night_rental_hours ? `${rental.night_rental_hours}h` : '-'}
                  </TableCell>
                  <TableCell>
                    {rental.night_rental_km ? `${rental.night_rental_km} km` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {parseFloat(rental.night_rental_price).toFixed(2)} {rental.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {!rental.full_day_price && !rental.half_day_price && !rental.night_rental_price && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No rental pricing available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Extra Charges */}
      {(rental.extra_hour_rate || rental.extra_km_rate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Extra Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rental.extra_hour_rate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Extra Hour Rate</span>
                </div>
                <span className="font-semibold">
                  {parseFloat(rental.extra_hour_rate).toFixed(2)} {rental.currency || 'TRY'} / hour
                </span>
              </div>
            )}
            {rental.extra_hour_rate && rental.extra_km_rate && <Separator />}
            {rental.extra_km_rate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Extra Kilometer Rate</span>
                </div>
                <span className="font-semibold">
                  {parseFloat(rental.extra_km_rate).toFixed(2)} {rental.currency || 'TRY'} / km
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {rental.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rental.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/services/vehicle-rentals')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicle Rentals List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle Rental"
        description="Are you sure you want to delete this vehicle rental? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
