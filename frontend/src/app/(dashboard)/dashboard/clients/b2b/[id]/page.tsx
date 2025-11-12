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

  const creditUsagePercent = client.credit_limit
    ? (client.credit_used / client.credit_limit) * 100
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
              <h1 className="text-3xl font-bold">{client.full_name}</h1>
              <StatusBadge status={client.is_active ? 'Active' : 'Inactive'} />
              {creditUsagePercent > 90 && <Badge variant="destructive">Credit Limit Alert</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {client.partner_company_name && `Partner: ${client.partner_company_name}`}
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
            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>
            )}
            {client.phone && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
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
            {client.birth_date && (
              <div>
                <p className="font-medium">Birth Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(client.birth_date)}</p>
              </div>
            )}
            {client.nationality && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Nationality</p>
                  <p className="text-sm text-muted-foreground">{client.nationality}</p>
                </div>
              </>
            )}
            {client.passport_number && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Passport Number</p>
                  <p className="text-sm text-muted-foreground">{client.passport_number}</p>
                  {client.passport_expiry_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {formatDate(client.passport_expiry_date)}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {(client.address || client.city || client.country) && (
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{client.address}</p>
                    {(client.city || client.country) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[client.city, client.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(client.emergency_contact_name || client.emergency_contact_phone) && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.emergency_contact_name && (
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{client.emergency_contact_name}</p>
                </div>
              )}
              {client.emergency_contact_phone && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {client.emergency_contact_phone}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {(client.dietary_requirements ||
          client.accessibility_needs ||
          client.medical_conditions) && (
          <Card>
            <CardHeader>
              <CardTitle>Special Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.dietary_requirements && (
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Dietary</p>
                    <p className="text-sm text-muted-foreground">{client.dietary_requirements}</p>
                  </div>
                </div>
              )}
              {client.accessibility_needs && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">Accessibility</p>
                    <p className="text-sm text-muted-foreground">{client.accessibility_needs}</p>
                  </div>
                </>
              )}
              {client.medical_conditions && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Medical</p>
                      <p className="text-sm text-muted-foreground">{client.medical_conditions}</p>
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
            {client.credit_limit && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Credit Limit</p>
                  <p className="text-sm text-muted-foreground">
                    Used: {client.credit_used.toFixed(2)} / {client.credit_limit.toFixed(2)}
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
            {client.payment_terms && (
              <>
                <Separator />
                <div>
                  <p className="font-medium">Payment Terms</p>
                  <p className="text-sm text-muted-foreground">{client.payment_terms}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {client.special_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{client.special_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete B2B Client"
        description={`Are you sure you want to delete ${client.full_name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
