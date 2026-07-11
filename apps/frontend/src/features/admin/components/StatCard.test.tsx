import { render, screen } from '@testing-library/react';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders the label, value, and hint', () => {
    render(<StatCard label="Total Doctors" value="74" hint="Across 5 departments" />);

    expect(screen.getByText('Total Doctors')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
    expect(screen.getByText('Across 5 departments')).toBeInTheDocument();
  });

  it('omits the hint when none is given', () => {
    render(<StatCard label="Total Vehicles" value="32" />);

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });
});
