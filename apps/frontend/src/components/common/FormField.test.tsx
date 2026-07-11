import { render, screen } from '@testing-library/react';

import { Input } from '@/components/ui/Input';

import { fieldAria } from './field-aria';
import { FormField } from './FormField';

describe('FormField', () => {
  it('associates the label and announces the error via aria-describedby', () => {
    render(
      <FormField id="email" label="Email" error="Email is required">
        <Input {...fieldAria('email', { error: true })} />
      </FormField>,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('renders without error plumbing when the field is valid', () => {
    render(
      <FormField id="name" label="Name">
        <Input {...fieldAria('name')} />
      </FormField>,
    );

    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
