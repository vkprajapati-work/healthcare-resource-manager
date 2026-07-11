import type { Document, Types } from 'mongoose';
import type { FileDto } from '../files/files.types.js';
import type { DocumentFileCategory } from '../files/files.types.js';

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const AvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  ON_LEAVE: 'ON_LEAVE',
} as const;

export type AvailabilityStatus = (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];

export type SortOrder = 'asc' | 'desc';

export type DoctorSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'firstName'
  | 'lastName'
  | 'specialization'
  | 'yearsOfExperience'
  | 'consultationFee';

export interface IDoctorDocument extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: Date;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  yearsOfExperience: number;
  department: string;
  consultationFee?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: Types.ObjectId;
  documents: Types.ObjectId[];
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorDto {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  yearsOfExperience: number;
  department: string;
  consultationFee?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: FileDto;
  documents: FileDto[];
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisionedLoginDetails {
  email: string;
  defaultPassword: string;
  mustChangePassword: true;
}

export interface DoctorCreateResult {
  doctor: DoctorDto;
  login?: ProvisionedLoginDetails;
}

export interface DoctorListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: DoctorSortBy;
  sortOrder: SortOrder;
  specialization?: string;
  department?: string;
  city?: string;
  state?: string;
  availabilityStatus?: AvailabilityStatus;
  isActive?: boolean;
}

export interface DoctorListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateDoctorInput {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: Date;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  yearsOfExperience: number;
  department: string;
  consultationFee?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: string;
  documents: string[];
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
}

export type UpdateDoctorInput = Partial<Omit<CreateDoctorInput, 'profileImage'>> & {
  /** null explicitly clears the profile image; undefined leaves it unchanged. */
  profileImage?: string | null;
};

export interface DoctorFormInput extends CreateDoctorInput {
  documentCategories?: DocumentFileCategory[];
}

export interface DoctorUpdateFormInput extends UpdateDoctorInput {
  documentCategories?: DocumentFileCategory[];
}

export interface DoctorUploadedFiles {
  profileImage?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

export interface DoctorAccessContext {
  userId: string;
  role: string;
}
