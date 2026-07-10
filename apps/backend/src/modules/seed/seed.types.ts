import type { VehicleType } from '../vehicles/vehicles.types.js';

export interface SeedSummary {
  doctors: Array<{ id: string; name: string; email: string; defaultPassword?: string }>;
  vehicles: Array<{ id: string; vehicleNumber: string; vehicleType: VehicleType }>;
  drivers: Array<{
    id: string;
    name: string;
    email: string;
    defaultPassword?: string;
    assignedVehicle?: string;
  }>;
}
