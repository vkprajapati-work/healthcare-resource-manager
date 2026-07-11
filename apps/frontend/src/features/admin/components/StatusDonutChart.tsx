import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { STATUS_COLORS } from '../lib/chart-colors';

import { ChartCard } from './ChartCard';

import type { StatusCount } from '../types';

interface StatusDonutChartProps {
  title: string;
  data: StatusCount[];
}

export function StatusDonutChart({ title, data }: StatusDonutChartProps) {
  const summary = data.map((item) => `${item.label}: ${item.count}`).join(', ');

  return (
    <ChartCard title={title}>
      <div className="h-64" role="img" aria-label={`${title} — ${summary}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {data.map((item) => (
                <Cell key={item.status} fill={STATUS_COLORS[item.variant]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {data.map((item) => (
          <li key={item.status} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[item.variant] }}
            />
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.count}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
