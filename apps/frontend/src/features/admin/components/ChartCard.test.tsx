import { render, screen } from '@testing-library/react';

import { ChartCard } from './ChartCard';

describe('ChartCard', () => {
  it('renders the title and subtitle', () => {
    render(
      <ChartCard title="Doctor Availability" subtitle="By status">
        <p>Chart content</p>
      </ChartCard>,
    );

    expect(screen.getByText('Doctor Availability')).toBeInTheDocument();
    expect(screen.getByText('By status')).toBeInTheDocument();
  });

  it('omits the subtitle when none is given', () => {
    render(
      <ChartCard title="Doctor Availability">
        <p>Chart content</p>
      </ChartCard>,
    );

    expect(screen.getByText('Doctor Availability')).toBeInTheDocument();
    expect(screen.queryByText('By status')).not.toBeInTheDocument();
  });

  it('renders arbitrary children', () => {
    render(
      <ChartCard title="Doctor Availability">
        <p>Chart content</p>
      </ChartCard>,
    );

    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });
});
