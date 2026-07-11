import { DoctorsService } from '../doctors/doctors.service.js';
import { AvailabilityStatus, Gender } from '../doctors/doctors.types.js';
import type { DoctorAccessContext, DoctorFormInput } from '../doctors/doctors.types.js';
import { DriversService } from '../drivers/drivers.service.js';
import { DriverAvailabilityStatus, DriverGender } from '../drivers/drivers.types.js';
import type { DriverAccessContext, DriverFormInput } from '../drivers/drivers.types.js';
import { UserRole } from '../auth/auth.types.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { VehicleStatus, VehicleType } from '../vehicles/vehicles.types.js';
import type { VehicleAccessContext, VehicleFormInput } from '../vehicles/vehicles.types.js';
import type { SeedSummary } from './seed.types.js';

export const DEFAULT_SEED_COUNT = 20;
export const MAX_SEED_COUNT = 50;

/**
 * Smallest valid PNG (1x1 transparent pixel). Seeded doctors/drivers/vehicles need a real
 * uploaded file to satisfy the existing upload pipeline (and the "at least one vehicle photo"
 * rule) without shipping binary fixture files in the repo or depending on the network.
 */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const buildMockUploadFile = (originalname: string): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype: 'image/png',
    size: PLACEHOLDER_PNG.length,
    buffer: PLACEHOLDER_PNG,
  }) as unknown as Express.Multer.File;

/** Picks pool[i], wrapping around; `stride` decorrelates two pools of the same size so pairing them by plain index doesn't always produce the same combination once a pool wraps. */
const pick = <T>(pool: readonly T[], index: number, stride = 1): T => {
  const item = pool[(((index * stride) % pool.length) + pool.length) % pool.length];
  if (!item) {
    throw new Error('Seed data pool must not be empty');
  }
  return item;
};

const FIRST_NAMES = [
  'Meera',
  'Karan',
  'Fatima',
  'Vikram',
  'Sanjay',
  'Arjun',
  'Priya',
  'Rohan',
  'Ananya',
  'Aditya',
  'Kavya',
  'Nikhil',
  'Sneha',
  'Rahul',
  'Divya',
  'Amit',
  'Pooja',
  'Vivek',
  'Neha',
  'Suresh',
] as const;

const LAST_NAMES = [
  'Iyer',
  'Mehta',
  'Khan',
  'Rao',
  'Gupta',
  'Reddy',
  'Sharma',
  'Nair',
  'Patel',
  'Singh',
  'Verma',
  'Joshi',
  'Menon',
  'Kapoor',
  'Desai',
  'Bose',
  'Chatterjee',
  'Pillai',
  'Agarwal',
  'Kulkarni',
] as const;

const CITY_STATES = [
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
] as const;

const SPECIALTIES = [
  { specialization: 'Cardiology', qualification: 'MBBS, MD Cardiology', department: 'Cardiology' },
  { specialization: 'Pediatrics', qualification: 'MBBS, DCH', department: 'Pediatrics' },
  { specialization: 'Orthopedics', qualification: 'MBBS, MS Ortho', department: 'Orthopedics' },
  { specialization: 'Neurology', qualification: 'MBBS, DM Neurology', department: 'Neurology' },
  {
    specialization: 'Dermatology',
    qualification: 'MBBS, MD Dermatology',
    department: 'Dermatology',
  },
  { specialization: 'ENT', qualification: 'MBBS, MS ENT', department: 'ENT' },
  {
    specialization: 'General Medicine',
    qualification: 'MBBS, MD Medicine',
    department: 'General Medicine',
  },
  { specialization: 'Gynecology', qualification: 'MBBS, MS Gynecology', department: 'Gynecology' },
  { specialization: 'Psychiatry', qualification: 'MBBS, MD Psychiatry', department: 'Psychiatry' },
  { specialization: 'Radiology', qualification: 'MBBS, MD Radiology', department: 'Radiology' },
] as const;

const VEHICLE_MODELS = [
  { brand: 'Force', model: 'Traveller' },
  { brand: 'Tata', model: 'Winger' },
  { brand: 'Mahindra', model: 'Bolero' },
  { brand: 'Toyota', model: 'Innova' },
  { brand: 'Maruti Suzuki', model: 'Eeco' },
  { brand: 'Ashok Leyland', model: 'Dost' },
  { brand: 'Tata', model: '407' },
  { brand: 'Mahindra', model: 'Marazzo' },
] as const;

const VEHICLE_TYPES = [
  VehicleType.BASIC_AMBULANCE,
  VehicleType.ADVANCED_AMBULANCE,
  VehicleType.ICU_AMBULANCE,
  VehicleType.NEONATAL_AMBULANCE,
] as const;

export class SeedService {
  constructor(
    private readonly doctorsService = new DoctorsService(),
    private readonly vehiclesService = new VehiclesService(),
    private readonly driversService = new DriversService(),
  ) {}

  /**
   * Creates `count` mock doctors, then `count` vehicles, then `count` drivers (in that order so
   * each driver can be assigned to an already-existing vehicle). Every record goes through the
   * same service methods and validation a real admin request would use - nothing here is a
   * shortcut around uniqueness checks, the vehicle-photo requirement, or login provisioning.
   */
  public async seedDemoData(requesterId: string, count: number): Promise<SeedSummary> {
    const suffix = Date.now();
    const doctorContext: DoctorAccessContext = { userId: requesterId, role: UserRole.ADMIN };
    const vehicleContext: VehicleAccessContext = { userId: requesterId, role: UserRole.ADMIN };
    const driverContext: DriverAccessContext = { userId: requesterId, role: UserRole.ADMIN };

    const doctors = await this.seedDoctors(doctorContext, suffix, count);
    const vehicles = await this.seedVehicles(vehicleContext, suffix, count);
    const drivers = await this.seedDrivers(driverContext, suffix, count, vehicles);

    return { doctors, vehicles, drivers };
  }

