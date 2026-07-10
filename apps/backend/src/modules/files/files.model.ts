import { Schema, model } from 'mongoose';
import { FileCategory, StorageProvider, type IFileDocument } from './files.types.js';

const fileSchema = new Schema<IFileDocument>(
  {
    originalName: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true, unique: true },
    storageKey: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    extension: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    category: { type: String, enum: Object.values(FileCategory), required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    storageProvider: {
      type: String,
      enum: Object.values(StorageProvider),
      default: StorageProvider.LOCAL,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

fileSchema.index({ category: 1, createdAt: -1 });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });

export const FileModel = model<IFileDocument>('File', fileSchema);
