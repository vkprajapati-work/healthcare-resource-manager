import { render, screen } from '@testing-library/react';

import { StatusDonutChart } from './StatusDonutChart';

import type { StatusCount } from '../types';

const data: StatusCount[] = [
  { status: 'available', label: 'Available', count: 12, variant: 'success' },
  { status: 'busy', label: 'Busy', count: 5, variant: 'warning' },
  { status: 'off-duty', label: 'Off duty', count: 3, variant: 'neutral' },
];

describe('StatusDonutChart', () => {
  it('renders the title', () => {
    render(<StatusDonutChart title="Doctor availability" data={data} />);

    expect(screen.getByText('Doctor availability')).toBeInTheDocument();
  });

  it('renders every item label and count in the legend', () => {
    render(<StatusDonutChart title="Doctor availability" data={data} />);

    for (const item of data) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(String(item.count))).toBeInTheDocument();
    }
  });
});
