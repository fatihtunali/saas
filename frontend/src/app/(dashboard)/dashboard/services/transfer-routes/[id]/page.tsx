'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, DollarSign, MapPin, Clock, Car, Navigation } from 'lucide-react';
import { useTransferRoutes } from '@/hooks/use-transfer-routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransferRouteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = parseInt(params.id as string);
  const { useTransferRoute, deleteTransferRoute, isDeleting } = useTransferRoutes();
  const { data: route, isLoading } = useTransferRoute(routeId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteTransferRoute(routeId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/transfer-routes');
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

  if (!route) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Transfer route not found</p>
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
              <h1 className="text-3xl font-bold">Transfer Route #{route.id}</h1>
              <StatusBadge status={route.is_active ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-muted-foreground mt-1">Route Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/transfer-routes/${routeId}/edit`)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-2">From</p>
                <Badge variant="outline" className="text-base py-1 px-3">
                  {route.from_city?.city_name || 'N/A'}
                </Badge>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowLeft className="h-6 w-6 rotate-180 text-primary" />
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-2">To</p>
                <Badge variant="outline" className="text-base py-1 px-3">
                  {route.to_city?.city_name || 'N/A'}
                </Badge>
              </div>
            </div>

            {route.distance_km && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-semibold">{route.distance_km} km</span>
                </div>
              </>
            )}

            {route.duration_hours && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-semibold">{route.duration_hours} hours</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
            <CardDescription>Price in {route.currency || 'TRY'}</CardDescription>
          </CardHeader>
          <CardContent>
            {route.price_per_vehicle ? (
              <div>
                <p className="text-3xl font-bold text-primary">
                  {parseFloat(route.price_per_vehicle).toFixed(2)} {route.currency || 'TRY'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per vehicle</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pricing information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Company & Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {route.vehicle_company && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vehicle Company</p>
              <Badge variant="secondary" className="text-base py-1 px-3">
                {route.vehicle_company.company_name}
              </Badge>
            </div>
          )}
          {route.vehicle_type && route.vehicle_company && <Separator />}
          {route.vehicle_type && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
              <Badge variant="outline" className="text-base py-1 px-3">
                {route.vehicle_type.vehicle_type}
              </Badge>
            </div>
          )}
          {!route.vehicle_company && !route.vehicle_type && (
            <p className="text-sm text-muted-foreground">No vehicle information available</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {route.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{route.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/services/transfer-routes')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transfer Routes List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transfer Route"
        description="Are you sure you want to delete this transfer route? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
