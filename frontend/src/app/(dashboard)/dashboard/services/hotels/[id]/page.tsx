'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Trash2,
  UtensilsCrossed,
  Bed,
  Users,
} from 'lucide-react';
import { useHotels } from '@/hooks/use-hotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMealPlan } from '@/lib/validations/hotels';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HotelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = parseInt(params.id as string);
  const { useHotel, deleteHotel, isDeleting } = useHotels();
  const { data: hotel, isLoading } = useHotel(hotelId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteHotel(hotelId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/hotels');
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

  if (!hotel) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Hotel not found</p>
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
              <h1 className="text-3xl font-bold">{hotel.hotelName}</h1>
              <StatusBadge status={hotel.isActive ? 'Active' : 'Inactive'} />
            </div>
            {hotel.starRating && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: Number(hotel.starRating || 0) }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/hotels/${hotelId}/edit`)}
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

      {/* Hotel Image */}
      {hotel.pictureUrl && (
        <Card>
          <CardContent className="p-0">
            <img
              src={hotel.pictureUrl}
              alt={hotel.hotelName}
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
                <p className="text-sm text-muted-foreground">{hotel.cityName || 'N/A'}</p>
                {hotel.address && (
                  <p className="text-sm text-muted-foreground mt-1">{hotel.address}</p>
                )}
              </div>
            </div>

            <Separator />

            {hotel.phone && (
              <>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{hotel.phone}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {hotel.email && (
              <>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{hotel.email}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {hotel.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Website</p>
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {hotel.website}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meal Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hotel.mealPlan ? (
              <>
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Meal Plan Type</p>
                    <Badge variant="outline" className="mt-1">
                      {formatMealPlan(hotel.mealPlan)}
                    </Badge>
                  </div>
                </div>

                {hotel.mealPlanSupplement && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium">Meal Plan Supplement</p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        {Number(hotel.mealPlanSupplement || 0).toFixed(2)}{' '}
                        {hotel.currency || 'TRY'} / person
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Additional cost per person for meal plan upgrade
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No meal plan information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Pricing Information
          </CardTitle>
          <CardDescription>Per-person rates in {hotel.currency || 'TRY'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Type</TableHead>
                <TableHead className="text-right">Price per Person</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotel.pricePerPersonDouble && (
                <TableRow>
                  <TableCell className="font-medium">Per person in a double room</TableCell>
                  <TableCell className="text-right">
                    {Number(hotel.pricePerPersonDouble).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.singleSupplement && (
                <TableRow>
                  <TableCell className="font-medium">Single Supplement</TableCell>
                  <TableCell className="text-right">
                    +{Number(hotel.singleSupplement).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.pricePerPersonTriple && (
                <TableRow>
                  <TableCell className="font-medium">Per person in a triple room</TableCell>
                  <TableCell className="text-right">
                    {Number(hotel.pricePerPersonTriple).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {(hotel.childPrice02 || hotel.childPrice35 || hotel.childPrice611) && (
                <TableRow>
                  <TableCell colSpan={2} className="bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">Child Pricing</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {hotel.childPrice02 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (0-2 years)</TableCell>
                  <TableCell className="text-right">
                    {Number(hotel.childPrice02 || 0).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.childPrice35 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (3-5 years)</TableCell>
                  <TableCell className="text-right">
                    {Number(hotel.childPrice35 || 0).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.childPrice611 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (6-11 years)</TableCell>
                  <TableCell className="text-right">
                    {Number(hotel.childPrice611 || 0).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Facilities */}
      {hotel.facilities && (
        <Card>
          <CardHeader>
            <CardTitle>Facilities & Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{hotel.facilities}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {hotel.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hotel.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/hotels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hotels List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Hotel"
        description="Are you sure you want to delete this hotel? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
