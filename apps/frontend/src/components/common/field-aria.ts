/**
 * Builds the aria props an input inside a FormField should spread, matching
 * FormField's `<id>-error` / `<id>-description` describedby convention.
 */
export function fieldAria(
  id: string,
  options: { error?: boolean; description?: boolean } = {},
): {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
} {
  const describedBy = [
    options.error ? `${id}-error` : null,
    options.description ? `${id}-description` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    id,
    'aria-invalid': Boolean(options.error),
    'aria-describedby': describedBy.length > 0 ? describedBy : undefined,
  };
}
