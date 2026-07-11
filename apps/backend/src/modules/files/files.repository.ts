import type { FilterQuery } from 'mongoose';
import { FileModel } from './files.model.js';
import type { FileQueryParams, IFileDocument } from './files.types.js';

export class FilesRepository {
  public async create(input: Record<string, unknown>): Promise<IFileDocument> {
    const file = await FileModel.create(input);
    return file.toObject() as IFileDocument;
  }

  public async findById(id: string): Promise<IFileDocument | null> {
    const file = await FileModel.findById(id).lean<IFileDocument>().exec();
    return file;
  }

  public async findMany(params: FileQueryParams): Promise<IFileDocument[]> {
    const query = this.buildQuery(params);

    return FileModel.find(query)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<IFileDocument[]>()
      .exec();
  }

  public async countMany(params: FileQueryParams): Promise<number> {
    return FileModel.countDocuments(this.buildQuery(params)).exec();
  }

  public async deleteById(id: string): Promise<IFileDocument | null> {
    return FileModel.findByIdAndDelete(id).lean<IFileDocument>().exec();
  }

  private buildQuery(params: FileQueryParams): FilterQuery<IFileDocument> {
    const query: FilterQuery<IFileDocument> = {};

    if (params.category) {
      query.category = params.category;
    }

    if (params.uploadedBy) {
      query.uploadedBy = params.uploadedBy;
    }

    return query;
  }
}
