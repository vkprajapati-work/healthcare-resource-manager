import { Badge } from '@/components/ui/Badge';

import { BreakdownBarChart } from './BreakdownBarChart';
import { ComplianceTable } from './ComplianceTable';
import { StatCard } from './StatCard';
import { StatusDonutChart } from './StatusDonutChart';
import { TrendAreaChart } from './TrendAreaChart';
import { useDashboardStats } from '../hooks/use-dashboard-stats';

/**
 * Sample-data 360° overview — no `GET /dashboard/stats` endpoint exists yet,
 * so every number here comes from `useDashboardStats()`'s static mock data.
 * Swapping that hook for a real query later doesn't require touching this
 * page's layout.
 */
export function AdminDashboardPage() {
  const { data } = useDashboardStats();

  return (
    <section className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
          <Badge variant="info">Sample data</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Illustrative figures — connect live reporting once the aggregation endpoint ships.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total doctors" value={data.totals.doctors} />
        <StatCard label="Total drivers" value={data.totals.drivers} />
        <StatCard label="Total vehicles" value={data.totals.vehicles} />
        <StatCard
          label="Active assignments"
          value={data.totals.activeAssignments}
          hint="Drivers currently assigned to a vehicle"
        />
      </div>

      <TrendAreaChart
        title="Growth over the last 6 months"
        subtitle="Doctors, drivers, and vehicles onboarded"
        data={data.monthlyTrend}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatusDonutChart title="Doctor availability" data={data.doctorStatusBreakdown} />
        <StatusDonutChart title="Driver availability" data={data.driverStatusBreakdown} />
        <StatusDonutChart title="Vehicle status" data={data.vehicleStatusBreakdown} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BreakdownBarChart title="Doctors by department" data={data.doctorsByDepartment} />
        <BreakdownBarChart title="Doctors by specialization" data={data.doctorsBySpecialization} />
        <BreakdownBarChart title="Doctors by city" data={data.doctorsByCity} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBarChart title="Vehicles by type" data={data.vehiclesByType} />
        <ComplianceTable alerts={data.complianceAlerts} />
      </div>
    </section>
  );
}
