'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Phone, Mail, User, Trash2 } from 'lucide-react';
import { useVehicleCompanies } from '@/hooks/use-vehicle-companies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function VehicleCompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const { useVehicleCompany, deleteVehicleCompany, isDeleting } = useVehicleCompanies();
  const { data: company, isLoading } = useVehicleCompany(companyId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteVehicleCompany(companyId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/services/vehicle-companies');
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
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <StatusBadge status={company.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-muted-foreground mt-1">Vehicle Company Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/vehicle-companies/${companyId}/edit`)}
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

      {/* Contact Information */}
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

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/services/vehicle-companies')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicle Companies List
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle Company"
        description="Are you sure you want to delete this vehicle company? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
