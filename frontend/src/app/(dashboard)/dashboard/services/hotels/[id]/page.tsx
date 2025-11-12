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
              <h1 className="text-3xl font-bold">{hotel.hotel_name}</h1>
              <StatusBadge status={hotel.is_active ? 'Active' : 'Inactive'} />
            </div>
            {hotel.star_rating && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: parseInt(hotel.star_rating) }).map((_, i) => (
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
      {hotel.picture_url && (
        <Card>
          <CardContent className="p-0">
            <img
              src={hotel.picture_url}
              alt={hotel.hotel_name}
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
                <p className="text-sm text-muted-foreground">{hotel.city?.city_name || 'N/A'}</p>
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
            {hotel.meal_plan ? (
              <>
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Meal Plan Type</p>
                    <Badge variant="outline" className="mt-1">
                      {hotel.meal_plan}
                    </Badge>
                  </div>
                </div>

                {hotel.meal_plan_supplement && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium">Meal Plan Supplement</p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        {parseFloat(hotel.meal_plan_supplement).toFixed(2)}{' '}
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
              {hotel.price_per_person_double && (
                <TableRow>
                  <TableCell className="font-medium">Double Room</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(hotel.price_per_person_double).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.single_supplement && (
                <TableRow>
                  <TableCell className="font-medium">Single Supplement</TableCell>
                  <TableCell className="text-right">
                    +{parseFloat(hotel.single_supplement).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.price_per_person_triple && (
                <TableRow>
                  <TableCell className="font-medium">Triple Room</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(hotel.price_per_person_triple).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {(hotel.child_price_0_2 || hotel.child_price_3_5 || hotel.child_price_6_11) && (
                <TableRow>
                  <TableCell colSpan={2} className="bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">Child Pricing</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {hotel.child_price_0_2 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (0-2 years)</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(hotel.child_price_0_2).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.child_price_3_5 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (3-5 years)</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(hotel.child_price_3_5).toFixed(2)} {hotel.currency || 'TRY'}
                  </TableCell>
                </TableRow>
              )}
              {hotel.child_price_6_11 !== null && (
                <TableRow>
                  <TableCell className="pl-8">Child (6-11 years)</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(hotel.child_price_6_11).toFixed(2)} {hotel.currency || 'TRY'}
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
