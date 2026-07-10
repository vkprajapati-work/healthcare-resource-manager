import crypto from 'node:crypto';
import { createReadStream, type ReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../shared/errors.js';
import {
  FileCategory,
  ImageFileCategory,
  StorageProvider,
  type StorageService,
  type StorageUploadInput,
  type StoredFile,
} from './files.types.js';

const parseMimeTypes = (value: string): Set<string> => {
  return new Set(
    value
      .split(',')
      .map((mimeType) => mimeType.trim().toLowerCase())
      .filter(Boolean),
  );
};

const KNOWN_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Extension is derived from the (already validated, allow-listed) MIME type,
 * never from the client-supplied file name — a client-controlled extension
 * decoupled from the real content type is how stored XSS gets served back.
 */
const getExtensionForMimeType = (mimeType: string): string => {
  const normalized = mimeType.toLowerCase();
  const known = KNOWN_MIME_EXTENSIONS[normalized];

  if (known) {
    return `.${known}`;
  }

  const subtype = normalized.split('/')[1]?.replace(/[^a-z0-9]/g, '');

  if (!subtype) {
    throw new BadRequestError('Unsupported file type');
  }

  return `.${subtype}`;
};

export class LocalStorageService implements StorageService {
  private readonly rootPath = path.resolve(env.LOCAL_STORAGE_ROOT);
  private readonly publicBaseUrl = env.FILE_PUBLIC_BASE_URL.replace(/\/$/, '');

  public async upload(input: StorageUploadInput): Promise<StoredFile> {
    const extension = getExtensionForMimeType(input.mimeType);
    const fileName = `${crypto.randomUUID()}${extension}`;
    const categoryPath = input.category.toLowerCase();
    const storageKey = path.posix.join(categoryPath, fileName);
    const destinationDir = path.join(this.rootPath, categoryPath);
    const destinationPath = path.join(destinationDir, fileName);

    await mkdir(destinationDir, { recursive: true });
    await writeFile(destinationPath, input.buffer);

    return {
      originalName: input.originalName,
      fileName,
      storageKey,
      fileUrl: `${this.publicBaseUrl}/${storageKey}`,
      mimeType: input.mimeType,
      extension: extension.replace('.', ''),
      size: input.buffer.byteLength,
      storageProvider: StorageProvider.LOCAL,
    };
  }

  public async delete(storageKey: string): Promise<void> {
    const filePath = this.resolveStorageKey(storageKey);
    await rm(filePath, { force: true });
  }

  public createReadStream(storageKey: string): ReadStream {
    const filePath = this.resolveStorageKey(storageKey);
    return createReadStream(filePath);
  }

  private resolveStorageKey(storageKey: string): string {
    const filePath = path.resolve(this.rootPath, storageKey);

    if (!filePath.startsWith(this.rootPath + path.sep) && filePath !== this.rootPath) {
      throw new BadRequestError('Invalid storage key');
    }

    return filePath;
  }
}

export const createStorageService = (): StorageService => {
  return new LocalStorageService();
};

export const getAllowedMimeTypesForCategory = (category: FileCategory): Set<string> => {
  const imageMimeTypes = parseMimeTypes(env.ALLOWED_IMAGE_MIME_TYPES);
  const documentMimeTypes = parseMimeTypes(env.ALLOWED_DOCUMENT_MIME_TYPES);

  if (Object.values(ImageFileCategory).includes(category as ImageFileCategory)) {
    return imageMimeTypes;
  }

  return documentMimeTypes;
};

export const getAllowedUploadMimeTypes = (): Set<string> => {
  return new Set([
    ...parseMimeTypes(env.ALLOWED_IMAGE_MIME_TYPES),
    ...parseMimeTypes(env.ALLOWED_DOCUMENT_MIME_TYPES),
  ]);
};
