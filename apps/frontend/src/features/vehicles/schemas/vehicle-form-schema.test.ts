import { vehicleFormSchema } from './vehicle-form-schema';

const validVehicle = {
  registrationNumber: 'MH12AB1234',
  vehicleNumber: 'AMB-101',
  vehicleType: 'BASIC_AMBULANCE',
  brand: 'Force',
  model: 'Traveller',
  manufactureYear: '2022',
  color: 'White',
  seatingCapacity: '4',
  patientCapacity: '1',
  insuranceExpiry: '2027-01-01',
  fitnessExpiry: '2027-01-01',
  pollutionExpiry: '2026-12-01',
};

describe('vehicleFormSchema', () => {
  it('accepts a complete valid vehicle and coerces numeric strings', () => {
    const result = vehicleFormSchema.parse(validVehicle);
    expect(result.manufactureYear).toBe(2022);
    expect(result.seatingCapacity).toBe(4);
  });

  it('rejects a manufacture year before 1990', () => {
    const result = vehicleFormSchema.safeParse({ ...validVehicle, manufactureYear: '1980' });
    expect(result.success).toBe(false);
  });
});
