import { doctorFormSchema } from './doctor-form-schema';

const validDoctor = {
  firstName: 'Asha',
  lastName: 'Verma',
  email: 'asha.verma@example.com',
  phoneNumber: '+919876543210',
  gender: 'FEMALE',
  dateOfBirth: '1985-04-12',
  specialization: 'Cardiology',
  qualification: 'MBBS, MD',
  licenseNumber: 'MH-DOC-1234',
  yearsOfExperience: '12',
  department: 'Cardiology',
  address: '12 Marine Drive',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  postalCode: '400001',
};

describe('doctorFormSchema', () => {
  it('accepts a complete valid doctor and coerces numeric strings', () => {
    const result = doctorFormSchema.parse(validDoctor);
    expect(result.yearsOfExperience).toBe(12);
    expect(result.email).toBe('asha.verma@example.com');
  });

  it('rejects an invalid phone number and a future date of birth', () => {
    const result = doctorFormSchema.safeParse({
      ...validDoctor,
      phoneNumber: '12',
      dateOfBirth: '2999-01-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toContain('phoneNumber');
      expect(fields).toContain('dateOfBirth');
    }
  });
});
