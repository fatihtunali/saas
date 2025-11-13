'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Trash2,
  DollarSign,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurants } from '@/hooks/use-restaurants';
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

export default function RestaurantDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = parseInt(params.id as string);
  const { useRestaurant, deleteRestaurant, isDeleting } = useRestaurants();
  const { data: restaurant, isLoading } = useRestaurant(restaurantId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteRestaurant(restaurantId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/restaurants');
  };

  // Parse JSON field if needed
  const parseCuisineTypes = (cuisineType: string | null): string[] => {
    if (!cuisineType) return [];
    try {
      const parsed = JSON.parse(cuisineType);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return cuisineType
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
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

  if (!restaurant) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Restaurant not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cuisineTypes = parseCuisineTypes(restaurant.cuisineType);

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
              <h1 className="text-3xl font-bold">{restaurant.restaurantName}</h1>
              <StatusBadge status={restaurant.isActive ? 'Active' : 'Inactive'} />
            </div>
            {cuisineTypes.length > 0 && (
              <div className="flex gap-2 mt-2">
                {cuisineTypes.map((type, index) => (
                  <Badge key={index} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/restaurants/${restaurantId}/edit`)}
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

      {/* Restaurant Image */}
      {restaurant.pictureUrl && (
        <Card>
          <CardContent className="p-0">
            <img
              src={restaurant.pictureUrl}
              alt={restaurant.restaurantName}
              className="w-full h-80 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {restaurant.cityName || 'N/A'}
                </p>
                {restaurant.address && (
                  <p className="text-sm text-muted-foreground mt-1">{restaurant.address}</p>
                )}
              </div>
            </div>

            {restaurant.phone && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                  </div>
                </div>
              </>
            )}

            {restaurant.capacity && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">{restaurant.capacity} persons</p>
                  </div>
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
            <CardDescription>Meal prices in {restaurant.currency || 'TRY'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurant.lunchPrice && (
                  <TableRow>
                    <TableCell className="font-medium">Lunch</TableCell>
                    <TableCell className="text-right">
                      {Number(restaurant.lunchPrice || 0).toFixed(2)} {restaurant.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {restaurant.dinnerPrice && (
                  <TableRow>
                    <TableCell className="font-medium">Dinner</TableCell>
                    <TableCell className="text-right">
                      {Number(restaurant.dinnerPrice || 0).toFixed(2)}{' '}
                      {restaurant.currency || 'TRY'}
                    </TableCell>
                  </TableRow>
                )}
                {!restaurant.lunchPrice && !restaurant.dinnerPrice && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No pricing information available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Menu Options */}
      {restaurant.menuOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Menu Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{restaurant.menuOptions}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {restaurant.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{restaurant.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/restaurants')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Restaurants List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Restaurant"
        description="Are you sure you want to delete this restaurant? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
