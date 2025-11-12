/**
 * Field Mapping Utilities
 *
 * Utilities for converting between camelCase (frontend) and snake_case (backend)
 * Also handles Date object serialization.
 *
 * @module lib/utils/fieldMapping
 */

import { format, isDate, parseISO } from 'date-fns';

/**
 * Convert camelCase object to snake_case for API submission
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    let value = obj[key];

    // Convert Date objects to ISO date string (YYYY-MM-DD)
    if (isDate(value)) {
      value = format(value, 'yyyy-MM-dd');
    }

    // Recursively convert nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !isDate(value)) {
      value = toSnakeCase(value);
    }

    // Recursively convert arrays of objects
    if (Array.isArray(value)) {
      value = value.map(item => (item && typeof item === 'object' ? toSnakeCase(item) : item));
    }

    result[snakeKey] = value;
  }

  return result;
}

/**
 * Convert snake_case object to camelCase for frontend use
 */
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    let value = obj[key];

    // Try to parse date strings to Date objects
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        value = parseISO(value);
      } catch {
        // Keep as string if parsing fails
      }
    }

    // Recursively convert nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      value = toCamelCase(value);
    }

    // Recursively convert arrays of objects
    if (Array.isArray(value)) {
      value = value.map(item => (item && typeof item === 'object' ? toCamelCase(item) : item));
    }

    result[camelKey] = value;
  }

  return result;
}

/**
 * Format date for API submission (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date | string | undefined | null): string | undefined {
  if (!date) return undefined;

  if (typeof date === 'string') {
    return date;
  }

  if (isDate(date)) {
    return format(date, 'yyyy-MM-dd');
  }

  return undefined;
}

/**
 * Parse API date string to Date object
 */
export function parseAPIDate(dateString: string | undefined | null): Date | undefined {
  if (!dateString) return undefined;

  try {
    return parseISO(dateString);
  } catch {
    return undefined;
  }
}
