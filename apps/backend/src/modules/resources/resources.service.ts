import { NotFoundError } from '../../shared/errors.js';
import { ResourcesRepository } from './resources.repository.js';
import type {
  CreateResourceInput,
  IResourceDocument,
  ResourceDto,
  ResourceListMeta,
  ResourceListQuery,
  UpdateResourceInput,
} from './resources.types.js';

export class ResourcesService {
  constructor(private readonly resourcesRepository = new ResourcesRepository()) {}

  public async list(query: ResourceListQuery): Promise<{
    resources: ResourceDto[];
    meta: ResourceListMeta;
  }> {
    const [resources, totalItems, counts] = await Promise.all([
      this.resourcesRepository.findMany(query),
      this.resourcesRepository.countMany(query),
      this.resourcesRepository.countByType(),
    ]);

    return {
      resources: resources.map((resource) => this.toDto(resource)),
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
        counts,
      },
    };
  }

  public async getById(id: string): Promise<ResourceDto> {
    const resource = await this.resourcesRepository.findById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return this.toDto(resource);
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
}
