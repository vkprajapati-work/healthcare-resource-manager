/** Badge/chart color intent — matches components/ui/Badge.tsx's variant union. */
export type StatVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** One segment of a status breakdown (e.g. one slice of a doctor-availability donut). */
export interface StatusCount {
  status: string;
  label: string;
  count: number;
  variant: StatVariant;
}

/** One bar in a category breakdown (department, specialization, city, vehicle type). */
export interface CategoryCount {
  label: string;
  count: number;
}

export type ComplianceAlertType = 'Insurance' | 'Fitness' | 'Pollution' | 'License';
export type ComplianceSeverity = 'danger' | 'warning';

/** One row in the compliance table — a document expiring soon. */
export interface ComplianceAlert {
  id: string;
  type: ComplianceAlertType;
  entityName: string;
  entityType: 'vehicle' | 'driver';
  expiresOn: string;
  daysRemaining: number;
  severity: ComplianceSeverity;
}

/** One point on the growth trend chart. */
export interface MonthlyTrendPoint {
  month: string;
  doctors: number;
  drivers: number;
  vehicles: number;
}

/**
 * Full dashboard payload — shaped the way a future `GET /dashboard/stats`
 * endpoint would respond, so swapping the mock data source for a real
 * `useQuery` later doesn't require reshaping anything downstream.
 */
export interface DashboardStats {
  generatedAt: string;
  totals: {
    doctors: number;
    drivers: number;
    vehicles: number;
    activeAssignments: number;
  };
  doctorStatusBreakdown: StatusCount[];
  driverStatusBreakdown: StatusCount[];
  vehicleStatusBreakdown: StatusCount[];
  doctorsByDepartment: CategoryCount[];
  doctorsBySpecialization: CategoryCount[];
  doctorsByCity: CategoryCount[];
  vehiclesByType: CategoryCount[];
  complianceAlerts: ComplianceAlert[];
  monthlyTrend: MonthlyTrendPoint[];
}
