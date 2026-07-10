import type { FilterQuery, UpdateQuery } from 'mongoose';
import { ResourceModel } from './resources.model.js';
import { ResourceType, type IResourceDocument, type ResourceListQuery } from './resources.types.js';

export class ResourcesRepository {
  public async create(input: Partial<IResourceDocument>): Promise<IResourceDocument> {
    const resource = await ResourceModel.create(input);
    return resource.toObject() as IResourceDocument;
  }

  public async findById(id: string): Promise<IResourceDocument | null> {
    return ResourceModel.findById(id).lean<IResourceDocument>().exec();
  }

  public async findMany(query: ResourceListQuery): Promise<IResourceDocument[]> {
    const filter = this.buildFilter(query);

    return ResourceModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<IResourceDocument[]>()
      .exec();
  }

  public async countMany(query: ResourceListQuery): Promise<number> {
    return ResourceModel.countDocuments(this.buildFilter(query)).exec();
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

  private buildFilter(query: ResourceListQuery): FilterQuery<IResourceDocument> {
    const filter: FilterQuery<IResourceDocument> = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return filter;
  }
}
