import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders the message as an alert and wires the retry action', async () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Failed to load resources." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load resources.');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when no handler is given', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
