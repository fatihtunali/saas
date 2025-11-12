'use client';
//ft

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useClientPayments } from '@/hooks/use-client-payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { PaymentStatusBadge } from '@/components/features/payments/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/components/features/payments/PaymentMethodBadge';
import { MultiCurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientPaymentDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const paymentId = parseInt(resolvedParams.id);
  const { useClientPayment, deleteClientPayment } = useClientPayments();
  const { data: payment, isLoading } = useClientPayment(paymentId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteClientPayment(paymentId);
    setDeleteDialogOpen(false);
    router.push('/dashboard/payments/receivables');
  };

  if (isLoading)
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  if (!payment)
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Payment not found</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payment #{payment.id}</h1>
            <p className="text-muted-foreground">Client Payment Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/payments/receivables/${paymentId}/edit`)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-mono font-medium">#{payment.booking_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Date</p>
              <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <MultiCurrencyDisplay
                amount={payment.amount}
                currency={payment.currency}
                baseAmount={payment.amount_in_base_currency}
                exchangeRate={payment.exchange_rate}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <PaymentMethodBadge method={payment.payment_method} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <PaymentStatusBadge status={payment.status} type="client" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.payment_reference && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-sm">{payment.payment_reference}</p>
              </div>
            )}
            {payment.received_by && (
              <div>
                <p className="text-sm text-muted-foreground">Received By</p>
                <p>{payment.received_by}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(payment.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(payment.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record?"
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