  private async seedDoctors(
    context: DoctorAccessContext,
    suffix: number,
    count: number,
  ): Promise<SeedSummary['doctors']> {
    const results: SeedSummary['doctors'] = [];

    for (let index = 0; index < count; index += 1) {
      const firstName = pick(FIRST_NAMES, index);
      const lastName = pick(LAST_NAMES, index, 7);
      const specialty = pick(SPECIALTIES, index);
      const location = pick(CITY_STATES, index, 3);

      const input: DoctorFormInput = {
        firstName,
        lastName,
        email: `dr.${firstName}.${lastName}.${suffix}.${index}@example.com`.toLowerCase(),
        phoneNumber: `+917${String(suffix).slice(-6)}${String(index).padStart(3, '0')}`,
        gender: index % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        dateOfBirth: new Date(1975 + (index % 25), index % 12, 10),
        specialization: specialty.specialization,
        qualification: specialty.qualification,
        licenseNumber: `MED-SEED-${suffix}-${index}`,
        yearsOfExperience: 3 + (index % 20),
        department: specialty.department,
        address: `${10 + index} Seed Layout`,
        city: location.city,
        state: location.state,
        country: 'India',
        postalCode: '560001',
        documents: [],
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        isActive: true,
      };

      const result = await this.doctorsService.createFromForm(
        input,
        { profileImage: [buildMockUploadFile(`doctor-${index}.png`)] },
        context,
      );

      results.push({
        id: result.doctor.id,
        name: `${result.doctor.firstName} ${result.doctor.lastName}`,
        email: result.doctor.email,
        ...(result.login ? { defaultPassword: result.login.defaultPassword } : {}),
      });
    }

    return results;
  }

  private async seedVehicles(
    context: VehicleAccessContext,
    suffix: number,
    count: number,
  ): Promise<SeedSummary['vehicles']> {
    const results: SeedSummary['vehicles'] = [];
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    for (let index = 0; index < count; index += 1) {
      const vehicleModel = pick(VEHICLE_MODELS, index);
      const vehicleType = pick(VEHICLE_TYPES, index);

      const input: VehicleFormInput = {
        registrationNumber: `SEED-${suffix}-${index}`,
        vehicleNumber: `AMB-SEED-${suffix}-${index}`,
        vehicleType,
        brand: vehicleModel.brand,
        model: vehicleModel.model,
        manufactureYear: 2018 + (index % 8),
        color: index % 2 === 0 ? 'White' : 'White with Red Stripe',
        seatingCapacity: 2 + (index % 3),
        patientCapacity: 1 + (index % 2),
        photos: [],
        documents: [],
        insuranceExpiry: futureDate,
        fitnessExpiry: futureDate,
        pollutionExpiry: futureDate,
        status: VehicleStatus.AVAILABLE,
        isActive: true,
      };

      const vehicle = await this.vehiclesService.createFromForm(
        input,
        { photos: [buildMockUploadFile(`vehicle-${index}.png`)] },
        context,
      );

      results.push({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
      });
    }

    return results;
  }

  private async seedDrivers(
    context: DriverAccessContext,
    suffix: number,
    count: number,
    vehicles: SeedSummary['vehicles'],
  ): Promise<SeedSummary['drivers']> {
    const results: SeedSummary['drivers'] = [];
    const licenseExpiry = new Date();
    licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 5);

    for (let index = 0; index < count; index += 1) {
      const firstName = pick(FIRST_NAMES, index, 11);
      const lastName = pick(LAST_NAMES, index, 13);
      const location = pick(CITY_STATES, index, 7);

      const input: DriverFormInput = {
        firstName,
        lastName,
        email: `drv.${firstName}.${lastName}.${suffix}.${index}@example.com`.toLowerCase(),
        phoneNumber: `+918${String(suffix).slice(-6)}${String(index).padStart(3, '0')}`,
        gender: index % 2 === 0 ? DriverGender.MALE : DriverGender.FEMALE,
        dateOfBirth: new Date(1985 + (index % 20), index % 12, 5),
        employeeId: `DRV-SEED-${suffix}-${index}`,
        joiningDate: new Date(2018 + (index % 8), index % 12, 1),
        licenseNumber: `DL-SEED-${suffix}-${index}`,
        licenseExpiry,
        yearsOfExperience: 2 + (index % 18),
        address: `${20 + index} Seed Layout`,
        city: location.city,
        state: location.state,
        country: 'India',
        postalCode: '560001',
        documents: [],
        availabilityStatus: DriverAvailabilityStatus.AVAILABLE,
        isActive: true,
      };

      const assignedVehicleId = vehicles[index]?.id;
      if (assignedVehicleId) {
        input.assignedVehicle = assignedVehicleId;
      }

      const result = await this.driversService.createFromForm(
        input,
        { profileImage: [buildMockUploadFile(`driver-${index}.png`)] },
        context,
      );

      results.push({
        id: result.driver.id,
        name: `${result.driver.firstName} ${result.driver.lastName}`,
        email: result.driver.email,
        ...(result.login ? { defaultPassword: result.login.defaultPassword } : {}),
        ...(result.driver.assignedVehicle
          ? { assignedVehicle: result.driver.assignedVehicle.id }
          : {}),
      });
    }

    return results;
  }
}
