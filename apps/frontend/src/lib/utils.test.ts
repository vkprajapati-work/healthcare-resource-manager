import { cn } from './utils';

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', { hidden: false, block: true })).toBe('text-sm block');
  });
});
