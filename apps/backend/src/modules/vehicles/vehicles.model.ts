import { Schema, model } from 'mongoose';
import { VehicleStatus, VehicleType, type IVehicleDocument } from './vehicles.types.js';

const vehicleSchema = new Schema<IVehicleDocument>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, enum: Object.values(VehicleType), required: true },
    brand: { type: String, required: true, trim: true, maxlength: 100 },
    model: { type: String, required: true, trim: true, maxlength: 100 },
    manufactureYear: { type: Number, required: true, min: 1990 },
    color: { type: String, required: true, trim: true, maxlength: 50 },
    seatingCapacity: { type: Number, required: true, min: 1 },
    patientCapacity: { type: Number, required: true, min: 1 },
    assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    photos: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    documents: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    insuranceExpiry: { type: Date, required: true },
    fitnessExpiry: { type: Date, required: true },
    pollutionExpiry: { type: Date, required: true },
    lastServiceDate: { type: Date },
    nextServiceDate: { type: Date },
    status: { type: String, enum: Object.values(VehicleStatus), default: VehicleStatus.AVAILABLE },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ assignedDriver: 1 });
vehicleSchema.index({ status: 1, isActive: 1, deletedAt: 1, createdAt: -1 });
vehicleSchema.index({
  registrationNumber: 'text',
  vehicleNumber: 'text',
  brand: 'text',
  model: 'text',
});

export const VehicleModel = model<IVehicleDocument>('Vehicle', vehicleSchema);
