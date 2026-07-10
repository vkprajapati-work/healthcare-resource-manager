import { Schema, model } from 'mongoose';
import { DriverAvailabilityStatus, DriverGender, type IDriverDocument } from './drivers.types.js';

const driverSchema = new Schema<IDriverDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, enum: Object.values(DriverGender), required: true },
    dateOfBirth: { type: Date, required: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    joiningDate: { type: Date, required: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
    assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    profileImage: { type: Schema.Types.ObjectId, ref: 'File' },
    documents: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    availabilityStatus: {
      type: String,
      enum: Object.values(DriverAvailabilityStatus),
      default: DriverAvailabilityStatus.AVAILABLE,
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

driverSchema.index({ email: 1 });
driverSchema.index({ employeeId: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ phoneNumber: 1 });
driverSchema.index({ assignedVehicle: 1 });
driverSchema.index({ isActive: 1, deletedAt: 1, createdAt: -1 });
driverSchema.index({
  firstName: 'text',
  lastName: 'text',
  employeeId: 'text',
  licenseNumber: 'text',
  phoneNumber: 'text',
});

export const DriverModel = model<IDriverDocument>('Driver', driverSchema);
