import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { fieldAria } from '@/components/common/field-aria';
import { FormField } from '@/components/common/FormField';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { ApiError } from '@/types/api';
import { EMPTY_IMAGE_VALUE } from '@/types/image-field';

import { doctorFormSchema } from '../schemas/doctor-form-schema';

import type { DoctorFormInput } from '../schemas/doctor-form-schema';
import type { FileRef } from '../types';

interface DoctorFormProps {
  onSubmit: (input: DoctorFormInput) => Promise<void>;
  onCancel: () => void;
  defaultValues?: DoctorFormInput;
  /** The doctor's already-saved profile image, shown for context when editing. */
  existingPhoto?: FileRef;
  submitLabel?: string;
}

interface TextFieldConfig {
  name: Exclude<keyof DoctorFormInput, 'profileImage'>;
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
  existingPhoto,
  submitLabel = 'Create doctor',
}: DoctorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormInput>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: defaultValues ?? { profileImage: EMPTY_IMAGE_VALUE },
  });

  const submit = async (input: DoctorFormInput): Promise<void> => {
    try {
      await onSubmit(input);
    } catch (error) {
      const fallback = defaultValues
        ? 'Failed to update the doctor.'
        : 'Failed to create the doctor.';
      const message = error instanceof ApiError ? error.message : fallback;
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

      <Controller
        control={control}
        name="profileImage"
        render={({ field }) => (
          <ImageUploadField
            id="profileImage"
            label="Profile image"
            hint="Square photo works best (e.g. 400×400px), max 5MB."
            shape="circle"
            existingImageUrl={existingPhoto ? toAbsoluteFileUrl(existingPhoto.fileUrl) : null}
            value={field.value}
            onChange={field.onChange}
          />
        )}
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
