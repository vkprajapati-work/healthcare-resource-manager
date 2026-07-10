import type { Document, Types } from 'mongoose';

export const ResourceType = {
  AMBULANCE: 'ambulance',
  DOCTOR: 'doctor',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export interface IResourceDocument extends Document {
  _id: Types.ObjectId;
  type: ResourceType;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceDto {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListQuery {
  page: number;
  limit: number;
  type?: ResourceType;
  search?: string;
}

export interface ResourceListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  counts: Record<ResourceType, number>;
}

export type CreateResourceInput = Pick<
  IResourceDocument,
  'type' | 'title' | 'description' | 'location' | 'imageUrl'
>;

export type UpdateResourceInput = Partial<CreateResourceInput>;
