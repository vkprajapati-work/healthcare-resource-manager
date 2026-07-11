import type { StatVariant } from '../types';

/**
 * Exact Tailwind v3 default hexes for the shades Badge.tsx uses per variant
 * (bg-{color}-50/text-{color}-700 pill) — so a chart segment for, say,
 * "AVAILABLE" is the same visual color family as the Badge sitting next to
 * it, just at the -500 weight charts need for a filled shape.
 */
export const STATUS_COLORS: Record<StatVariant, string> = {
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#0ea5e9', // sky-500
  primary: '#3b82f6', // blue-500
  neutral: '#94a3b8', // slate-400
};

/** Sequential blue palette for non-status breakdowns (department, city, etc.). */
export const CATEGORY_PALETTE: string[] = [
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#2563eb', // blue-600
  '#93c5fd', // blue-300
  '#1d4ed8', // blue-700
  '#bfdbfe', // blue-200
  '#1e40af', // blue-800
];
