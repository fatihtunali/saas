//ft
/**
 * New Booking Page
 *
 * Main page for the booking wizard that orchestrates all 5 steps.
 */

'use client';

import React from 'react';
import { BookingWizardProvider, useBookingWizard } from '@/contexts/BookingWizardContext';
import { WizardShell } from './_components/WizardShell';
import { Step1ClientSelection } from './_components/Step1ClientSelection';
import { Step2TripDetails } from './_components/Step2TripDetails';
import { Step3PassengersInfo } from './_components/Step3PassengersInfo';
import { Step4ServicesSelection } from './_components/Step4ServicesSelection';
import { Step5PricingSummary } from './_components/Step5PricingSummary';

/**
 * Wizard Content Component
 * Renders the appropriate step based on currentStep
 */
function WizardContent() {
  const { currentStep } = useBookingWizard();

  return (
    <WizardShell>
      {currentStep === 1 && <Step1ClientSelection />}
      {currentStep === 2 && <Step2TripDetails />}
      {currentStep === 3 && <Step3PassengersInfo />}
      {currentStep === 4 && <Step4ServicesSelection />}
      {currentStep === 5 && <Step5PricingSummary />}
    </WizardShell>
  );
}

/**
 * New Booking Page
 */
export default function NewBookingPage() {
  return (
    <BookingWizardProvider autoSave={true} autoSaveDelay={2000}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
          <p className="mt-2 text-base text-gray-600">
            Complete all steps to create a booking. Your progress is automatically saved.
          </p>
        </div>
        <WizardContent />
      </div>
    </BookingWizardProvider>
  );
}
