/**
 * Extras Tab - Step 4 Service Selection
 *
 * Handles entrance fees and extra expenses.
 * Two sub-sections: Entrance Fees (museums, sites) and Extra Expenses (miscellaneous).
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Calendar, Ticket, DollarSign, FileText } from 'lucide-react';
import { useBookingWizard } from '@/contexts/BookingWizardContext';
import { useEntranceFees, useExtraExpenses } from '@/lib/hooks/useBookingWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  EntranceFee,
  ExtraExpense,
  WizardServiceData,
  WizardEntranceFeeService,
} from '@/types/wizard';

type ExtraTabType = 'entrance_fees' | 'extra_expenses';

interface EntranceFeeFormData {
  serviceDate: string;
  numAdults: number;
  numChildren: number;
  numStudents: number;
  numSeniors: number;
}

interface ExtraExpenseFormData {
  serviceDate: string;
  quantity: number;
  customName: string;
  customUnitPrice: number;
  category: string;
  description: string;
}

export function ExtrasTab() {
  const { tripDetails, addService, services, removeService } = useBookingWizard();
  const { data: entranceFees, isLoading: loadingFees } = useEntranceFees(
    tripDetails?.destinationCityId
  );
  const { data: extraExpenses, isLoading: loadingExtras } = useExtraExpenses();

  const [activeTab, setActiveTab] = useState<ExtraTabType>('entrance_fees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntranceFee, setSelectedEntranceFee] = useState<EntranceFee | null>(null);
  const [selectedExtraExpense, setSelectedExtraExpense] = useState<ExtraExpense | null>(null);
  const [useCustomExpense, setUseCustomExpense] = useState(false);

  const [entranceFeeForm, setEntranceFeeForm] = useState<EntranceFeeFormData>({
    serviceDate: tripDetails?.travelStartDate
      ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
      : '',
    numAdults: tripDetails?.numAdults || 0,
    numChildren: tripDetails?.numChildren || 0,
    numStudents: 0,
    numSeniors: 0,
  });

  const [extraExpenseForm, setExtraExpenseForm] = useState<ExtraExpenseFormData>({
    serviceDate: tripDetails?.travelStartDate
      ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
      : '',
    quantity: 1,
    customName: '',
    customUnitPrice: 0,
    category: 'Miscellaneous',
    description: '',
  });

  const filteredEntranceFees = entranceFees?.filter(fee =>
    fee.siteName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExtraExpenses = extraExpenses?.filter(
    expense =>
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.expenseType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extraServices = services.filter(
    s => s.serviceType === 'entrance_fee' || s.serviceType === 'extra'
  );

  // Calculate entrance fee total
  const calculateEntranceFeeTotal = (fee: EntranceFee, form: EntranceFeeFormData): number => {
    let total = 0;
    total += (fee.adultPrice || 0) * form.numAdults;
    total += (fee.childPrice || 0) * form.numChildren;
    total += (fee.studentPrice || 0) * form.numStudents;
    total += (fee.seniorPrice || 0) * form.numSeniors;
    return total;
  };

  const handleAddEntranceFee = () => {
    if (!selectedEntranceFee || !tripDetails || !entranceFeeForm.serviceDate) return;

    const totalPeople =
      entranceFeeForm.numAdults +
      entranceFeeForm.numChildren +
      entranceFeeForm.numStudents +
      entranceFeeForm.numSeniors;

    if (totalPeople === 0) {
      alert('Please specify at least one person');
      return;
    }

    const costAmount = calculateEntranceFeeTotal(selectedEntranceFee, entranceFeeForm);
    const sellingPrice = costAmount * 1.1; // 10% markup

    const newService: WizardEntranceFeeService = {
      id: `entrance-${Date.now()}`,
      serviceType: 'entrance_fee',
      entranceFeeId: selectedEntranceFee.id,
      serviceDate: new Date(entranceFeeForm.serviceDate),
      serviceDescription: selectedEntranceFee.siteName,
      serviceName: selectedEntranceFee.siteName,
      supplierName: selectedEntranceFee.siteName,
      quantity: 1,
      costAmount,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: costAmount,
      sellingPrice,
      sellingCurrency: 'TRY',
      adultCount: entranceFeeForm.numAdults,
      childCount: entranceFeeForm.numChildren,
      studentCount: entranceFeeForm.numStudents || 0,
      seniorCount: entranceFeeForm.numSeniors || 0,
      serviceNotes: `Adults: ${entranceFeeForm.numAdults}, Children: ${entranceFeeForm.numChildren}, Students: ${entranceFeeForm.numStudents}, Seniors: ${entranceFeeForm.numSeniors}`,
    };

    addService(newService);
    setSelectedEntranceFee(null);
    resetEntranceFeeForm();
  };

  const handleAddExtraExpense = () => {
    if (!tripDetails || !extraExpenseForm.serviceDate) return;

    let costAmount: number;
    let description: string;
    let extraExpenseId: number | undefined;

    if (useCustomExpense) {
      if (!extraExpenseForm.customName || extraExpenseForm.customUnitPrice <= 0) {
        alert('Please provide expense name and unit price');
        return;
      }
      costAmount = extraExpenseForm.customUnitPrice * extraExpenseForm.quantity;
      description = extraExpenseForm.customName;
    } else {
      if (!selectedExtraExpense) return;
      costAmount = (selectedExtraExpense.unitPrice || 0) * extraExpenseForm.quantity;
      description = selectedExtraExpense.description;
      extraExpenseId = selectedExtraExpense.id;
    }

    const sellingPrice = costAmount * 1.1; // 10% markup

    const newService: WizardServiceData = {
      id: `extra-${Date.now()}`,
      serviceType: 'extra',
      extraExpenseId,
      serviceDate: new Date(extraExpenseForm.serviceDate),
      serviceDescription: description,
      serviceName: description,
      supplierName: 'Extra Expense',
      quantity: extraExpenseForm.quantity,
      costAmount: costAmount / extraExpenseForm.quantity,
      costCurrency: 'TRY',
      exchangeRate: 1,
      costInBaseCurrency: costAmount / extraExpenseForm.quantity,
      sellingPrice: sellingPrice / extraExpenseForm.quantity,
      sellingCurrency: 'TRY',
      serviceNotes: `Category: ${extraExpenseForm.category}${extraExpenseForm.description ? ' | ' + extraExpenseForm.description : ''}`,
    };

    addService(newService);
    setSelectedExtraExpense(null);
    setUseCustomExpense(false);
    resetExtraExpenseForm();
  };

  const resetEntranceFeeForm = () => {
    setEntranceFeeForm({
      serviceDate: tripDetails?.travelStartDate
        ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
        : '',
      numAdults: tripDetails?.numAdults || 0,
      numChildren: tripDetails?.numChildren || 0,
      numStudents: 0,
      numSeniors: 0,
    });
  };

  const resetExtraExpenseForm = () => {
    setExtraExpenseForm({
      serviceDate: tripDetails?.travelStartDate
        ? new Date(tripDetails.travelStartDate).toISOString().split('T')[0]
        : '',
      quantity: 1,
      customName: '',
      customUnitPrice: 0,
      category: 'Miscellaneous',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search entrance fees or extra expenses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Extras List */}
      {extraServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extraServices.map((service, index) => (
                <div
                  key={service.id || index}
                  className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {service.serviceType === 'entrance_fee' ? (
                        <Ticket className="w-4 h-4 text-purple-600" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-pink-600" />
                      )}
                      <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
                      <Badge
                        variant={service.serviceType === 'entrance_fee' ? 'default' : 'secondary'}
                      >
                        {service.serviceType === 'entrance_fee' ? 'Entrance' : 'Expense'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(service.serviceDate).toLocaleDateString()}
                      </div>
                    </div>
                    {service.serviceNotes && (
                      <p className="text-xs text-gray-500 mt-2">{service.serviceNotes}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="font-semibold text-gray-900">
                      {service.costCurrency} {(service.costAmount * service.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      Selling: {service.sellingCurrency}{' '}
                      {(service.sellingPrice * service.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(services.indexOf(service))}
                      className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ExtraTabType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrance_fees" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Entrance Fees
          </TabsTrigger>
          <TabsTrigger value="extra_expenses" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Extra Expenses
          </TabsTrigger>
        </TabsList>

        {/* Entrance Fees Tab */}
        <TabsContent value="entrance_fees" className="space-y-6 mt-6">
          {selectedEntranceFee && (
            <Card className="border-blue-500 border-2 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Configure Entrance Fee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedEntranceFee.siteName}
                  </h4>
                  {selectedEntranceFee.description && (
                    <p className="text-sm text-gray-600 mb-3">{selectedEntranceFee.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adult:</span>
                      <span className="font-medium">TRY {selectedEntranceFee.adultPrice || 0}</span>
                    </div>
                    {selectedEntranceFee.childPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Child:</span>
                        <span className="font-medium">TRY {selectedEntranceFee.childPrice}</span>
                      </div>
                    )}
                    {selectedEntranceFee.studentPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Student:</span>
                        <span className="font-medium">TRY {selectedEntranceFee.studentPrice}</span>
                      </div>
                    )}
                    {selectedEntranceFee.seniorPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Senior:</span>
                        <span className="font-medium">TRY {selectedEntranceFee.seniorPrice}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="entranceFeeDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Visit Date
                  </Label>
                  <Input
                    id="entranceFeeDate"
                    type="date"
                    value={entranceFeeForm.serviceDate}
                    onChange={e =>
                      setEntranceFeeForm({ ...entranceFeeForm, serviceDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numAdults">Adults</Label>
                    <Input
                      id="numAdults"
                      type="number"
                      min="0"
                      value={entranceFeeForm.numAdults}
                      onChange={e =>
                        setEntranceFeeForm({
                          ...entranceFeeForm,
                          numAdults: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numChildren">Children</Label>
                    <Input
                      id="numChildren"
                      type="number"
                      min="0"
                      value={entranceFeeForm.numChildren}
                      onChange={e =>
                        setEntranceFeeForm({
                          ...entranceFeeForm,
                          numChildren: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numStudents">Students</Label>
                    <Input
                      id="numStudents"
                      type="number"
                      min="0"
                      value={entranceFeeForm.numStudents}
                      onChange={e =>
                        setEntranceFeeForm({
                          ...entranceFeeForm,
                          numStudents: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numSeniors">Seniors</Label>
                    <Input
                      id="numSeniors"
                      type="number"
                      min="0"
                      value={entranceFeeForm.numSeniors}
                      onChange={e =>
                        setEntranceFeeForm({
                          ...entranceFeeForm,
                          numSeniors: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Total Cost:</span>
                    <span className="text-lg font-semibold text-green-600">
                      TRY{' '}
                      {calculateEntranceFeeTotal(selectedEntranceFee, entranceFeeForm).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total:{' '}
                    {entranceFeeForm.numAdults +
                      entranceFeeForm.numChildren +
                      entranceFeeForm.numStudents +
                      entranceFeeForm.numSeniors}{' '}
                    people
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEntranceFee(null);
                      resetEntranceFeeForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntranceFee} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entrance Fee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedEntranceFee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Entrance Fees</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFees ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading entrance fees...</p>
                  </div>
                ) : filteredEntranceFees && filteredEntranceFees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEntranceFees.map(fee => (
                      <div
                        key={fee.id}
                        className="p-4 border rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                        onClick={() => setSelectedEntranceFee(fee)}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{fee.siteName}</h4>
                        {fee.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {fee.description}
                          </p>
                        )}
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adult:</span>
                            <span className="font-medium">TRY {fee.adultPrice || 0}</span>
                          </div>
                          {fee.childPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Child:</span>
                              <span className="font-medium">TRY {fee.childPrice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No entrance fees available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Extra Expenses Tab */}
        <TabsContent value="extra_expenses" className="space-y-6 mt-6">
          <Card className="border-blue-500 border-2 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Add Extra Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useCustomExpense}
                    onChange={() => setUseCustomExpense(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Select from List</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useCustomExpense}
                    onChange={() => setUseCustomExpense(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Custom Expense</span>
                </label>
              </div>

              <div>
                <Label htmlFor="extraExpenseDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expense Date
                </Label>
                <Input
                  id="extraExpenseDate"
                  type="date"
                  value={extraExpenseForm.serviceDate}
                  onChange={e =>
                    setExtraExpenseForm({ ...extraExpenseForm, serviceDate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              {useCustomExpense ? (
                <>
                  <div>
                    <Label htmlFor="customName">Expense Name</Label>
                    <Input
                      id="customName"
                      type="text"
                      placeholder="e.g., Parking Fee, Tip, etc."
                      value={extraExpenseForm.customName}
                      onChange={e =>
                        setExtraExpenseForm({ ...extraExpenseForm, customName: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customUnitPrice">Unit Price (TRY)</Label>
                      <Input
                        id="customUnitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={extraExpenseForm.customUnitPrice}
                        onChange={e =>
                          setExtraExpenseForm({
                            ...extraExpenseForm,
                            customUnitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={extraExpenseForm.quantity}
                        onChange={e =>
                          setExtraExpenseForm({
                            ...extraExpenseForm,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                selectedExtraExpense && (
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900">
                      {selectedExtraExpense.expenseType}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedExtraExpense.description}</p>
                    <p className="text-sm font-medium mt-2">
                      Unit Price: TRY {selectedExtraExpense.unitPrice || 0}
                    </p>
                  </div>
                )
              )}

              {!useCustomExpense && (
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={extraExpenseForm.quantity}
                    onChange={e =>
                      setExtraExpenseForm({
                        ...extraExpenseForm,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={extraExpenseForm.category}
                  onChange={e =>
                    setExtraExpenseForm({ ...extraExpenseForm, category: e.target.value })
                  }
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Tips">Tips</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={extraExpenseForm.description}
                  onChange={e =>
                    setExtraExpenseForm({ ...extraExpenseForm, description: e.target.value })
                  }
                  placeholder="Additional notes about this expense..."
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-green-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Cost:</span>
                  <span className="text-lg font-semibold text-green-600">
                    TRY{' '}
                    {(useCustomExpense
                      ? extraExpenseForm.customUnitPrice * extraExpenseForm.quantity
                      : (selectedExtraExpense?.unitPrice || 0) * extraExpenseForm.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button onClick={handleAddExtraExpense} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          {!useCustomExpense && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Extra Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingExtras ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading extra expenses...</p>
                  </div>
                ) : filteredExtraExpenses && filteredExtraExpenses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExtraExpenses.map(expense => (
                      <div
                        key={expense.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedExtraExpense?.id === expense.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'hover:border-pink-500 hover:bg-pink-50'
                        }`}
                        onClick={() => setSelectedExtraExpense(expense)}
                      >
                        <h4 className="font-semibold text-gray-900">{expense.expenseType}</h4>
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                        <p className="text-sm font-medium mt-2">
                          Unit Price: TRY {expense.unitPrice || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No extra expenses available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
