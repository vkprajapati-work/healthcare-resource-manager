import type { FilterQuery, SortOrder } from 'mongoose';
import { DriverModel } from './drivers.model.js';
import type {
  CreateDriverInput,
  DriverListQuery,
  IDriverDocument,
  UpdateDriverInput,
} from './drivers.types.js';

const populateRefs = [
  { path: 'profileImage', model: 'File' },
  { path: 'documents', model: 'File' },
  { path: 'assignedVehicle', model: 'Vehicle' },
];

export class DriversRepository {
  public async create(input: CreateDriverInput): Promise<IDriverDocument> {
    const driver = await DriverModel.create(input);
    const populatedDriver = await this.findById(String(driver._id), true);
    return populatedDriver ?? (driver.toObject() as IDriverDocument);
  }

  public async findById(id: string, includeDeleted = false): Promise<IDriverDocument | null> {
    const query: FilterQuery<IDriverDocument> = { _id: id };

    if (!includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    return DriverModel.findOne(query).populate(populateRefs).lean<IDriverDocument>().exec();
  }

  public async findByUserId(userId: string): Promise<IDriverDocument | null> {
    return DriverModel.findOne({ userId, deletedAt: { $exists: false } })
      .populate(populateRefs)
      .lean<IDriverDocument>()
      .exec();
  }

  public async findMany(query: DriverListQuery): Promise<IDriverDocument[]> {
    return DriverModel.find(this.buildFilter(query))
      .sort(this.buildSort(query))
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate(populateRefs)
      .lean<IDriverDocument[]>()
      .exec();
  }

  public async countMany(query: DriverListQuery): Promise<number> {
    return DriverModel.countDocuments(this.buildFilter(query)).exec();
  }

  public async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('email', email, excludeId);
  }

  public async existsByPhoneNumber(phoneNumber: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('phoneNumber', phoneNumber, excludeId);
  }

  public async existsByEmployeeId(employeeId: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('employeeId', employeeId, excludeId);
  }

  public async existsByLicenseNumber(licenseNumber: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('licenseNumber', licenseNumber, excludeId);
  }

  public async updateById(id: string, input: UpdateDriverInput): Promise<IDriverDocument | null> {
    await DriverModel.findOneAndUpdate({ _id: id, deletedAt: { $exists: false } }, input, {
      runValidators: true,
    }).exec();

    return this.findById(id);
  }

  public async clearAssignedVehicle(driverId: string): Promise<void> {
    await DriverModel.findByIdAndUpdate(driverId, { $unset: { assignedVehicle: 1 } }).exec();
  }

  public async setAssignedVehicle(driverId: string, vehicleId: string): Promise<void> {
    await DriverModel.findByIdAndUpdate(driverId, { assignedVehicle: vehicleId }).exec();
  }

  public async softDeleteById(id: string): Promise<IDriverDocument | null> {
    await DriverModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { isActive: false, deletedAt: new Date(), $unset: { assignedVehicle: 1 } },
      { runValidators: true },
    ).exec();

    return this.findById(id, true);
  }

  private async existsByField(
    field: 'email' | 'phoneNumber' | 'employeeId' | 'licenseNumber',
    value: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query: FilterQuery<IDriverDocument> = {
      [field]: value,
      deletedAt: { $exists: false },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const result = await DriverModel.exists(query).exec();
    return result !== null;
  }

  private buildFilter(query: DriverListQuery): FilterQuery<IDriverDocument> {
    const filter: FilterQuery<IDriverDocument> = { deletedAt: { $exists: false } };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.city) {
      filter.city = query.city;
    }

    if (query.state) {
      filter.state = query.state;
    }

    if (query.availabilityStatus) {
      filter.availabilityStatus = query.availabilityStatus;
    }

    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    return filter;
  }

  private buildSort(query: DriverListQuery): Record<string, SortOrder> {
    return { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }
}
