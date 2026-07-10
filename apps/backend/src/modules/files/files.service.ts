import type { ReadStream } from 'node:fs';
import { env } from '../../config/env.js';
import { AuthorizationError, BadRequestError, NotFoundError } from '../../shared/errors.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import type { AuthUserPayload } from '../auth/auth.types.js';
import { UserRole } from '../auth/auth.types.js';
import { FilesRepository } from './files.repository.js';
import { createStorageService, getAllowedMimeTypesForCategory } from './storage.service.js';
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

  public async list(
    params: FileQueryParams,
    requester: AuthUserPayload,
  ): Promise<{ files: FileDto[]; meta: FileListMeta }> {
    const scopedParams = this.scopeToRequester(params, requester);

    const [files, totalItems] = await Promise.all([
      this.filesRepository.findMany(scopedParams),
      this.filesRepository.countMany(scopedParams),
    ]);

    return {
      files: files.map((file) => this.toDto(file)),
      meta: buildPaginationMeta(scopedParams, totalItems),
    };
  }

  public async getById(id: string, requester: AuthUserPayload): Promise<FileDto> {
    const file = await this.findOwnedOrThrow(id, requester);
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

  public async getDownloadStream(
    id: string,
    requester: AuthUserPayload,
  ): Promise<{ stream: ReadStream; file: FileDto }> {
    const file = await this.findOwnedOrThrow(id, requester);

    return {
      stream: this.storageService.createReadStream(file.storageKey),
      file: this.toDto(file),
    };
  }

  private async findOwnedOrThrow(id: string, requester: AuthUserPayload): Promise<IFileDocument> {
    const file = await this.filesRepository.findById(id);

    if (!file) {
      throw new NotFoundError('File not found');
    }

    this.assertCanAccess(file, requester);

    return file;
  }

  private assertCanAccess(file: IFileDocument, requester: AuthUserPayload): void {
    const isOwner = Boolean(file.uploadedBy) && String(file.uploadedBy) === requester.id;

    if (requester.role !== UserRole.ADMIN && !isOwner) {
      throw new AuthorizationError('You do not have access to this file');
    }
  }

  private scopeToRequester(params: FileQueryParams, requester: AuthUserPayload): FileQueryParams {
    if (requester.role === UserRole.ADMIN) {
      return params;
    }

    return { ...params, uploadedBy: requester.id };
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
