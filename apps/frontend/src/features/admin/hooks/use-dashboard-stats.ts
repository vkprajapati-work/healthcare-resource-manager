import { MOCK_DASHBOARD_STATS } from '../data/dashboard-mock-data';

import type { DashboardStats } from '../types';

/**
 * Returns the dashboard's stats, shaped like a TanStack Query result on
 * purpose — there's no `GET /dashboard/stats` endpoint yet, so this hands
 * back static sample data. `AdminDashboardPage` doesn't need to change when
 * this later becomes `useQuery({ queryKey: [...], queryFn: ... })`.
 */
export function useDashboardStats(): {
  data: DashboardStats;
  isPending: false;
  isError: false;
} {
  return { data: MOCK_DASHBOARD_STATS, isPending: false, isError: false };
}
