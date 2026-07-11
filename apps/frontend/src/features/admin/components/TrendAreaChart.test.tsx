import { render, screen } from '@testing-library/react';

import { TrendAreaChart } from './TrendAreaChart';

import type { MonthlyTrendPoint } from '../types';

const DATA: MonthlyTrendPoint[] = [
  { month: 'May', doctors: 67, drivers: 24, vehicles: 19 },
  { month: 'Jun', doctors: 70, drivers: 26, vehicles: 21 },
  { month: 'Jul', doctors: 74, drivers: 28, vehicles: 22 },
];

describe('TrendAreaChart', () => {
  it('renders the title and subtitle', () => {
    render(<TrendAreaChart title="Growth trend" subtitle="Last 6 months" data={DATA} />);

    expect(screen.getByText('Growth trend')).toBeInTheDocument();
    expect(screen.getByText('Last 6 months')).toBeInTheDocument();
  });

  it('mounts without a subtitle', () => {
    render(<TrendAreaChart title="Growth trend" data={DATA} />);

    expect(screen.getByText('Growth trend')).toBeInTheDocument();
  });
});
