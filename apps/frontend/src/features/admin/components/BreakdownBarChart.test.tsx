import { render, screen } from '@testing-library/react';

import { BreakdownBarChart } from './BreakdownBarChart';

import type { CategoryCount } from '../types';

const data: CategoryCount[] = [
  { label: 'Cardiology', count: 18 },
  { label: 'Neurology', count: 12 },
  { label: 'Orthopedics', count: 9 },
];

describe('BreakdownBarChart', () => {
  it('renders the chart card title', () => {
    render(<BreakdownBarChart title="Doctors by department" data={data} />);

    expect(screen.getByText('Doctors by department')).toBeInTheDocument();
  });

  it('renders every category label and count', () => {
    render(<BreakdownBarChart title="Doctors by department" data={data} />);

    for (const item of data) {
      expect(screen.getByText(`${item.label}: ${item.count}`)).toBeInTheDocument();
    }
  });
});
