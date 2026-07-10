import type { FilterQuery, SortOrder } from 'mongoose';
import { VehicleModel } from './vehicles.model.js';
import type {
  CreateVehicleInput,
  IVehicleDocument,
  UpdateVehicleInput,
  VehicleListQuery,
} from './vehicles.types.js';

const populateRefs = [
  { path: 'photos', model: 'File' },
  { path: 'documents', model: 'File' },
  { path: 'assignedDriver', model: 'Driver' },
];

export class VehiclesRepository {
  public async create(input: CreateVehicleInput): Promise<IVehicleDocument> {
    const vehicle = await VehicleModel.create(input);
    const populatedVehicle = await this.findById(String(vehicle._id), true);
    return populatedVehicle ?? (vehicle.toObject() as IVehicleDocument);
  }

  public async findById(id: string, includeDeleted = false): Promise<IVehicleDocument | null> {
    const query: FilterQuery<IVehicleDocument> = { _id: id };

    if (!includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    return VehicleModel.findOne(query).populate(populateRefs).lean<IVehicleDocument>().exec();
  }

  public async findByAssignedDriver(driverId: string): Promise<IVehicleDocument | null> {
    return VehicleModel.findOne({ assignedDriver: driverId, deletedAt: { $exists: false } })
      .populate(populateRefs)
      .lean<IVehicleDocument>()
      .exec();
  }

  public async findActiveByAssignedDriver(
    driverId: string,
    excludeVehicleId?: string,
  ): Promise<IVehicleDocument | null> {
    const query: FilterQuery<IVehicleDocument> = {
      assignedDriver: driverId,
      isActive: true,
      deletedAt: { $exists: false },
    };

    if (excludeVehicleId) {
      query._id = { $ne: excludeVehicleId };
    }

    return VehicleModel.findOne(query).lean<IVehicleDocument>().exec();
  }

  public async findMany(query: VehicleListQuery): Promise<IVehicleDocument[]> {
    return VehicleModel.find(this.buildFilter(query))
      .sort(this.buildSort(query))
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate(populateRefs)
      .lean<IVehicleDocument[]>()
      .exec();
  }

  public async countMany(query: VehicleListQuery): Promise<number> {
    return VehicleModel.countDocuments(this.buildFilter(query)).exec();
  }

  public async existsByRegistrationNumber(
    registrationNumber: string,
    excludeId?: string,
  ): Promise<boolean> {
    return this.existsByField('registrationNumber', registrationNumber.toUpperCase(), excludeId);
  }

  public async existsByVehicleNumber(vehicleNumber: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('vehicleNumber', vehicleNumber.toUpperCase(), excludeId);
  }

  public async updateById(
    id: string,
    input: UpdateVehicleInput,
  ): Promise<IVehicleDocument | null> {
    await VehicleModel.findOneAndUpdate({ _id: id, deletedAt: { $exists: false } }, input, {
      runValidators: true,
    }).exec();

    return this.findById(id);
  }

  public async clearAssignedDriver(vehicleId: string): Promise<void> {
    await VehicleModel.findByIdAndUpdate(vehicleId, { $unset: { assignedDriver: 1 } }).exec();
  }

  public async setAssignedDriver(vehicleId: string, driverId: string): Promise<void> {
    await VehicleModel.findByIdAndUpdate(vehicleId, { assignedDriver: driverId }).exec();
  }

  public async softDeleteById(id: string): Promise<IVehicleDocument | null> {
    await VehicleModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { isActive: false, deletedAt: new Date(), $unset: { assignedDriver: 1 } },
      { runValidators: true },
    ).exec();

    return this.findById(id, true);
  }

  private async existsByField(
    field: 'registrationNumber' | 'vehicleNumber',
    value: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query: FilterQuery<IVehicleDocument> = {
      [field]: value,
      deletedAt: { $exists: false },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const result = await VehicleModel.exists(query).exec();
    return result !== null;
  }

  private buildFilter(query: VehicleListQuery): FilterQuery<IVehicleDocument> {
    const filter: FilterQuery<IVehicleDocument> = { deletedAt: { $exists: false } };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.vehicleType) {
      filter.vehicleType = query.vehicleType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.brand) {
      filter.brand = query.brand;
    }

    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    return filter;
  }

  private buildSort(query: VehicleListQuery): Record<string, SortOrder> {
    return { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }
}
