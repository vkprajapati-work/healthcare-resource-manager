import { buildFormData } from './form-data';

describe('buildFormData', () => {
  it('appends scalar fields, skips empty values, and repeats file entries', () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });

    const formData = buildFormData(
      { name: 'Asha', years: 12, active: true, optional: undefined, blank: '' },
      { photos: [fileA, fileB] },
    );

    expect(formData.get('name')).toBe('Asha');
    expect(formData.get('years')).toBe('12');
    expect(formData.get('active')).toBe('true');
    expect(formData.has('optional')).toBe(false);
    expect(formData.has('blank')).toBe(false);
    expect(formData.getAll('photos')).toHaveLength(2);
  });
});
