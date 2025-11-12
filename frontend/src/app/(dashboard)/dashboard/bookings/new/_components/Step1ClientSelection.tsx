/**
 * Step 1: Client Selection
 *
 * Allows user to choose between B2C and B2B clients, search existing clients,
 * or create a new client.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, User, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import {
  useSearchClients,
  useSearchOperatorsClients,
  useCreateClient,
  useCreateOperatorsClient,
} from '@/lib/hooks/useBookingWizard';
import { b2cClientSchema, b2bClientSchema } from '@/lib/validations/booking-wizard';
import type { WizardClientType, Client, OperatorsClient } from '@/types/wizard';
import { useToast } from '@/lib/hooks/use-toast';

export function Step1ClientSelection() {
  const [clientType, setClientType] = useState<WizardClientType>('B2C');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  const { setClient, nextStep, markStepComplete } = useBookingWizard();
  const { toast } = useToast();

  // Search hooks
  const { data: b2cClients, isLoading: isLoadingB2C } = useSearchClients(searchQuery, 'B2C');
  const { data: b2bClients, isLoading: isLoadingB2B } = useSearchOperatorsClients(searchQuery);

  const clients = clientType === 'B2C' ? b2cClients : b2bClients;
  const isLoading = clientType === 'B2C' ? isLoadingB2C : isLoadingB2B;

  const handleClientSelect = (client: Client | OperatorsClient) => {
    setClient({
      id: client.id,
      type: clientType,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      nationality: client.nationality,
      passportNumber: client.passportNumber,
      passportExpiryDate: client.passportExpiryDate
        ? new Date(client.passportExpiryDate)
        : undefined,
    });
    markStepComplete(1);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Client Selection</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose an existing client or create a new one to start the booking
        </p>
      </div>

      {/* Client Type Toggle */}
      <div>
        <Label>Client Type</Label>
        <RadioGroup
          value={clientType}
          onValueChange={value => setClientType(value as WizardClientType)}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="B2C" id="b2c" />
            <Label htmlFor="b2c" className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              B2C (Individual Client)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="B2B" id="b2b" />
            <Label htmlFor="b2b" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="w-4 h-4" />
              B2B (Partner Operator)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Search */}
      <div>
        <Label htmlFor="search">Search Clients</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create New Client Button */}
      <div>
        <NewClientDialog
          clientType={clientType}
          open={showNewClientDialog}
          onOpenChange={setShowNewClientDialog}
          onClientCreated={handleClientSelect}
        />
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Search Results ({clients?.length || 0})
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={() => handleClientSelect(client)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No clients found</p>
              <Button variant="link" onClick={() => setShowNewClientDialog(true)} className="mt-2">
                Create new client instead
              </Button>
            </div>
          )}
        </div>
      )}

      {searchQuery.length < 2 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Search for an existing client or create a new one</p>
          <Button onClick={() => setShowNewClientDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Client
          </Button>
        </div>
      )}
    </div>
  );
}

// Client Card Component
interface ClientCardProps {
  client: Client | OperatorsClient;
  onSelect: () => void;
}

function ClientCard({ client, onSelect }: ClientCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{client.fullName}</h4>
          <p className="text-sm text-gray-600">{client.email}</p>
          <p className="text-sm text-gray-600">{client.phone}</p>
          {client.nationality && <p className="text-sm text-gray-500 mt-1">{client.nationality}</p>}
        </div>
        <div className="ml-4">
          {client.clientType === 'B2B' ? (
            <Building2 className="w-5 h-5 text-blue-600" />
          ) : (
            <User className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>
    </Card>
  );
}

// New Client Dialog Component
interface NewClientDialogProps {
  clientType: WizardClientType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: Client | OperatorsClient) => void;
}

function NewClientDialog({
  clientType,
  open,
  onOpenChange,
  onClientCreated,
}: NewClientDialogProps) {
  const { toast } = useToast();
  const createB2CClient = useCreateClient();
  const createB2BClient = useCreateOperatorsClient();

  const schema = clientType === 'B2C' ? b2cClientSchema : b2bClientSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const result =
        clientType === 'B2C'
          ? await createB2CClient.mutateAsync(data)
          : await createB2BClient.mutateAsync(data);

      toast({
        title: 'Success',
        description: 'Client created successfully',
      });

      onClientCreated(result);
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create client',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New {clientType} Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New {clientType} Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...register('nationality')} />
            </div>

            <div>
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input id="passportNumber" {...register('passportNumber')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createB2CClient.isPending || createB2BClient.isPending}>
              {createB2CClient.isPending || createB2BClient.isPending
                ? 'Creating...'
                : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
