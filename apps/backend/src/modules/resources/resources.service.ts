import { NotFoundError } from '../../shared/errors.js';
import { buildPaginationMeta, getSkip } from '../../utils/pagination.js';
import type { IDoctorDocument } from '../doctors/doctors.types.js';
import type { IVehicleDocument } from '../vehicles/vehicles.types.js';
import { ResourcesRepository } from './resources.repository.js';
import {
  ResourceType,
  type CreateResourceInput,
  type IResourceDocument,
  type ResourceDto,
  type ResourceListMeta,
  type ResourceListQuery,
  type UpdateResourceInput,
} from './resources.types.js';

const getPopulatedFileUrl = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'fileUrl' in value) {
    return (value as { fileUrl: string }).fileUrl;
  }

  return undefined;
};

const getPopulatedDriverLocation = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'city' in value && 'state' in value) {
    const driver = value as { city: string; state: string };
    return `${driver.city}, ${driver.state}`;
  }

  return undefined;
};

const formatVehicleType = (vehicleType: string): string =>
  vehicleType
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export class ResourcesService {
  constructor(private readonly resourcesRepository = new ResourcesRepository()) {}

  /**
   * Merges three sources into one list: native `resources` documents, plus a read-only
   * projection of the `doctors` and `vehicles` collections (see PROJECT_CONTEXT.md §8a - those
   * modules stay the source of truth for their own rich data; this just makes them browsable
   * alongside plain resource entries). Pagination happens on the merged, sorted set, so every
   * source is fetched unpaginated first - fine at this app's scale, not meant to scale past a
   * few hundred total records without moving to a database-level union.
   */
  public async list(query: ResourceListQuery): Promise<{
    resources: ResourceDto[];
    meta: ResourceListMeta;
  }> {
    const includeDoctors = !query.type || query.type === ResourceType.DOCTOR;
    const includeAmbulances = !query.type || query.type === ResourceType.AMBULANCE;

    const [nativeResources, doctors, vehicles, nativeCounts, totalDoctorCount, totalVehicleCount] =
      await Promise.all([
        this.resourcesRepository.findAllMatching(query),
        includeDoctors
          ? this.resourcesRepository.findMatchingDoctors(query.search)
          : Promise.resolve([]),
        includeAmbulances
          ? this.resourcesRepository.findMatchingVehicles(query.search)
          : Promise.resolve([]),
        this.resourcesRepository.countByType(),
        this.resourcesRepository.countMatchingDoctors(),
        this.resourcesRepository.countMatchingVehicles(),
      ]);

    const merged = [
      ...nativeResources.map((resource) => this.toDto(resource)),
      ...doctors.map((doctor) => this.mapDoctorToDto(doctor)),
      ...vehicles.map((vehicle) => this.mapVehicleToDto(vehicle)),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalItems = merged.length;
    const skip = getSkip(query);
    const page = merged.slice(skip, skip + query.limit);

    return {
      resources: page,
      meta: {
        ...buildPaginationMeta(query, totalItems),
        counts: {
          [ResourceType.AMBULANCE]: nativeCounts[ResourceType.AMBULANCE] + totalVehicleCount,
          [ResourceType.DOCTOR]: nativeCounts[ResourceType.DOCTOR] + totalDoctorCount,
        },
      },
    };
  }

  public async getById(id: string): Promise<ResourceDto> {
    const resource = await this.resourcesRepository.findById(id);

    if (resource) {
      return this.toDto(resource);
    }

    const doctor = await this.resourcesRepository.findDoctorById(id);

    if (doctor) {
      return this.mapDoctorToDto(doctor);
    }

    const vehicle = await this.resourcesRepository.findVehicleById(id);

    if (vehicle) {
      return this.mapVehicleToDto(vehicle);
    }

    throw new NotFoundError('Resource not found');
  }

  public async create(input: CreateResourceInput): Promise<ResourceDto> {
    const resource = await this.resourcesRepository.create(input);
    return this.toDto(resource);
  }

  public async update(id: string, input: UpdateResourceInput): Promise<ResourceDto> {
    const resource = await this.resourcesRepository.updateById(id, input);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return this.toDto(resource);
  }

  public async delete(id: string): Promise<{ id: string }> {
    const resource = await this.resourcesRepository.deleteById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return { id };
  }

  private toDto(resource: IResourceDocument): ResourceDto {
    const dto: ResourceDto = {
      id: String(resource._id),
      type: resource.type,
      title: resource.title,
      description: resource.description,
      location: resource.location,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };

    if (resource.imageUrl) {
      dto.imageUrl = resource.imageUrl;
    }

    return dto;
  }

  private mapDoctorToDto(doctor: IDoctorDocument): ResourceDto {
    const dto: ResourceDto = {
      id: String(doctor._id),
      type: ResourceType.DOCTOR,
      title: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      description: `${doctor.specialization} • ${doctor.qualification} • ${doctor.yearsOfExperience} yrs experience`,
      location: `${doctor.city}, ${doctor.state}`,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    };

    const imageUrl = getPopulatedFileUrl(doctor.profileImage);
    if (imageUrl) {
      dto.imageUrl = imageUrl;
    }

    return dto;
  }

  private mapVehicleToDto(vehicle: IVehicleDocument): ResourceDto {
    const dto: ResourceDto = {
      id: String(vehicle._id),
      type: ResourceType.AMBULANCE,
      title: `${vehicle.brand} ${vehicle.model} (${vehicle.vehicleNumber})`,
      description: `${formatVehicleType(vehicle.vehicleType)} • Seats ${vehicle.seatingCapacity} • ${vehicle.patientCapacity} patient capacity`,
      location:
        getPopulatedDriverLocation(vehicle.assignedDriver) ?? 'Depot location not specified',
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    };

    const firstPhoto = Array.isArray(vehicle.photos) ? vehicle.photos[0] : undefined;
    const imageUrl = getPopulatedFileUrl(firstPhoto);
    if (imageUrl) {
      dto.imageUrl = imageUrl;
    }

    return dto;
  }
}
