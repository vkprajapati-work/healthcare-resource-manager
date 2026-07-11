import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartCard } from './ChartCard';

import type { MonthlyTrendPoint } from '../types';

interface TrendAreaChartProps {
  title: string;
  subtitle?: string;
  data: MonthlyTrendPoint[];
}

/** Fixed blue/sky/emerald trio for this chart's 3 series — not a status/category breakdown, so chart-colors.ts's palettes don't apply here. */
const DOCTORS_COLOR = '#3b82f6';
const DRIVERS_COLOR = '#0ea5e9';
const VEHICLES_COLOR = '#10b981';

export function TrendAreaChart({ title, subtitle, data }: TrendAreaChartProps): JSX.Element {
  const latest = data[data.length - 1];
  const summary = latest
    ? `${title} — latest: ${latest.doctors} doctors, ${latest.drivers} drivers, ${latest.vehicles} vehicles`
    : title;

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="h-72" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="doctors"
              name="Doctors"
              stroke={DOCTORS_COLOR}
              fill={DOCTORS_COLOR}
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="drivers"
              name="Drivers"
              stroke={DRIVERS_COLOR}
              fill={DRIVERS_COLOR}
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="vehicles"
              name="Vehicles"
              stroke={VEHICLES_COLOR}
              fill={VEHICLES_COLOR}
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
