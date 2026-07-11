import { render, screen } from '@testing-library/react';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('announces itself as a polite status region with the given label', () => {
    render(<Spinner label="Loading resources" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Loading resources');
  });
});
