import { Schema, model } from 'mongoose';
import { AvailabilityStatus, Gender, type IDoctorDocument } from './doctors.types.js';

const doctorSchema = new Schema<IDoctorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    dateOfBirth: { type: Date, required: true },
    specialization: { type: String, required: true, trim: true, maxlength: 150 },
    qualification: { type: String, required: true, trim: true, maxlength: 200 },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
    department: { type: String, required: true, trim: true, maxlength: 150 },
    consultationFee: { type: Number, min: 0 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    profileImage: { type: Schema.Types.ObjectId, ref: 'File' },
    documents: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    availabilityStatus: {
      type: String,
      enum: Object.values(AvailabilityStatus),
      default: AvailabilityStatus.AVAILABLE,
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

doctorSchema.index({ email: 1 });
doctorSchema.index({ phoneNumber: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isActive: 1, deletedAt: 1, createdAt: -1 });
doctorSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  phoneNumber: 'text',
  licenseNumber: 'text',
  specialization: 'text',
});

export const DoctorModel = model<IDoctorDocument>('Doctor', doctorSchema);
