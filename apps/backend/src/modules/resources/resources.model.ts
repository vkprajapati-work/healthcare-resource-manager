import { Schema, model } from 'mongoose';
import { ResourceType, type IResourceDocument } from './resources.types.js';

const resourceSchema = new Schema<IResourceDocument>(
  {
    type: { type: String, enum: Object.values(ResourceType), required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ title: 'text', description: 'text', location: 'text' });

export const ResourceModel = model<IResourceDocument>('Resource', resourceSchema);
