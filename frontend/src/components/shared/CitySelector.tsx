'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { City } from '@/types/services';
import { api } from '@/lib/api-client';

interface CitySelectorProps {
  value?: number;
  onChange: (cityId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function CitySelector({
  value,
  onChange,
  placeholder = 'Select city',
  disabled = false,
  error,
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await api.get<City[]>('/cities');
        setCities(data || []);
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="space-y-1">
      <Select
        value={value?.toString()}
        onValueChange={val => onChange(parseInt(val))}
        disabled={disabled || loading}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={loading ? 'Loading cities...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {cities.map(city => (
            <SelectItem key={city.id} value={city.id.toString()}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
