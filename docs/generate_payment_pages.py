#!/usr/bin/env python3
"""
Generate remaining payment module pages for Phase 7
This script creates Supplier Payments, Refunds, and Commissions modules
"""

import os

BASE_DIR = r"C:\Users\fatih\Desktop\CRM\frontend\src\app\(dashboard)\dashboard\payments"

# Templates for each page type
TEMPLATES = {
    "supplier_list": """'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { SupplierPayment } from '@/types/payments';
import { useSupplierPayments } from '@/hooks/use-supplier-payments';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentStatusBadge } from '@/components/features/payments/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/components/features/payments/PaymentMethodBadge';
import { CurrencyDisplay } from '@/components/features/payments/CurrencyDisplay';
import { SUPPLIER_PAYMENT_STATUSES, PAYMENT_METHODS } from '@/lib/validations/supplier-payments';

export default function SupplierPaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const queryParams = { page, limit: pageSize, search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined };
  const { supplierPayments, pagination, isLoading, deleteSupplierPayment } = useSupplierPayments(queryParams);

  const handleDelete = async () => {
    if (paymentToDelete) {
      await deleteSupplierPayment(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const columns: ColumnDef<SupplierPayment>[] = [
    { accessorKey: 'booking_id', header: 'Booking ID', cell: ({ row }) => <span className="font-mono">#{row.original.booking_id}</span> },
    { accessorKey: 'supplier_id', header: 'Supplier ID', cell: ({ row }) => <span>#{row.original.supplier_id}</span> },
    { accessorKey: 'due_date', header: 'Due Date', cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString() },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} currency={row.original.currency} /> },
    { accessorKey: 'payment_method', header: 'Method', cell: ({ row }) => <PaymentMethodBadge method={row.original.payment_method} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <PaymentStatusBadge status={row.original.status} type="supplier" /> },
    {
      id: 'actions', header: 'Actions', cell: ({ row }) => {
        const payment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/dashboard/payments/payables/${payment.id}`)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/payments/payables/${payment.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => { setPaymentToDelete(payment.id); setDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Supplier Payments (Payables)</CardTitle><CardDescription>Track and manage outgoing payments to suppliers</CardDescription></div>
            <Button onClick={() => router.push('/dashboard/payments/payables/create')}><Plus className="mr-2 h-4 w-4" />Schedule Payment</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {SUPPLIER_PAYMENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }} className="w-full">Clear Filters</Button>
          </div>
          <DataTable columns={columns} data={supplierPayments} isLoading={isLoading} pagination={{ pageIndex: page - 1, pageSize }} onPaginationChange={(updater) => { if (typeof updater === 'function') { const newState = updater({ pageIndex: page - 1, pageSize }); setPage(newState.pageIndex + 1); setPageSize(newState.pageSize); } }} totalRows={pagination?.total || 0} manualPagination />
        </CardContent>
      </Card>
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Payment" description="Are you sure you want to delete this payment record?" confirmText="Delete" onConfirm={handleDelete} variant="destructive" />
    </div>
  );
}
""",
    "supplier_create": """'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { supplierPaymentSchema, defaultSupplierPaymentValues, CURRENCIES, PAYMENT_METHODS, SUPPLIER_PAYMENT_STATUSES, SupplierPaymentFormData } from '@/lib/validations/supplier-payments';
import { useSupplierPayments } from '@/hooks/use-supplier-payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExchangeRateCalculator } from '@/components/features/payments/ExchangeRateCalculator';

export default function CreateSupplierPaymentPage() {
  const router = useRouter();
  const { createSupplierPayment, isCreating } = useSupplierPayments();
  const form = useForm({ resolver: zodResolver(supplierPaymentSchema) as any, defaultValues: defaultSupplierPaymentValues });

  const onSubmit = async (data: SupplierPaymentFormData) => {
    try {
      const processedData = { ...data, payment_date: data.payment_date || undefined, booking_service_id: data.booking_service_id || undefined, payment_reference: data.payment_reference || undefined, bank_account_id: data.bank_account_id || undefined, notes: data.notes || undefined, paid_by: data.paid_by || undefined };
      await createSupplierPayment(processedData);
      router.push('/dashboard/payments/payables');
    } catch (error) { console.error('Failed to create payment:', error); }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-3xl font-bold">Schedule Supplier Payment</h1><p className="text-muted-foreground">Create a new payment to supplier</p></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="booking_id" render={({ field }) => (<FormItem><FormLabel>Booking ID *</FormLabel><FormControl><Input type="number" placeholder="Enter booking ID" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="supplier_id" render={({ field }) => (<FormItem><FormLabel>Supplier ID *</FormLabel><FormControl><Input type="number" placeholder="Enter supplier ID" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="due_date" render={({ field }) => (<FormItem><FormLabel>Due Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="payment_date" render={({ field }) => (<FormItem><FormLabel>Payment Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="payment_method" render={({ field }) => (<FormItem><FormLabel>Payment Method *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{SUPPLIER_PAYMENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          <ExchangeRateCalculator form={form} amountField="amount" currencyField="currency" exchangeRateField="exchange_rate" baseAmountField="amount_in_base_currency" />
          <Card>
            <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="payment_reference" render={({ field }) => (<FormItem><FormLabel>Payment Reference</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="paid_by" render={({ field }) => (<FormItem><FormLabel>Paid By</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={3} {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isCreating}>Cancel</Button>
            <Button type="submit" disabled={isCreating}><Save className="mr-2 h-4 w-4" />{isCreating ? 'Creating...' : 'Create Payment'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
"""
}

# Create Supplier Payments pages
def create_supplier_pages():
    os.makedirs(f"{BASE_DIR}/payables/[id]", exist_ok=True)
    os.makedirs(f"{BASE_DIR}/payables/create", exist_ok=True)

    # List page
    with open(f"{BASE_DIR}/payables/page.tsx", 'w', encoding='utf-8') as f:
        f.write(TEMPLATES["supplier_list"])

    # Create page
    with open(f"{BASE_DIR}/payables/create/page.tsx", 'w', encoding='utf-8') as f:
        f.write(TEMPLATES["supplier_create"])

    print("✓ Created Supplier Payments pages (list, create)")

if __name__ == "__main__":
    create_supplier_pages()
    print("Phase 7 pages generation complete!")
