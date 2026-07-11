import { cn, formatRetryWait } from './utils';

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', { hidden: false, block: true })).toBe('text-sm block');
  });
});

describe('formatRetryWait', () => {
  it('reports short waits in seconds and long waits in minutes', () => {
    expect(formatRetryWait(1)).toBe('1 second');
    expect(formatRetryWait(45)).toBe('45 seconds');
    expect(formatRetryWait(240)).toBe('about 4 minutes');
    expect(formatRetryWait(900)).toBe('about 15 minutes');
  });
});
