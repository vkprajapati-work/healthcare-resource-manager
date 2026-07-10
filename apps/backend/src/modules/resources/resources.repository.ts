import type { FilterQuery, UpdateQuery } from 'mongoose';
import { DoctorModel } from '../doctors/doctors.model.js';
import type { IDoctorDocument } from '../doctors/doctors.types.js';
import { VehicleModel } from '../vehicles/vehicles.model.js';
import type { IVehicleDocument } from '../vehicles/vehicles.types.js';
import { ResourceModel } from './resources.model.js';
import { ResourceType, type IResourceDocument, type ResourceListQuery } from './resources.types.js';

type ResourceFilter = Pick<ResourceListQuery, 'type' | 'search'>;

export class ResourcesRepository {
  public async create(input: Partial<IResourceDocument>): Promise<IResourceDocument> {
    const resource = await ResourceModel.create(input);
    return resource.toObject() as IResourceDocument;
  }

  public async findById(id: string): Promise<IResourceDocument | null> {
    return ResourceModel.findById(id).lean<IResourceDocument>().exec();
  }

  /**
   * All native resources matching the filter, unpaginated - the service merges this with
   * doctors/vehicles (see below) and paginates the combined set, so pagination can't be
   * pushed down to a single collection's query.
   */
  public async findAllMatching(query: ResourceFilter): Promise<IResourceDocument[]> {
    return ResourceModel.find(this.buildFilter(query))
      .sort({ createdAt: -1 })
      .lean<IResourceDocument[]>()
      .exec();
  }

  public async countByType(): Promise<Record<ResourceType, number>> {
    const [ambulance, doctor] = await Promise.all([
      ResourceModel.countDocuments({ type: ResourceType.AMBULANCE }).exec(),
      ResourceModel.countDocuments({ type: ResourceType.DOCTOR }).exec(),
    ]);

    return {
      [ResourceType.AMBULANCE]: ambulance,
      [ResourceType.DOCTOR]: doctor,
    };
  }

  public async updateById(
    id: string,
    input: UpdateQuery<IResourceDocument>,
  ): Promise<IResourceDocument | null> {
    return ResourceModel.findByIdAndUpdate(id, input, { new: true, runValidators: true })
      .lean<IResourceDocument>()
      .exec();
  }

  public async deleteById(id: string): Promise<IResourceDocument | null> {
    return ResourceModel.findByIdAndDelete(id).lean<IResourceDocument>().exec();
  }

  /**
   * Bridges the `doctors` module into the unified resources list (read-only - see
   * PROJECT_CONTEXT.md §8a). Only active, non-deleted doctors are included; `resources` is the
   * public browsing view, not the admin management view `/doctors` already provides.
   */
  public async findMatchingDoctors(search?: string): Promise<IDoctorDocument[]> {
    return DoctorModel.find(this.buildDoctorFilter(search))
      .populate('profileImage')
      .lean<IDoctorDocument[]>()
      .exec();
  }

  public async countMatchingDoctors(): Promise<number> {
    return DoctorModel.countDocuments(this.buildDoctorFilter()).exec();
  }

  public async findDoctorById(id: string): Promise<IDoctorDocument | null> {
    return DoctorModel.findOne({ _id: id, isActive: true, deletedAt: { $exists: false } })
      .populate('profileImage')
      .lean<IDoctorDocument>()
      .exec();
  }

  /** Bridges the `vehicles` module into the unified resources list as ambulances (read-only). */
  public async findMatchingVehicles(search?: string): Promise<IVehicleDocument[]> {
    return VehicleModel.find(this.buildVehicleFilter(search))
      .populate('photos')
      .populate('assignedDriver')
      .lean<IVehicleDocument[]>()
      .exec();
  }

  public async countMatchingVehicles(): Promise<number> {
    return VehicleModel.countDocuments(this.buildVehicleFilter()).exec();
  }

  public async findVehicleById(id: string): Promise<IVehicleDocument | null> {
    return VehicleModel.findOne({ _id: id, isActive: true, deletedAt: { $exists: false } })
      .populate('photos')
      .populate('assignedDriver')
      .lean<IVehicleDocument>()
      .exec();
  }

  private buildFilter(query: ResourceFilter): FilterQuery<IResourceDocument> {
    const filter: FilterQuery<IResourceDocument> = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return filter;
  }

  private buildDoctorFilter(search?: string): FilterQuery<IDoctorDocument> {
    const filter: FilterQuery<IDoctorDocument> = { isActive: true, deletedAt: { $exists: false } };

    if (search) {
      filter.$text = { $search: search };
    }

    return filter;
  }

  private buildVehicleFilter(search?: string): FilterQuery<IVehicleDocument> {
    const filter: FilterQuery<IVehicleDocument> = { isActive: true, deletedAt: { $exists: false } };

    if (search) {
      filter.$text = { $search: search };
    }

    return filter;
  }
}
