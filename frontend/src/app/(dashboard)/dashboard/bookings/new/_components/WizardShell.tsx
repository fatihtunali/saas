/**
 * Wizard Shell Component
 *
 * Container component for the booking wizard that handles:
 * - Step navigation and progress
 * - Step validation
 * - Navigation buttons
 * - Progress indicator
 *
 * @module components/WizardShell
 */

'use client';

import React from 'react';
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  useBookingWizard,
  useStepValidation,
  useWizardProgress,
  useCanProceed,
} from '@/contexts/BookingWizardContext';
import { cn } from '@/lib/utils';
import type { WizardStep } from '@/types/wizard';

/**
 * Step configuration
 */
const STEPS: Array<{
  number: WizardStep;
  title: string;
  description: string;
}> = [
  {
    number: 1,
    title: 'Client Selection',
    description: 'Choose or create a client',
  },
  {
    number: 2,
    title: 'Trip Details',
    description: 'Define travel dates and destination',
  },
  {
    number: 3,
    title: 'Passengers',
    description: 'Add traveler information',
  },
  {
    number: 4,
    title: 'Services',
    description: 'Select hotels, tours, and activities',
  },
  {
    number: 5,
    title: 'Review & Submit',
    description: 'Confirm and create booking',
  },
];

interface WizardShellProps {
  children: React.ReactNode;
}

export function WizardShell({ children }: WizardShellProps) {
  const { currentStep, completedSteps, goToStep, nextStep, previousStep, saveToLocalStorage } =
    useBookingWizard();

  const stepValidation = useStepValidation();
  const progress = useWizardProgress();
  const canProceed = useCanProceed();

  const handleStepClick = (step: WizardStep) => {
    // Can only navigate to completed steps or current step
    if (completedSteps.includes(step) || step === currentStep) {
      goToStep(step);
    }
  };

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousStep();
    }
  };

  const handleSaveDraft = () => {
    saveToLocalStorage();
    // Could also show a toast notification
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Stepper */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Step {currentStep} of {STEPS.length}
              </p>
              <p className="text-sm text-gray-500">{progress}% Complete</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stepper */}
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.number);
                const isCurrent = currentStep === step.number;
                const isClickable = isCompleted || isCurrent;

                return (
                  <li
                    key={step.number}
                    className={cn('flex items-center', index !== STEPS.length - 1 && 'flex-1')}
                  >
                    <button
                      onClick={() => handleStepClick(step.number)}
                      disabled={!isClickable}
                      className={cn(
                        'flex flex-col items-center group',
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      )}
                    >
                      {/* Step Circle */}
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                          isCompleted && 'bg-blue-600 border-blue-600',
                          isCurrent && !isCompleted && 'border-blue-600 bg-white',
                          !isCurrent && !isCompleted && 'border-gray-300 bg-white'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              isCurrent ? 'text-blue-600' : 'text-gray-500'
                            )}
                          >
                            {step.number}
                          </span>
                        )}
                      </div>

                      {/* Step Label */}
                      <div className="mt-2 text-center">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isCurrent ? 'text-blue-600' : 'text-gray-900'
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                      </div>
                    </button>

                    {/* Connector Line */}
                    {index !== STEPS.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-0.5 mx-4',
                          isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">{children}</div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 5 && (
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}

              {currentStep < 5 && (
                <Button onClick={handleNext} disabled={!canProceed}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to prevent content being hidden by fixed footer */}
      <div className="h-24" />
    </div>
  );
}
