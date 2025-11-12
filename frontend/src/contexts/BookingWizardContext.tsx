/**
 * Booking Wizard Context
 *
 * Centralized state management for the booking wizard.
 * Handles all wizard state including current step, client data, trip details,
 * passengers, services, and pricing. Includes auto-save to localStorage.
 *
 * @module contexts/BookingWizardContext
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  BookingWizardState,
  WizardStep,
  WizardClientData,
  WizardTripDetails,
  WizardPassengerData,
  WizardServiceData,
  WizardPricingData,
} from '@/types/wizard';

/**
 * Wizard actions interface
 */
interface BookingWizardActions {
  // Step navigation
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: WizardStep) => void;
  markStepComplete: (step: WizardStep) => void;

  // Client data
  setClient: (client: WizardClientData) => void;
  clearClient: () => void;

  // Trip details
  setTripDetails: (details: WizardTripDetails) => void;
  updateTripDetails: (details: Partial<WizardTripDetails>) => void;
  clearTripDetails: () => void;

  // Passengers
  setPassengers: (passengers: WizardPassengerData[]) => void;
  addPassenger: (passenger: WizardPassengerData) => void;
  updatePassenger: (index: number, passenger: WizardPassengerData) => void;
  removePassenger: (index: number) => void;
  clearPassengers: () => void;

  // Services
  setServices: (services: WizardServiceData[]) => void;
  addService: (service: WizardServiceData) => void;
  updateService: (index: number, service: WizardServiceData) => void;
  removeService: (index: number) => void;
  clearServices: () => void;

  // Pricing
  setPricing: (pricing: WizardPricingData) => void;
  updatePricing: (pricing: Partial<WizardPricingData>) => void;
  clearPricing: () => void;

  // Submission state
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsDraft: (isDraft: boolean) => void;

  // Complete wizard
  resetWizard: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

/**
 * Combined context type
 */
type BookingWizardContextType = BookingWizardState & BookingWizardActions;

/**
 * Context
 */
const BookingWizardContext = createContext<BookingWizardContextType | undefined>(undefined);

/**
 * Initial state
 */
const initialState: BookingWizardState = {
  currentStep: 1,
  completedSteps: [],
  client: null,
  tripDetails: null,
  passengers: [],
  services: [],
  pricing: null,
  isSubmitting: false,
  isDraft: false,
  lastSaved: undefined,
};

/**
 * LocalStorage key
 */
const STORAGE_KEY = 'booking-wizard-state';

/**
 * Provider Props
 */
interface BookingWizardProviderProps {
  children: React.ReactNode;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/**
 * Booking Wizard Provider
 *
 * Wraps the wizard pages and provides state management.
 *
 * @example
 * ```tsx
 * <BookingWizardProvider autoSave={true} autoSaveDelay={2000}>
 *   <WizardShell />
 * </BookingWizardProvider>
 * ```
 */
export function BookingWizardProvider({
  children,
  autoSave = true,
  autoSaveDelay = 2000,
}: BookingWizardProviderProps) {
  const [state, setState] = useState<BookingWizardState>(initialState);

  /**
   * Save state to localStorage
   */
  const saveToLocalStorage = useCallback(() => {
    try {
      const serializedState = {
        ...state,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));
      setState(prev => ({ ...prev, lastSaved: new Date() }));
    } catch (error) {
      console.error('Failed to save wizard state to localStorage:', error);
    }
  }, [state]);

