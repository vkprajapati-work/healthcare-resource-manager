import type { Request } from 'express';
import type { Types } from 'mongoose';

export const UserRole = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  EVOC_DRIVER: 'EVOC_DRIVER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken?: string | undefined;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
