'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { parsePhoneNumber, CountryCode, isValidPhoneNumber } from 'libphonenumber-js';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * PhoneInput Component
 *
 * A phone number input with country code selector and validation.
 *
 * Features:
 * - Country code selector
 * - Phone number formatting by country
 * - Validation using libphonenumber-js
 * - Visual validation feedback
 * - Common countries list
 *
 * @example
 * ```tsx
 * <PhoneInput
 *   value="+905551234567"
 *   onChange={setPhone}
 *   defaultCountry="TR"
 * />
 * ```
 */

export interface PhoneInputProps {
  /** Phone number value (international format) */
  value?: string;
  /** Callback when phone changes */
  onChange?: (phone: string) => void;
  /** Default country code */
  defaultCountry?: CountryCode;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Show validation error */
  error?: boolean;
  /** Callback for validation state */
  onValidationChange?: (isValid: boolean) => void;
}

interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
];

export function PhoneInput({
  value = '',
  onChange,
  defaultCountry = 'TR',
  placeholder = 'Enter phone number',
  disabled = false,
  className,
  error = false,
  onValidationChange,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState<CountryCode>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [isValid, setIsValid] = React.useState<boolean>(true);

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          setCountryCode(parsed.country as CountryCode);
          setPhoneNumber(parsed.nationalNumber);
        }
      } catch (e) {
        // If parsing fails, set the value as-is
        setPhoneNumber(value);
      }
    }
  }, []);

  const handleCountryChange = (newCountry: string) => {
    setCountryCode(newCountry as CountryCode);
    updatePhoneNumber(phoneNumber, newCountry as CountryCode);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only numbers, spaces, dashes, and parentheses
    const cleaned = input.replace(/[^\d\s\-()]/g, '');
    setPhoneNumber(cleaned);
    updatePhoneNumber(cleaned, countryCode);
  };

  const updatePhoneNumber = (number: string, country: CountryCode) => {
    if (!number) {
      onChange?.('');
      setIsValid(true);
      onValidationChange?.(true);
      return;
    }

    const selectedCountryData = COUNTRIES.find(c => c.code === country);
    if (!selectedCountryData) return;

    // Construct full international number
    const fullNumber = selectedCountryData.dialCode + number.replace(/\D/g, '');

    // Validate
    const valid = isValidPhoneNumber(fullNumber, country);
    setIsValid(valid);
    onValidationChange?.(valid);

    onChange?.(fullNumber);
  };

  const handleBlur = () => {
    // Format the phone number on blur if valid
    if (phoneNumber && isValid) {
      try {
        const parsed = parsePhoneNumber(
          selectedCountry.dialCode + phoneNumber.replace(/\D/g, ''),
          countryCode
        );
        if (parsed) {
          setPhoneNumber(parsed.formatNational());
        }
      } catch (e) {
        // Keep the current value if formatting fails
      }
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="w-[140px]" aria-label="Country code">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map(country => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground">{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-9',
            (error || !isValid) && phoneNumber && 'border-red-500 focus-visible:ring-red-500'
          )}
          aria-label="Phone number"
          aria-invalid={!isValid}
        />
      </div>
    </div>
  );
}
