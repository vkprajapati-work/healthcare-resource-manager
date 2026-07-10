import { env } from '../../config/env.js';
import { BadRequestError, NotFoundError } from '../../shared/errors.js';
import { FilesRepository } from './files.repository.js';
import {
  createStorageService,
  getAllowedMimeTypesForCategory,
} from './storage.service.js';
import type {
  FileDto,
  FileListMeta,
  FileQueryParams,
  IFileDocument,
  UploadFileInput,
} from './files.types.js';

export class FilesService {
  constructor(
    private readonly filesRepository = new FilesRepository(),
    private readonly storageService = createStorageService(),
  ) {}

  public async upload(input: UploadFileInput): Promise<FileDto> {
    this.validateFile(input);

    const storedFile = await this.storageService.upload({
      buffer: input.file.buffer,
      originalName: input.file.originalname,
      mimeType: input.file.mimetype,
      category: input.category,
    });

    const file = await this.filesRepository.create({
      ...storedFile,
      category: input.category,
      uploadedBy: input.uploadedBy,
      metadata: input.metadata,
    });

    return this.toDto(file);
  }

  public async list(params: FileQueryParams): Promise<{ files: FileDto[]; meta: FileListMeta }> {
    const [files, totalItems] = await Promise.all([
      this.filesRepository.findMany(params),
      this.filesRepository.countMany(params),
    ]);

    return {
      files: files.map((file) => this.toDto(file)),
      meta: {
        page: params.page,
        limit: params.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / params.limit),
      },
    };
  }

  public async getById(id: string): Promise<FileDto> {
    const file = await this.filesRepository.findById(id);

    if (!file) {
      throw new NotFoundError('File not found');
    }

    return this.toDto(file);
  }

  public async delete(id: string): Promise<{ id: string }> {
    const file = await this.filesRepository.deleteById(id);

    if (!file) {
      throw new NotFoundError('File not found');
    }

    await this.storageService.delete(file.storageKey);

    return { id };
  }

  private validateFile(input: UploadFileInput): void {
    if (!input.file) {
      throw new BadRequestError('File is required');
    }

    if (input.file.size > env.MAX_UPLOAD_SIZE_BYTES) {
      throw new BadRequestError('File size exceeds configured upload limit');
    }

    const allowedMimeTypes = getAllowedMimeTypesForCategory(input.category);

    if (!allowedMimeTypes.has(input.file.mimetype.toLowerCase())) {
      throw new BadRequestError('File type is not allowed for this category');
    }
  }

  private toDto(file: IFileDocument): FileDto {
    const dto: FileDto = {
      id: String(file._id),
      originalName: file.originalName,
      fileName: file.fileName,
      storageKey: file.storageKey,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      category: file.category,
      storageProvider: file.storageProvider,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    };

    if (file.uploadedBy) {
      dto.uploadedBy = String(file.uploadedBy);
    }

    if (file.metadata) {
      dto.metadata = file.metadata;
    }

    return dto;
  }
}
