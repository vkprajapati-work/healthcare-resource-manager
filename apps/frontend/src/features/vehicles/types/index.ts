import type { PaginationMeta } from '@/types/api';

export type VehicleType =
  'BASIC_AMBULANCE' | 'ADVANCED_AMBULANCE' | 'ICU_AMBULANCE' | 'NEONATAL_AMBULANCE';

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_TRIP' | 'MAINTENANCE' | 'INACTIVE';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  BASIC_AMBULANCE: 'Basic Ambulance',
  ADVANCED_AMBULANCE: 'Advanced Ambulance',
  ICU_AMBULANCE: 'ICU Ambulance',
  NEONATAL_AMBULANCE: 'Neonatal Ambulance',
};

export interface FileRef {
  id: string;
  fileUrl: string;
  originalName: string;
}

export interface Vehicle {
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
  photos: FileRef[];
  status: VehicleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VehicleListMeta = PaginationMeta;