  /**
   * Load state from localStorage
   */
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Convert date strings back to Date objects
        if (parsed.tripDetails) {
          if (parsed.tripDetails.travelStartDate) {
            parsed.tripDetails.travelStartDate = new Date(parsed.tripDetails.travelStartDate);
          }
          if (parsed.tripDetails.travelEndDate) {
            parsed.tripDetails.travelEndDate = new Date(parsed.tripDetails.travelEndDate);
          }
        }
        if (parsed.passengers) {
          parsed.passengers = parsed.passengers.map((p: any) => ({
            ...p,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
            passportExpiryDate: p.passportExpiryDate ? new Date(p.passportExpiryDate) : undefined,
          }));
        }
        if (parsed.services) {
          parsed.services = parsed.services.map((s: any) => ({
            ...s,
            serviceDate: s.serviceDate ? new Date(s.serviceDate) : undefined,
          }));
        }
        if (parsed.lastSaved) {
          parsed.lastSaved = new Date(parsed.lastSaved);
        }
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load wizard state from localStorage:', error);
    }
  }, []);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [state, autoSave, autoSaveDelay, saveToLocalStorage]);

  /**
   * Load from localStorage on mount
   */
  useEffect(() => {
    loadFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Step navigation actions
   */
  const setCurrentStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(5, prev.currentStep + 1) as WizardStep,
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as WizardStep,
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => {
      // Only allow navigation to completed steps or next step
      if (prev.completedSteps.includes(step) || step === prev.currentStep + 1) {
        return { ...prev, currentStep: step };
      }
      return prev;
    });
  }, []);

  const markStepComplete = useCallback((step: WizardStep) => {
    setState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step].sort(),
    }));
  }, []);

  /**
   * Client data actions
   */
  const setClient = useCallback((client: WizardClientData) => {
    setState(prev => ({ ...prev, client }));
  }, []);

  const clearClient = useCallback(() => {
    setState(prev => ({ ...prev, client: null }));
  }, []);

  /**
   * Trip details actions
   */
  const setTripDetails = useCallback((details: WizardTripDetails) => {
    setState(prev => ({ ...prev, tripDetails: details }));
  }, []);

  const updateTripDetails = useCallback((details: Partial<WizardTripDetails>) => {
    setState(prev => ({
      ...prev,
      tripDetails: prev.tripDetails ? { ...prev.tripDetails, ...details } : null,
    }));
  }, []);

  const clearTripDetails = useCallback(() => {
    setState(prev => ({ ...prev, tripDetails: null }));
  }, []);

  /**
   * Passengers actions
   */
  const setPassengers = useCallback((passengers: WizardPassengerData[]) => {
    setState(prev => ({ ...prev, passengers }));
  }, []);

  const addPassenger = useCallback((passenger: WizardPassengerData) => {
    setState(prev => ({
      ...prev,
      passengers: [...prev.passengers, passenger],
    }));
  }, []);

  const updatePassenger = useCallback((index: number, passenger: WizardPassengerData) => {
    setState(prev => ({
      ...prev,
      passengers: prev.passengers.map((p, i) => (i === index ? passenger : p)),
    }));
  }, []);

  const removePassenger = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index),
    }));
  }, []);

  const clearPassengers = useCallback(() => {
    setState(prev => ({ ...prev, passengers: [] }));
  }, []);

  /**
   * Services actions
   */
  const setServices = useCallback((services: WizardServiceData[]) => {
    setState(prev => ({ ...prev, services }));
  }, []);

  const addService = useCallback((service: WizardServiceData) => {
    setState(prev => ({
      ...prev,
      services: [...prev.services, service],
    }));
  }, []);

  const updateService = useCallback((index: number, service: WizardServiceData) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map((s, i) => (i === index ? service : s)),
    }));
  }, []);

  const removeService = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }, []);

  const clearServices = useCallback(() => {
    setState(prev => ({ ...prev, services: [] }));
  }, []);

  /**
   * Pricing actions
   */
  const setPricing = useCallback((pricing: WizardPricingData) => {
    setState(prev => ({ ...prev, pricing }));
  }, []);

  const updatePricing = useCallback((pricing: Partial<WizardPricingData>) => {
    setState(prev => ({
      ...prev,
      pricing: prev.pricing ? { ...prev.pricing, ...pricing } : null,
    }));
  }, []);

  const clearPricing = useCallback(() => {
    setState(prev => ({ ...prev, pricing: null }));
  }, []);

  /**
   * Submission state actions
   */
  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setIsDraft = useCallback((isDraft: boolean) => {
    setState(prev => ({ ...prev, isDraft }));
  }, []);

  /**
   * Reset wizard
   */
  const resetWizard = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Context value
   */
  const value = useMemo<BookingWizardContextType>(
    () => ({
      ...state,
      setCurrentStep,
      nextStep,
      previousStep,
      goToStep,
      markStepComplete,
      setClient,
      clearClient,
      setTripDetails,
      updateTripDetails,
      clearTripDetails,
      setPassengers,
      addPassenger,
      updatePassenger,
      removePassenger,
      clearPassengers,
      setServices,
      addService,
      updateService,
      removeService,
      clearServices,
      setPricing,
      updatePricing,
      clearPricing,
      setIsSubmitting,
      setIsDraft,
      resetWizard,
      loadFromLocalStorage,
      saveToLocalStorage,
    }),
    [
      state,
      setCurrentStep,
      nextStep,
      previousStep,
      goToStep,
      markStepComplete,
      setClient,
      clearClient,
      setTripDetails,
      updateTripDetails,
      clearTripDetails,
      setPassengers,
      addPassenger,
      updatePassenger,
      removePassenger,
      clearPassengers,
      setServices,
      addService,
      updateService,
      removeService,
      clearServices,
      setPricing,
      updatePricing,
      clearPricing,
      setIsSubmitting,
      setIsDraft,
      resetWizard,
      loadFromLocalStorage,
      saveToLocalStorage,
    ]
  );

  return <BookingWizardContext.Provider value={value}>{children}</BookingWizardContext.Provider>;
}

/**
 * Custom hook to use the booking wizard context
 *
 * @throws {Error} If used outside of BookingWizardProvider
 *
 * @example
 * ```tsx
 * function Step1ClientSelection() {
 *   const { client, setClient, nextStep } = useBookingWizard();
 *
 *   const handleClientSelect = (client: WizardClientData) => {
 *     setClient(client);
 *     nextStep();
 *   };
 *
 *   return <ClientSelector onSelect={handleClientSelect} />;
 * }
 * ```
 */
export function useBookingWizard(): BookingWizardContextType {
  const context = useContext(BookingWizardContext);
  if (context === undefined) {
    throw new Error('useBookingWizard must be used within a BookingWizardProvider');
  }
  return context;
}

/**
 * Helper hooks for specific wizard sections
 */

/**
 * Hook for step validation
 */
export function useStepValidation() {
  const { client, tripDetails, passengers, services, pricing } = useBookingWizard();

  return {
    isStep1Valid: client !== null,
    isStep2Valid: tripDetails !== null,
    isStep3Valid: passengers.length > 0 && passengers.some(p => p.isLeadPassenger),
    isStep4Valid: true, // Services are optional
    isStep5Valid: pricing !== null,
  };
}

/**
 * Hook for step progress percentage
 */
export function useWizardProgress() {
  const { completedSteps } = useBookingWizard();
  const totalSteps = 5;
  return Math.round((completedSteps.length / totalSteps) * 100);
}

/**
 * Hook to check if wizard can proceed to next step
 */
export function useCanProceed() {
  const { currentStep, client, tripDetails, passengers } = useBookingWizard();

  switch (currentStep) {
    case 1:
      return client !== null;
    case 2:
      return tripDetails !== null;
    case 3:
      return passengers.length > 0 && passengers.some(p => p.isLeadPassenger);
    case 4:
      return true; // Services are optional
    case 5:
      return false; // Last step, no next
    default:
      return false;
  }
}
