import type { Document, Types } from 'mongoose';
import type { AuthUserPayload } from '../auth/auth.types.js';

export const ImageFileCategory = {
  PROFILE_IMAGE: 'PROFILE_IMAGE',
  VEHICLE_PHOTO: 'VEHICLE_PHOTO',
} as const;

export const DocumentFileCategory = {
  MEDICAL_LICENSE: 'MEDICAL_LICENSE',
  DEGREE: 'DEGREE',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  GOVERNMENT_ID: 'GOVERNMENT_ID',
  POLICE_VERIFICATION: 'POLICE_VERIFICATION',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  RC_BOOK: 'RC_BOOK',
  INSURANCE: 'INSURANCE',
  FITNESS_CERTIFICATE: 'FITNESS_CERTIFICATE',
  POLLUTION_CERTIFICATE: 'POLLUTION_CERTIFICATE',
  PERMIT: 'PERMIT',
  AADHAR: 'AADHAR',
  PAN: 'PAN',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER',
} as const;

export const FileCategory = {
  ...ImageFileCategory,
  ...DocumentFileCategory,
} as const;

export type ImageFileCategory = (typeof ImageFileCategory)[keyof typeof ImageFileCategory];
export type DocumentFileCategory =
  (typeof DocumentFileCategory)[keyof typeof DocumentFileCategory];
export type FileCategory = (typeof FileCategory)[keyof typeof FileCategory];

export const StorageProvider = {
  LOCAL: 'LOCAL',
} as const;

export type StorageProvider = (typeof StorageProvider)[keyof typeof StorageProvider];

export interface IFileDocument extends Document {
  _id: Types.ObjectId;
  originalName: string;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  category: FileCategory;
  uploadedBy?: Types.ObjectId;
  storageProvider: StorageProvider;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileDto {
  id: string;
  originalName: string;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  category: FileCategory;
  uploadedBy?: string;
  storageProvider: StorageProvider;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileInput {
  file: Express.Multer.File;
  category: FileCategory;
  uploadedBy: string;
  metadata?: Record<string, unknown>;
}

export interface FileQueryParams {
  category?: FileCategory;
  uploadedBy?: string;
  limit: number;
  page: number;
}

export interface FileListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface AuthenticatedFileRequest extends Express.Request {
  user?: AuthUserPayload;
}

export interface StoredFile {
  originalName: string;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  storageProvider: StorageProvider;
}

export interface StorageUploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  category: FileCategory;
}

export interface StorageService {
  upload(input: StorageUploadInput): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}
