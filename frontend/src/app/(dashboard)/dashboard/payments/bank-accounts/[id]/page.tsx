'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Building2, CreditCard, Star } from 'lucide-react';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { ACCOUNT_TYPES } from '@/lib/validations/bank-accounts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BankAccountDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const accountId = parseInt(resolvedParams.id);
  const { useBankAccount, deleteBankAccount } = useBankAccounts();
  const { data: account, isLoading } = useBankAccount(accountId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteBankAccount(accountId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/payments/bank-accounts');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Bank account not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accountType = ACCOUNT_TYPES.find(t => t.value === account.account_type);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{account.account_name}</h1>
              {account.is_default && <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />}
            </div>
            <p className="text-muted-foreground">Bank Account Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/payments/bank-accounts/${accountId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{account.bank_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <Badge variant="outline">{accountType?.label || account.account_type}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <Badge>{account.currency}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={account.is_active ? 'default' : 'secondary'}>
                {account.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-mono font-medium">{account.account_number}</p>
            </div>
            {account.iban && (
              <div>
                <p className="text-sm text-muted-foreground">IBAN</p>
                <p className="font-mono text-sm">{account.iban}</p>
              </div>
            )}
            {account.swift_code && (
              <div>
                <p className="text-sm text-muted-foreground">SWIFT Code</p>
                <p className="font-mono text-sm">{account.swift_code}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {account.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{account.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(account.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(account.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Bank Account"
        description="Are you sure you want to delete this bank account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
