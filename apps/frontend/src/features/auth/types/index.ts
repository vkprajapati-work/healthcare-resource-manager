/** Mirrors the backend's AuthUserPayload (apps/backend auth module). */

export type UserRole = 'ADMIN' | 'DOCTOR' | 'EVOC_DRIVER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
}
