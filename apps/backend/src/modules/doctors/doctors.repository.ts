import type { FilterQuery, SortOrder } from 'mongoose';
import { DoctorModel } from './doctors.model.js';
import type {
  CreateDoctorInput,
  DoctorListQuery,
  IDoctorDocument,
  UpdateDoctorInput,
} from './doctors.types.js';

const populateFiles = [
  { path: 'profileImage', model: 'File' },
  { path: 'documents', model: 'File' },
];

export class DoctorsRepository {
  public async create(input: CreateDoctorInput): Promise<IDoctorDocument> {
    const doctor = await DoctorModel.create(input);
    const populatedDoctor = await this.findById(String(doctor._id), true);
    return populatedDoctor ?? (doctor.toObject() as IDoctorDocument);
  }

  public async findById(id: string, includeDeleted = false): Promise<IDoctorDocument | null> {
    const query: FilterQuery<IDoctorDocument> = { _id: id };

    if (!includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    return DoctorModel.findOne(query)
      .populate(populateFiles)
      .lean<IDoctorDocument>()
      .exec();
  }

  public async findByUserId(userId: string): Promise<IDoctorDocument | null> {
    return DoctorModel.findOne({ userId, deletedAt: { $exists: false } })
      .populate(populateFiles)
      .lean<IDoctorDocument>()
      .exec();
  }

  public async findMany(query: DoctorListQuery): Promise<IDoctorDocument[]> {
    return DoctorModel.find(this.buildFilter(query))
      .sort(this.buildSort(query))
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate(populateFiles)
      .lean<IDoctorDocument[]>()
      .exec();
  }

  public async countMany(query: DoctorListQuery): Promise<number> {
    return DoctorModel.countDocuments(this.buildFilter(query)).exec();
  }

  public async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('email', email, excludeId);
  }

  public async existsByPhoneNumber(phoneNumber: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('phoneNumber', phoneNumber, excludeId);
  }

  public async existsByLicenseNumber(licenseNumber: string, excludeId?: string): Promise<boolean> {
    return this.existsByField('licenseNumber', licenseNumber, excludeId);
  }

  public async updateById(
    id: string,
    input: UpdateDoctorInput,
  ): Promise<IDoctorDocument | null> {
    await DoctorModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      input,
      { runValidators: true },
    ).exec();

    return this.findById(id);
  }

  public async softDeleteById(id: string): Promise<IDoctorDocument | null> {
    await DoctorModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { isActive: false, deletedAt: new Date() },
      { runValidators: true },
    ).exec();

    return this.findById(id, true);
  }

  private async existsByField(
    field: 'email' | 'phoneNumber' | 'licenseNumber',
    value: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query: FilterQuery<IDoctorDocument> = {
      [field]: value,
      deletedAt: { $exists: false },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const result = await DoctorModel.exists(query).exec();
    return result !== null;
  }

  private buildFilter(query: DoctorListQuery): FilterQuery<IDoctorDocument> {
    const filter: FilterQuery<IDoctorDocument> = {
      deletedAt: { $exists: false },
    };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.specialization) {
      filter.specialization = query.specialization;
    }

    if (query.department) {
      filter.department = query.department;
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

  private buildSort(query: DoctorListQuery): Record<string, SortOrder> {
    return { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }
}
