import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { fieldAria } from '@/components/common/field-aria';
import { FileUploadField } from '@/components/common/FileUploadField';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/types/api';

import { doctorFormSchema } from '../schemas/doctor-form-schema';

import type { DoctorFormInput } from '../schemas/doctor-form-schema';

interface DoctorFormProps {
  onSubmit: (input: DoctorFormInput, profileImage: File[]) => Promise<void>;
  onCancel: () => void;
  defaultValues?: DoctorFormInput;
  submitLabel?: string;
}

interface TextFieldConfig {
  name: keyof DoctorFormInput;
  label: string;
  type?: 'text' | 'email' | 'date' | 'number';
}

const TEXT_FIELDS: TextFieldConfig[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phoneNumber', label: 'Phone number' },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { name: 'specialization', label: 'Specialization' },
  { name: 'qualification', label: 'Qualification' },
  { name: 'licenseNumber', label: 'License number' },
  { name: 'yearsOfExperience', label: 'Years of experience', type: 'number' },
  { name: 'department', label: 'Department' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'country', label: 'Country' },
  { name: 'postalCode', label: 'Postal code' },
];

export function DoctorForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = 'Create doctor',
}: DoctorFormProps) {
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormInput>({
    resolver: zodResolver(doctorFormSchema),
    ...(defaultValues ? { defaultValues } : {}),
  });

  const submit = async (input: DoctorFormInput): Promise<void> => {
    try {
      await onSubmit(input, profileImage);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create the doctor.';
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
      </div>

      <FileUploadField
        id="profileImage"
        label={defaultValues ? 'Replace profile image (optional)' : 'Profile image (optional)'}
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
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
