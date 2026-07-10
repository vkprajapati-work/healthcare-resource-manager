import { jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors.js';
import type { IDoctorDocument } from '../doctors/doctors.types.js';
import type { IVehicleDocument } from '../vehicles/vehicles.types.js';
import type { ResourcesRepository } from './resources.repository.js';
import { ResourcesService } from './resources.service.js';
import { ResourceType, type IResourceDocument } from './resources.types.js';

const buildResource = (overrides: Partial<IResourceDocument> = {}): IResourceDocument =>
  ({
    _id: '665f1c2e8b3e2a0012345678',
    type: ResourceType.AMBULANCE,
    title: 'City Ambulance Service',
    description: '24/7 emergency response',
    location: 'Berlin, DE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }) as unknown as IResourceDocument;

const buildDoctor = (overrides: Partial<IDoctorDocument> = {}): IDoctorDocument =>
  ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    firstName: 'Meera',
    lastName: 'Iyer',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    yearsOfExperience: 10,
    city: 'Chennai',
    state: 'Tamil Nadu',
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    ...overrides,
  }) as unknown as IDoctorDocument;

const buildVehicle = (overrides: Partial<IVehicleDocument> = {}): IVehicleDocument =>
  ({
    _id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
    registrationNumber: 'KA01AB1234',
    vehicleNumber: 'AMB-005',
    vehicleType: 'BASIC_AMBULANCE',
    brand: 'Force',
    model: 'Traveller',
    seatingCapacity: 4,
    patientCapacity: 1,
    photos: [],
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    ...overrides,
  }) as unknown as IVehicleDocument;

const buildMockRepository = () => ({
  create: jest.fn<() => Promise<IResourceDocument>>(),
  findById: jest.fn<() => Promise<IResourceDocument | null>>(),
  findAllMatching: jest.fn<() => Promise<IResourceDocument[]>>(),
  countByType: jest.fn<() => Promise<Record<ResourceType, number>>>(),
  updateById: jest.fn<() => Promise<IResourceDocument | null>>(),
  deleteById: jest.fn<() => Promise<IResourceDocument | null>>(),
  findMatchingDoctors: jest.fn<() => Promise<IDoctorDocument[]>>(),
  countMatchingDoctors: jest.fn<() => Promise<number>>(),
  findDoctorById: jest.fn<() => Promise<IDoctorDocument | null>>(),
  findMatchingVehicles: jest.fn<() => Promise<IVehicleDocument[]>>(),
  countMatchingVehicles: jest.fn<() => Promise<number>>(),
  findVehicleById: jest.fn<() => Promise<IVehicleDocument | null>>(),
});

describe('ResourcesService', () => {
  let repository: ReturnType<typeof buildMockRepository>;
  let service: ResourcesService;

  beforeEach(() => {
    repository = buildMockRepository();
    service = new ResourcesService(repository as unknown as ResourcesRepository);

    repository.findAllMatching.mockResolvedValue([]);
    repository.findMatchingDoctors.mockResolvedValue([]);
    repository.findMatchingVehicles.mockResolvedValue([]);
    repository.countByType.mockResolvedValue({
      [ResourceType.AMBULANCE]: 0,
      [ResourceType.DOCTOR]: 0,
    });
    repository.countMatchingDoctors.mockResolvedValue(0);
    repository.countMatchingVehicles.mockResolvedValue(0);
  });

  describe('list', () => {
    it('maps native documents to DTOs and builds pagination + type-count meta', async () => {
      repository.findAllMatching.mockResolvedValue([buildResource()]);
      repository.countByType.mockResolvedValue({
        [ResourceType.AMBULANCE]: 1,
        [ResourceType.DOCTOR]: 0,
      });

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources).toEqual([
        {
          id: '665f1c2e8b3e2a0012345678',
          type: ResourceType.AMBULANCE,
          title: 'City Ambulance Service',
          description: '24/7 emergency response',
          location: 'Berlin, DE',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        counts: { [ResourceType.AMBULANCE]: 1, [ResourceType.DOCTOR]: 0 },
      });
    });

    it('omits imageUrl from the DTO when the resource has none', async () => {
      repository.findAllMatching.mockResolvedValue([buildResource()]);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources[0]).not.toHaveProperty('imageUrl');
    });

    it('returns an out-of-range page as an empty list with valid meta, not an error', async () => {
      repository.findAllMatching.mockResolvedValue(
        Array.from({ length: 5 }, (_, index) =>
          buildResource({ _id: `id-${index}` as unknown as IResourceDocument['_id'] }),
        ),
      );
      repository.countByType.mockResolvedValue({
        [ResourceType.AMBULANCE]: 3,
        [ResourceType.DOCTOR]: 2,
      });

      const result = await service.list({ page: 99, limit: 10 });

      expect(result.resources).toEqual([]);
      expect(result.meta.totalItems).toBe(5);
      expect(result.meta.totalPages).toBe(1);
    });

    it('bridges an active doctor into the merged list, mapped to the resource shape', async () => {
      repository.findMatchingDoctors.mockResolvedValue([buildDoctor()]);
      repository.countMatchingDoctors.mockResolvedValue(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources).toEqual([
        expect.objectContaining({
          id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          type: ResourceType.DOCTOR,
          title: 'Dr. Meera Iyer',
          description: 'Cardiology • MBBS, MD • 10 yrs experience',
          location: 'Chennai, Tamil Nadu',
        }),
      ]);
      expect(result.meta.counts[ResourceType.DOCTOR]).toBe(1);
    });

    it('bridges an active vehicle into the merged list as an ambulance', async () => {
      repository.findMatchingVehicles.mockResolvedValue([buildVehicle()]);
      repository.countMatchingVehicles.mockResolvedValue(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources).toEqual([
        expect.objectContaining({
          id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
          type: ResourceType.AMBULANCE,
          title: 'Force Traveller (AMB-005)',
          location: 'Depot location not specified',
        }),
      ]);
      expect(result.meta.counts[ResourceType.AMBULANCE]).toBe(1);
    });

    it('uses the assigned driver location when a vehicle has one populated', async () => {
      repository.findMatchingVehicles.mockResolvedValue([
        buildVehicle({
          assignedDriver: { city: 'Mumbai', state: 'Maharashtra' } as unknown as NonNullable<
            IVehicleDocument['assignedDriver']
          >,
        }),
      ]);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources[0]).toMatchObject({ location: 'Mumbai, Maharashtra' });
    });

    it('skips fetching doctors when filtering to type=ambulance', async () => {
      await service.list({ page: 1, limit: 10, type: ResourceType.AMBULANCE });

      expect(repository.findMatchingDoctors).not.toHaveBeenCalled();
      expect(repository.findMatchingVehicles).toHaveBeenCalled();
    });

    it('skips fetching vehicles when filtering to type=doctor', async () => {
      await service.list({ page: 1, limit: 10, type: ResourceType.DOCTOR });

      expect(repository.findMatchingVehicles).not.toHaveBeenCalled();
      expect(repository.findMatchingDoctors).toHaveBeenCalled();
    });

    it('reports total counts regardless of the active type filter', async () => {
      repository.countByType.mockResolvedValue({
        [ResourceType.AMBULANCE]: 2,
        [ResourceType.DOCTOR]: 1,
      });
      repository.countMatchingDoctors.mockResolvedValue(4);
      repository.countMatchingVehicles.mockResolvedValue(3);

      const result = await service.list({ page: 1, limit: 10, type: ResourceType.DOCTOR });

      expect(result.meta.counts).toEqual({
        [ResourceType.AMBULANCE]: 5,
        [ResourceType.DOCTOR]: 5,
      });
    });

    it('sorts the merged set by createdAt descending across all three sources', async () => {
      repository.findAllMatching.mockResolvedValue([
        buildResource({ title: 'oldest-native', createdAt: new Date('2026-01-01') }),
      ]);
      repository.findMatchingDoctors.mockResolvedValue([
        buildDoctor({ createdAt: new Date('2026-03-01') }),
      ]);
      repository.findMatchingVehicles.mockResolvedValue([
        buildVehicle({ createdAt: new Date('2026-02-01') }),
      ]);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.resources.map((r) => r.type)).toEqual([
        ResourceType.DOCTOR,
        ResourceType.AMBULANCE,
        ResourceType.AMBULANCE,
      ]);
    });
  });

  describe('getById', () => {
    it('throws NotFoundError when the id exists in none of the three sources', async () => {
      repository.findById.mockResolvedValue(null);
      repository.findDoctorById.mockResolvedValue(null);
      repository.findVehicleById.mockResolvedValue(null);

      await expect(service.getById('missing-id')).rejects.toThrow(NotFoundError);
    });

    it('returns the mapped DTO when found as a native resource', async () => {
      repository.findById.mockResolvedValue(buildResource());

      const result = await service.getById('665f1c2e8b3e2a0012345678');

      expect(result.id).toBe('665f1c2e8b3e2a0012345678');
    });

    it('falls through to doctors when the id is not a native resource', async () => {
      repository.findById.mockResolvedValue(null);
      repository.findDoctorById.mockResolvedValue(buildDoctor());

      const result = await service.getById('aaaaaaaaaaaaaaaaaaaaaaaa');

      expect(result).toMatchObject({ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', type: ResourceType.DOCTOR });
    });

    it('falls through to vehicles when the id is neither a native resource nor a doctor', async () => {
      repository.findById.mockResolvedValue(null);
      repository.findDoctorById.mockResolvedValue(null);
      repository.findVehicleById.mockResolvedValue(buildVehicle());

      const result = await service.getById('bbbbbbbbbbbbbbbbbbbbbbbb');

      expect(result).toMatchObject({
        id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
        type: ResourceType.AMBULANCE,
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundError when updating a missing resource', async () => {
      repository.updateById.mockResolvedValue(null);

      await expect(service.update('missing-id', { title: 'New title' })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('throws NotFoundError when deleting a missing resource', async () => {
      repository.deleteById.mockResolvedValue(null);

      await expect(service.delete('missing-id')).rejects.toThrow(NotFoundError);
    });

    it('returns the deleted id on success', async () => {
      repository.deleteById.mockResolvedValue(buildResource());

      const result = await service.delete('665f1c2e8b3e2a0012345678');

      expect(result).toEqual({ id: '665f1c2e8b3e2a0012345678' });
    });
  });
});
