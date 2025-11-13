'use client';
//ft

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  User,
  Heart,
  Utensils,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useB2BClients } from '@/hooks/use-b2b-clients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

export default function B2BClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = parseInt(params.id as string);
  const { useB2BClient, deleteB2BClient, isDeleting } = useB2BClients();
  const { data: client, isLoading } = useB2BClient(clientId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteB2BClient(clientId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/clients/b2b');
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">Client not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Destructure client data
  const clientData = client.data;
  if (!clientData) {
    return <div>Client not found</div>;
  }

  const creditUsagePercent = clientData.creditLimit
    ? (clientData.creditUsed / clientData.creditLimit) * 100
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{clientData.fullName}</h1>
              <StatusBadge status={clientData.isActive ? 'Active' : 'Inactive'} />
              {creditUsagePercent > 90 && <Badge variant="destructive">Credit Limit Alert</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {clientData.partnerCompanyName && `Partner: ${clientData.partnerCompanyName}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/clients/b2b/${clientId}/edit`)}
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
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientData.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{clientData.email}</p>
                </div>
              </div>
            )}
            {clientData.phone && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{clientData.phone}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientData.birthDate && (
              <div>
                <p className="font-medium">Birth Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(clientData.birthDate)}</p>
              </div>
            )}
            {clientData.nationality && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Nationality</p>
                  <p className="text-sm text-muted-foreground">{clientData.nationality}</p>
                </div>
              </>
            )}
            {clientData.passportNumber && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Passport Number</p>
                  <p className="text-sm text-muted-foreground">{clientData.passportNumber}</p>
                  {clientData.passportExpiryDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {formatDate(clientData.passportExpiryDate)}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {(clientData.address || clientData.city || clientData.country) && (
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{clientData.address}</p>
                    {(clientData.city || clientData.country) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[clientData.city, clientData.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(clientData.emergencyContactName || clientData.emergencyContactPhone) && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientData.emergencyContactName && (
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{clientData.emergencyContactName}</p>
                </div>
              )}
              {clientData.emergencyContactPhone && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {clientData.emergencyContactPhone}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {(clientData.dietaryRequirements ||
          clientData.accessibilityNeeds ||
          clientData.medicalConditions) && (
          <Card>
            <CardHeader>
              <CardTitle>Special Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientData.dietaryRequirements && (
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Dietary</p>
                    <p className="text-sm text-muted-foreground">{clientData.dietaryRequirements}</p>
                  </div>
                </div>
              )}
              {clientData.accessibilityNeeds && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Accessibility</p>
                    <p className="text-sm text-muted-foreground">{clientData.accessibilityNeeds}</p>
                  </div>
                </>
              )}
              {clientData.medicalConditions && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Medical</p>
                      <p className="text-sm text-muted-foreground">{clientData.medicalConditions}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientData.creditLimit && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Credit Limit</p>
                  <p className="text-sm text-muted-foreground">
                    Used: {clientData.creditUsed.toFixed(2)} / {clientData.creditLimit.toFixed(2)}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${creditUsagePercent > 90 ? 'bg-red-500' : creditUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {clientData.paymentTerms && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Payment Terms</p>
                  <p className="text-sm text-muted-foreground">{clientData.paymentTerms}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {clientData.specialNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{clientData.specialNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete B2B Client"
        description={`Are you sure you want to delete ${clientData.fullName}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
