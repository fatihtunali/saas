'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useBookingPassengers } from '@/lib/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Globe,
  CreditCard,
  UtensilsCrossed,
  Heart,
  Accessibility,
  FileText,
  Download,
  Crown,
  Baby,
  UserCircle,
} from 'lucide-react';
import type { BookingPassenger, PassengerType } from '@/types/bookings';

// Utility Functions
function formatDate(date: string): string {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return date;
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Passenger Type Badge
function PassengerTypeBadge({ type }: { type: PassengerType }) {
  const colors: Record<PassengerType, string> = {
    Adult: 'bg-blue-100 text-blue-800 border-blue-300',
    Child: 'bg-purple-100 text-purple-800 border-purple-300',
    Infant: 'bg-pink-100 text-pink-800 border-pink-300',
  };

  const icons: Record<PassengerType, React.ReactNode> = {
    Adult: <UserCircle className="h-3 w-3" />,
    Child: <User className="h-3 w-3" />,
    Infant: <Baby className="h-3 w-3" />,
  };

  return (
    <Badge variant="outline" className={colors[type]}>
      {icons[type]}
      <span className="ml-1">{type}</span>
    </Badge>
  );
}

// Passenger Card Component
interface PassengerCardProps {
  passenger: BookingPassenger;
  onEdit: (passenger: BookingPassenger) => void;
  onDelete: (passenger: BookingPassenger) => void;
}

function PassengerCard({ passenger, onEdit, onDelete }: PassengerCardProps) {
  const age = passenger.age || calculateAge(passenger.dateOfBirth);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
              {passenger.firstName?.charAt(0).toUpperCase()}
              {passenger.lastName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </h3>
                {passenger.isLeadPassenger && (
                  <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Lead
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PassengerTypeBadge type={passenger.passengerType} />
                <span className="text-sm text-muted-foreground">Age {age}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(passenger)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Passenger
              </DropdownMenuItem>
              {!passenger.isLeadPassenger && (
                <DropdownMenuItem onClick={() => onDelete(passenger)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Passenger
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Personal Information */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Personal Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium">{formatDate(passenger.dateOfBirth)}</p>
              </div>
            </div>

            {passenger.gender && (
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium">{passenger.gender}</p>
              </div>
            )}

            {passenger.nationality && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="text-sm font-medium">{passenger.nationality}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information (for lead passenger) */}
        {passenger.isLeadPassenger && (passenger.email || passenger.phone) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                Contact Information
              </h4>
              <div className="space-y-2">
                {passenger.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${passenger.email}`} className="text-sm hover:underline">
                      {passenger.email}
                    </a>
                  </div>
                )}
                {passenger.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${passenger.phone}`} className="text-sm hover:underline">
                      {passenger.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Passport Information */}
        {(passenger.passportNumber ||
          passenger.passportExpiryDate ||
          passenger.passportIssueCountry) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                Passport Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {passenger.passportNumber && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Passport Number</p>
                      <p className="text-sm font-mono font-medium">{passenger.passportNumber}</p>
                    </div>
                  </div>
                )}

                {passenger.passportExpiryDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(passenger.passportExpiryDate)}
                    </p>
                  </div>
                )}

                {passenger.passportIssueCountry && (
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Country</p>
                    <p className="text-sm font-medium">{passenger.passportIssueCountry}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Special Requirements */}
        {(passenger.dietaryRequirements ||
          passenger.medicalConditions ||
          passenger.accessibilityNeeds) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                Special Requirements
              </h4>
              <div className="space-y-2">
                {passenger.dietaryRequirements && (
                  <div className="flex items-start gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dietary Requirements</p>
                      <p className="text-sm">{passenger.dietaryRequirements}</p>
                    </div>
                  </div>
                )}

                {passenger.medicalConditions && (
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Medical Conditions</p>
                      <p className="text-sm">{passenger.medicalConditions}</p>
                    </div>
                  </div>
                )}

                {passenger.accessibilityNeeds && (
                  <div className="flex items-start gap-2">
                    <Accessibility className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Accessibility Needs</p>
                      <p className="text-sm">{passenger.accessibilityNeeds}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Room Preferences */}
        {(passenger.roomNumber || passenger.bedTypePreference) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Room Preferences</h4>
              <div className="grid grid-cols-2 gap-3">
                {passenger.roomNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">Room Number</p>
                    <p className="text-sm font-medium">{passenger.roomNumber}</p>
                  </div>
                )}

                {passenger.bedTypePreference && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bed Preference</p>
                    <p className="text-sm font-medium">{passenger.bedTypePreference}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Special Notes */}
        {passenger.specialNotes && (
          <>
            <Separator />
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Special Notes</p>
                <p className="text-sm">{passenger.specialNotes}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main PassengersTab Component
interface PassengersTabProps {
  bookingId: string;
}

export function PassengersTab({ bookingId }: PassengersTabProps) {
  const { data: passengers = [], isLoading } = useBookingPassengers(bookingId);

  // Calculate statistics
  const stats = useMemo(() => {
    const adults = passengers.filter(p => p.passengerType === 'Adult').length;
    const children = passengers.filter(p => p.passengerType === 'Child').length;
    const infants = passengers.filter(p => p.passengerType === 'Infant').length;
    const leadPassenger = passengers.find(p => p.isLeadPassenger);

    return {
      total: passengers.length,
      adults,
      children,
      infants,
      leadPassenger,
    };
  }, [passengers]);

  // Handlers
  const handleEdit = (passenger: BookingPassenger) => {
    console.log('Edit passenger:', passenger.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (passenger: BookingPassenger) => {
    console.log('Delete passenger:', passenger.id);
    // TODO: Implement delete functionality
  };

  const handleAddPassenger = () => {
    console.log('Add new passenger');
    // TODO: Implement add passenger functionality
  };

  const handleExportList = () => {
    console.log('Export passenger list');
    // TODO: Implement export functionality
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (passengers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No passengers added</p>
          <p className="text-sm text-muted-foreground mb-4">Add passengers to this booking</p>
          <Button onClick={handleAddPassenger}>
            <Plus className="mr-2 h-4 w-4" />
            Add Passenger
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Passengers</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} passenger{stats.total !== 1 ? 's' : ''} ({stats.adults} adult
            {stats.adults !== 1 ? 's' : ''}, {stats.children} child
            {stats.children !== 1 ? 'ren' : ''}
            {stats.infants > 0 ? `, ${stats.infants} infant${stats.infants !== 1 ? 's' : ''}` : ''})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportList}>
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
          <Button onClick={handleAddPassenger}>
            <Plus className="mr-2 h-4 w-4" />
            Add Passenger
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Passenger Summary</CardTitle>
          <CardDescription>Overview of all travelers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <UserCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.adults}</p>
                <p className="text-sm text-muted-foreground">Adults</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.children}</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <Baby className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold">{stats.infants}</p>
                <p className="text-sm text-muted-foreground">Infants</p>
              </div>
            </div>
          </div>

          {stats.leadPassenger && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-900">Lead Passenger</p>
              </div>
              <p className="text-sm text-amber-800">
                {stats.leadPassenger.firstName} {stats.leadPassenger.lastName}
              </p>
              {stats.leadPassenger.email && (
                <p className="text-xs text-amber-700 mt-1">{stats.leadPassenger.email}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passengers Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passengers.map(passenger => (
            <PassengerCard
              key={passenger.id}
              passenger={passenger}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
