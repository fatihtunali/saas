/**
 * Password Strength Indicator Component
 * Phase 9: User Management & Permissions
 */

'use client';

import { cn } from '@/lib/utils';
import { checkPasswordStrength, type PasswordStrengthResult } from '@/lib/validations/users';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

const strengthColors = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
  very_strong: 'bg-emerald-500',
};

const strengthLabels = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
  very_strong: 'Very Strong',
};

export function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);

  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }

    const result = checkPasswordStrength(password);
    setStrength(result);
  }, [password]);

  if (!password || !strength) {
    return null;
  }

  const filledBars = strength.score;
  const strengthColor = strengthColors[strength.strength];
  const strengthLabel = strengthLabels[strength.strength];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password Strength</span>
          <span
            className={cn('font-medium', {
              'text-red-600': strength.strength === 'weak',
              'text-orange-600': strength.strength === 'fair',
              'text-yellow-600': strength.strength === 'good',
              'text-green-600': strength.strength === 'strong',
              'text-emerald-600': strength.strength === 'very_strong',
            })}
          >
            {strengthLabel}
          </span>
        </div>

        <div className="flex gap-1 h-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 rounded-full transition-colors',
                index < filledBars ? strengthColor : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5 text-xs">
          <RequirementItem met={strength.requirements.min_length} label="At least 8 characters" />
          <RequirementItem met={strength.requirements.has_uppercase} label="One uppercase letter" />
          <RequirementItem met={strength.requirements.has_lowercase} label="One lowercase letter" />
          <RequirementItem met={strength.requirements.has_number} label="One number" />
          <RequirementItem
            met={strength.requirements.has_special}
            label="One special character (recommended)"
            optional
          />
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  label: string;
  optional?: boolean;
}

function RequirementItem({ met, label, optional = false }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
      )}
      <span
        className={cn(
          'text-xs',
          met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground',
          optional && !met && 'italic'
        )}
      >
        {label}
      </span>
    </div>
  );
}
