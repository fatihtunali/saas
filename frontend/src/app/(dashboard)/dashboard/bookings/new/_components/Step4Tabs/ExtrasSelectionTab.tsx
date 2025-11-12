/**
 * Extras Selection Tab (Entrance Fees & Extra Expenses)
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useEntranceFees, useExtraExpenses } from '@/lib/hooks/useBookingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EntranceFee, ExtraExpense, WizardServiceData } from '@/types/wizard';

export function ExtrasSelectionTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: entranceFees, isLoading: loadingFees } = useEntranceFees(
    tripDetails?.destinationCityId
  );
  const { data: extraExpenses, isLoading: loadingExtras } = useExtraExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtra, setSelectedExtra] = useState<EntranceFee | ExtraExpense | null>(null);
  const [extraType, setExtraType] = useState<'entrance_fee' | 'extra'>('entrance_fee');

  const extraServices = services.filter(
    s => s.serviceType === 'entrance_fee' || s.serviceType === 'extra'
  );

  const handleAddExtra = () => {
    if (!selectedExtra || !tripDetails) return;

    let newService: WizardServiceData;

    if (extraType === 'entrance_fee') {
      const fee = selectedExtra as EntranceFee;
      newService = {
        serviceType: 'entrance_fee',
        entranceFeeId: fee.id,
        serviceDate: tripDetails.travelStartDate,
        serviceDescription: fee.siteName,
        quantity: tripDetails.numAdults + tripDetails.numChildren,
        costAmount: fee.adultPrice || 0,
        costCurrency: 'TRY',
        exchangeRate: 1,
        costInBaseCurrency: fee.adultPrice || 0,
        sellingPrice: (fee.adultPrice || 0) * 1.2,
        sellingCurrency: 'TRY',
      };
    } else {
      const expense = selectedExtra as ExtraExpense;
      newService = {
        serviceType: 'extra',
        extraExpenseId: expense.id,
        serviceDate: tripDetails.travelStartDate,
        serviceDescription: expense.description,
        quantity: 1,
        costAmount: expense.unitPrice || 0,
        costCurrency: 'TRY',
        exchangeRate: 1,
        costInBaseCurrency: expense.unitPrice || 0,
        sellingPrice: (expense.unitPrice || 0) * 1.2,
        sellingCurrency: 'TRY',
      };
    }

    addService(newService);
    setSelectedExtra(null);
  };

  return (
    <div className="space-y-6">
      {extraServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            Selected Extras ({extraServices.length})
          </h4>
          <div className="space-y-2">
            {extraServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.serviceDescription}</p>
                  <p className="text-sm text-gray-600">
                    {service.quantity}x @ {service.costCurrency} {service.costAmount}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {service.sellingCurrency} {service.sellingPrice.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(services.indexOf(service))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="entrance_fees" onValueChange={v => setExtraType(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrance_fees">Entrance Fees</TabsTrigger>
          <TabsTrigger value="extra_expenses">Extra Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="entrance_fees" className="space-y-4">
          <div>
            <Label htmlFor="feeSearch">Search Entrance Fees</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="feeSearch"
                type="text"
                placeholder="Search by site name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loadingFees ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading entrance fees...</p>
            </div>
          ) : entranceFees && entranceFees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entranceFees
                .filter(fee => fee.siteName?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(fee => (
                  <Card
                    key={fee.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedExtra?.id === fee.id && extraType === 'entrance_fee'
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedExtra(fee);
                      setExtraType('entrance_fee');
                    }}
                  >
                    <h4 className="font-semibold text-gray-900">{fee.siteName}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adult:</span>
                        <span>TRY {fee.adultPrice}</span>
                      </div>
                      {fee.childPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Child:</span>
                          <span>TRY {fee.childPrice}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No entrance fees available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="extra_expenses" className="space-y-4">
          <div>
            <Label htmlFor="extraSearch">Search Extra Expenses</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="extraSearch"
                type="text"
                placeholder="Search by expense name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loadingExtras ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading extra expenses...</p>
            </div>
          ) : extraExpenses && extraExpenses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extraExpenses
                .filter(
                  expense =>
                    expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    expense.expenseType?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(expense => (
                  <Card
                    key={expense.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedExtra?.id === expense.id && extraType === 'extra'
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedExtra(expense);
                      setExtraType('extra');
                    }}
                  >
                    <h4 className="font-semibold text-gray-900">{expense.expenseType}</h4>
                    <p className="text-sm text-gray-600 mt-2">{expense.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Unit Price: TRY {expense.unitPrice || 0}
                    </p>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No extra expenses available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedExtra && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-4">
            Add{' '}
            {extraType === 'entrance_fee'
              ? (selectedExtra as EntranceFee).siteName
              : (selectedExtra as ExtraExpense).expenseType}
          </h4>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedExtra(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddExtra} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
