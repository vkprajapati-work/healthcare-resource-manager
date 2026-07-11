import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CATEGORY_PALETTE } from '../lib/chart-colors';

import { ChartCard } from './ChartCard';

import type { CategoryCount } from '../types';

interface BreakdownBarChartProps {
  title: string;
  data: CategoryCount[];
}

export function BreakdownBarChart({ title, data }: BreakdownBarChartProps): JSX.Element {
  const summary = data.map((item) => `${item.label} ${item.count}`).join(', ');

  return (
    <ChartCard title={title}>
      <div className="h-64" role="img" aria-label={`${title}: ${summary}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((item, index) => (
                <Cell key={item.label} fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* recharts renders nothing in jsdom (no layout, no ResizeObserver), so this
          duplicates the chart's data as real text — the only reliable way for
          screen readers and tests to reach it. */}
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.label}>{`${item.label}: ${item.count}`}</li>
        ))}
      </ul>
    </ChartCard>
  );
}
