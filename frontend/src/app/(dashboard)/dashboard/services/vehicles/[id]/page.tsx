'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  User,
  Car,
  Users,
  Briefcase,
  Plus,
  DollarSign,
  Navigation2,
  Clock,
} from 'lucide-react';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { useVehicleTypes } from '@/hooks/use-vehicle-types';
import { useVehicleRentals } from '@/hooks/use-vehicle-rentals';
import { useTransferRoutes } from '@/hooks/use-transfer-routes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AddVehicleTypeModal } from '@/components/modals/AddVehicleTypeModal';
import { AddRentalPricingModal } from '@/components/modals/AddRentalPricingModal';
import { AddTransferRouteModal } from '@/components/modals/AddTransferRouteModal';

export default function VehicleCompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const { useVehicleCompany, deleteVehicleCompany, isDeleting } = useVehicleCompanies();
  const { data: company, isLoading: isLoadingCompany } = useVehicleCompany(companyId);

  // Fetch all vehicle types for this company
  const { vehicleTypes, isLoading: isLoadingTypes, refetch: refetchTypes } = useVehicleTypes({
    vehicleCompanyId: companyId,
    limit: 100,
  });

  // Fetch all rentals for this company
  const { vehicleRentals, isLoading: isLoadingRentals, refetch: refetchRentals } = useVehicleRentals({
    vehicleCompanyId: companyId,
    limit: 100,
  });

  // Fetch all transfer routes for this company
  const { transferRoutes, isLoading: isLoadingRoutes, refetch: refetchRoutes } = useTransferRoutes({
    vehicleCompanyId: companyId,
    limit: 100,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addVehicleTypeModalOpen, setAddVehicleTypeModalOpen] = useState(false);
  const [addRentalModalOpen, setAddRentalModalOpen] = useState(false);
  const [addRouteModalOpen, setAddRouteModalOpen] = useState(false);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<number | null>(null);

  const handleDelete = async () => {
    await deleteVehicleCompany(companyId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/vehicles');
  };

  const handleAddVehicleTypeSuccess = () => {
    refetchTypes();
  };

  const handleAddRentalSuccess = () => {
    refetchRentals();
  };

  const handleAddRouteSuccess = () => {
    refetchRoutes();
  };

  const openAddRentalModal = (vehicleTypeId: number) => {
    setSelectedVehicleTypeId(vehicleTypeId);
    setAddRentalModalOpen(true);
  };

  const openAddRouteModal = (vehicleTypeId: number) => {
    setSelectedVehicleTypeId(vehicleTypeId);
    setAddRouteModalOpen(true);
  };

  if (isLoadingCompany || isLoadingTypes || isLoadingRentals || isLoadingRoutes) {
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

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Vehicle company not found</p>
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
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <StatusBadge status={company.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-muted-foreground mt-1">Vehicle Company Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => alert('Edit company feature coming soon')}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Company
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

      {/* Company Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.contactPerson && (
            <>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Contact Person</p>
                  <p className="text-sm text-muted-foreground">{company.contactPerson}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {company.phone && (
            <>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{company.phone}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {company.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{company.email}</p>
              </div>
            </div>
          )}

          {!company.contactPerson && !company.phone && !company.email && (
            <p className="text-sm text-muted-foreground">No contact information available</p>
          )}
        </CardContent>
      </Card>

      {/* Fleet & Pricing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Fleet & Pricing
              </CardTitle>
              <CardDescription>
                Vehicle types, rental rates, and transfer routes
              </CardDescription>
            </div>
            <Button onClick={() => setAddVehicleTypeModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vehicleTypes && vehicleTypes.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {vehicleTypes.map((vehicleType: any) => {
                // Find rental pricing for this vehicle type
                const rental = vehicleRentals?.find(
                  (r: any) => r.vehicleTypeId === vehicleType.id
                );

                return (
                  <AccordionItem key={vehicleType.id} value={`vehicle-${vehicleType.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">{vehicleType.vehicleType}</span>
                          {vehicleType.capacity && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {vehicleType.capacity} pax
                            </Badge>
                          )}
                          {vehicleType.luggageCapacity && (
                            <Badge variant="outline">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {vehicleType.luggageCapacity} luggage
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {/* Vehicle Specifications */}
                        {vehicleType.notes && (
                          <div className="pl-8">
                            <p className="text-sm font-medium mb-1">Notes</p>
                            <p className="text-sm text-muted-foreground">{vehicleType.notes}</p>
                          </div>
                        )}

                        {/* Rental Pricing */}
                        {rental ? (
                          <div className="pl-8 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Rental Pricing
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openAddRentalModal(vehicleType.id)}
                                title="Edit rental pricing"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {rental.fullDayPrice && (
                                <Card>
                                  <CardContent className="pt-4 pb-3">
                                    <p className="text-xs text-muted-foreground">Full Day</p>
                                    <p className="text-lg font-bold">
                                      {Number(rental.fullDayPrice).toFixed(2)} {rental.currency}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {rental.fullDayHours}hrs • {rental.fullDayKm}km
                                    </p>
                                  </CardContent>
                                </Card>
                              )}
                              {rental.halfDayPrice && (
                                <Card>
                                  <CardContent className="pt-4 pb-3">
                                    <p className="text-xs text-muted-foreground">Half Day</p>
                                    <p className="text-lg font-bold">
                                      {Number(rental.halfDayPrice).toFixed(2)} {rental.currency}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {rental.halfDayHours}hrs • {rental.halfDayKm}km
                                    </p>
                                  </CardContent>
                                </Card>
                              )}
                              {rental.nightRentalPrice && (
                                <Card>
                                  <CardContent className="pt-4 pb-3">
                                    <p className="text-xs text-muted-foreground">Night Rental</p>
                                    <p className="text-lg font-bold">
                                      {Number(rental.nightRentalPrice).toFixed(2)}{' '}
                                      {rental.currency}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {rental.nightRentalHours}hrs • {rental.nightRentalKm}km
                                    </p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                            {(rental.extraHourRate || rental.extraKmRate) && (
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {rental.extraHourRate && (
                                  <span>
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    Extra Hour: {Number(rental.extraHourRate).toFixed(2)}{' '}
                                    {rental.currency}
                                  </span>
                                )}
                                {rental.extraKmRate && (
                                  <span>
                                    <Navigation2 className="inline h-3 w-3 mr-1" />
                                    Extra KM: {Number(rental.extraKmRate).toFixed(2)}{' '}
                                    {rental.currency}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="pl-8">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddRentalModal(vehicleType.id)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Rental Pricing
                            </Button>
                          </div>
                        )}

                        {/* Transfer Routes */}
                        <div className="pl-8 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Navigation2 className="h-4 w-4" />
                              Transfer Routes
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddRouteModal(vehicleType.id)}
                              title="Add transfer route"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {(() => {
                            // Filter routes for this vehicle type
                            const vehicleRoutes = transferRoutes?.filter(
                              (route: any) => route.vehicleTypeId === vehicleType.id
                            );

                            return vehicleRoutes && vehicleRoutes.length > 0 ? (
                              <div className="space-y-2">
                                {vehicleRoutes.map((route: any) => (
                                  <Card key={route.id} className="border-l-4 border-l-primary/20">
                                    <CardContent className="pt-3 pb-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Navigation2 className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-sm">
                                              {route.fromCity?.name || 'Unknown'} → {route.toCity?.name || 'Unknown'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {route.distanceKm && (
                                              <span>{route.distanceKm} km</span>
                                            )}
                                            {route.durationHours && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {route.durationHours}h
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-primary">
                                            {route.pricePerVehicle ? Number(route.pricePerVehicle).toFixed(2) : '0.00'} {route.currency || 'EUR'}
                                          </p>
                                          <p className="text-xs text-muted-foreground">per vehicle</p>
                                        </div>
                                      </div>
                                      {route.notes && (
                                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                          {route.notes}
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                No transfer routes configured for this vehicle type
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No vehicle types added yet for this company
              </p>
              <Button onClick={() => setAddVehicleTypeModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/dashboard/services/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle Company"
        description="Are you sure you want to delete this vehicle company? This action cannot be undone and will remove all associated vehicle types, rentals, and transfer routes."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Add Vehicle Type Modal */}
      <AddVehicleTypeModal
        open={addVehicleTypeModalOpen}
        onOpenChange={setAddVehicleTypeModalOpen}
        vehicleCompanyId={companyId}
        onSuccess={handleAddVehicleTypeSuccess}
      />

      {/* Add Rental Pricing Modal */}
      {selectedVehicleTypeId && (
        <AddRentalPricingModal
          open={addRentalModalOpen}
          onOpenChange={setAddRentalModalOpen}
          vehicleCompanyId={companyId}
          vehicleTypeId={selectedVehicleTypeId}
          onSuccess={handleAddRentalSuccess}
        />
      )}

      {/* Add Transfer Route Modal */}
      {selectedVehicleTypeId && (
        <AddTransferRouteModal
          open={addRouteModalOpen}
          onOpenChange={setAddRouteModalOpen}
          vehicleCompanyId={companyId}
          vehicleTypeId={selectedVehicleTypeId}
          onSuccess={handleAddRouteSuccess}
        />
      )}
    </div>
  );
}
