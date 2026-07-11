import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "ON_LEAVE" → "On leave" — humanizes SCREAMING_SNAKE_CASE enum values. */
export function formatEnumLabel(value: string): string {
  const words = value.replaceAll('_', ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** 45 → "45 seconds", 240 → "about 4 minutes" — for rate-limit wait hints. */
export function formatRetryWait(seconds: number): string {
  if (seconds < 90) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `about ${minutes} minutes`;
}
