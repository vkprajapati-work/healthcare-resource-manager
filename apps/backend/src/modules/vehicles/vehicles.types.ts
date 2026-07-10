import type { Types } from 'mongoose';
import type { DocumentFileCategory, FileDto } from '../files/files.types.js';

export const VehicleType = {
  BASIC_AMBULANCE: 'BASIC_AMBULANCE',
  ADVANCED_AMBULANCE: 'ADVANCED_AMBULANCE',
  ICU_AMBULANCE: 'ICU_AMBULANCE',
  NEONATAL_AMBULANCE: 'NEONATAL_AMBULANCE',
} as const;

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  ON_TRIP: 'ON_TRIP',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export type VehicleSortOrder = 'asc' | 'desc';

export type VehicleSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'registrationNumber'
  | 'vehicleNumber'
  | 'brand'
  | 'model'
  | 'manufactureYear'
  | 'nextServiceDate';

export interface IVehicleDocument {
  _id: Types.ObjectId;
  registrationNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  seatingCapacity: number;
  patientCapacity: number;
  assignedDriver?: Types.ObjectId;
  photos: Types.ObjectId[];
  documents: Types.ObjectId[];
  insuranceExpiry: Date;
  fitnessExpiry: Date;
  pollutionExpiry: Date;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  status: VehicleStatus;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDto {
  id: string;
  registrationNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  seatingCapacity: number;
  patientCapacity: number;
  assignedDriver?: string;
  photos: FileDto[];
  documents: FileDto[];
  insuranceExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  status: VehicleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: VehicleSortBy;
  sortOrder: VehicleSortOrder;
  vehicleType?: VehicleType;
  status?: VehicleStatus;
  brand?: string;
  isActive?: boolean;
}

export interface VehicleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  seatingCapacity: number;
  patientCapacity: number;
  assignedDriver?: string;
  photos: string[];
  documents: string[];
  insuranceExpiry: Date;
  fitnessExpiry: Date;
  pollutionExpiry: Date;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  status: VehicleStatus;
  isActive: boolean;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleFormInput extends CreateVehicleInput {
  documentCategories?: DocumentFileCategory[];
}

export interface VehicleUpdateFormInput extends UpdateVehicleInput {
  documentCategories?: DocumentFileCategory[];
}

export interface VehicleUploadedFiles {
  photos?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

export interface VehicleAccessContext {
  userId: string;
  role: string;
}
