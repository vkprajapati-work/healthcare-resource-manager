import { render, screen } from '@testing-library/react';

import { ComplianceTable } from './ComplianceTable';

import type { ComplianceAlert } from '../types';

const alerts: ComplianceAlert[] = [
  {
    id: 'alert-1',
    type: 'Insurance',
    entityName: 'MH-12-AB-1234',
    entityType: 'vehicle',
    expiresOn: '2026-07-20T00:00:00.000Z',
    daysRemaining: 9,
    severity: 'danger',
  },
  {
    id: 'alert-2',
    type: 'License',
    entityName: 'Ramesh Kumar',
    entityType: 'driver',
    expiresOn: '2026-08-05T00:00:00.000Z',
    daysRemaining: 25,
    severity: 'warning',
  },
];

describe('ComplianceTable', () => {
  it('renders the chart card heading and every alert row', () => {
    render(<ComplianceTable alerts={alerts} />);

    expect(screen.getByText('Compliance alerts')).toBeInTheDocument();
    expect(screen.getByText('Documents expiring soon')).toBeInTheDocument();

    for (const alert of alerts) {
      expect(screen.getByText(alert.entityName)).toBeInTheDocument();
      expect(screen.getByText(`${alert.daysRemaining} days`)).toBeInTheDocument();
    }
  });

  it('renders the empty state when there are no alerts', () => {
    render(<ComplianceTable alerts={[]} />);

    expect(
      screen.getByText('No compliance alerts — everything is up to date.'),
    ).toBeInTheDocument();
  });
});
