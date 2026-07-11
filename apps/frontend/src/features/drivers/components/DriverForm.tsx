import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { fieldAria } from '@/components/common/field-aria';
import { FileUploadField } from '@/components/common/FileUploadField';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useVehicleOptions } from '@/features/vehicles';
import { ApiError } from '@/types/api';

import { driverFormSchema } from '../schemas/driver-form-schema';

import type { DriverFormInput } from '../schemas/driver-form-schema';

interface DriverFormProps {
  onSubmit: (input: DriverFormInput, profileImage: File[]) => Promise<void>;
  onCancel: () => void;
}

interface TextFieldConfig {
  name: Exclude<keyof DriverFormInput, 'gender' | 'assignedVehicle'>;
  label: string;
  type?: 'text' | 'email' | 'date' | 'number';
}

const TEXT_FIELDS: TextFieldConfig[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phoneNumber', label: 'Phone number' },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { name: 'employeeId', label: 'Employee ID' },
  { name: 'joiningDate', label: 'Joining date', type: 'date' },
  { name: 'licenseNumber', label: 'License number' },
  { name: 'licenseExpiry', label: 'License expiry', type: 'date' },
  { name: 'yearsOfExperience', label: 'Years of experience', type: 'number' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'country', label: 'Country' },
  { name: 'postalCode', label: 'Postal code' },
];

export function DriverForm({ onSubmit, onCancel }: DriverFormProps) {
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const vehicleOptions = useVehicleOptions();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormInput>({ resolver: zodResolver(driverFormSchema) });

  const submit = async (input: DriverFormInput): Promise<void> => {
    try {
      await onSubmit(input, profileImage);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create the driver.';
      setError('root', { message });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <FormField
            key={field.name}
            id={field.name}
            label={field.label}
            error={errors[field.name]?.message}
          >
            <Input
              type={field.type ?? 'text'}
              {...fieldAria(field.name, { error: Boolean(errors[field.name]) })}
              {...register(field.name)}
            />
          </FormField>
        ))}
        <FormField id="gender" label="Gender" error={errors.gender?.message}>
          <Select
            {...fieldAria('gender', { error: Boolean(errors.gender) })}
            {...register('gender')}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </FormField>
        <FormField
          id="assignedVehicle"
          label="Assigned vehicle (optional)"
          error={errors.assignedVehicle?.message}
        >
          <Select
            {...fieldAria('assignedVehicle', { error: Boolean(errors.assignedVehicle) })}
            {...register('assignedVehicle')}
            disabled={vehicleOptions.isPending}
          >
            <option value="">— No vehicle —</option>
            {(vehicleOptions.data ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FileUploadField
        id="profileImage"
        label="Profile image (optional)"
        accept="image/jpeg,image/png,image/webp"
        files={profileImage}
        onFilesChange={setProfileImage}
      />

      {errors.root ? (
        <p role="alert" className="text-sm text-red-700">
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create driver'}
        </Button>
      </div>
    </form>
  );
}
