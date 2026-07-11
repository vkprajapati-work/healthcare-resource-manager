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

import { vehicleFormSchema } from '../schemas/vehicle-form-schema';
import { VEHICLE_TYPE_LABELS } from '../types';

import type { VehicleFormInput } from '../schemas/vehicle-form-schema';

interface VehicleFormProps {
  onSubmit: (input: VehicleFormInput, photos: File[]) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: VehicleFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormInput>({ resolver: zodResolver(vehicleFormSchema) });

  const submit = async (input: VehicleFormInput): Promise<void> => {
    try {
      await onSubmit(input, photos);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create the vehicle.';
      setError('root', { message });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="registrationNumber"
          label="Registration number"
          error={errors.registrationNumber?.message}
        >
          <Input
            {...fieldAria('registrationNumber', { error: Boolean(errors.registrationNumber) })}
            {...register('registrationNumber')}
          />
        </FormField>
        <FormField id="vehicleNumber" label="Vehicle number" error={errors.vehicleNumber?.message}>
          <Input
            {...fieldAria('vehicleNumber', { error: Boolean(errors.vehicleNumber) })}
            {...register('vehicleNumber')}
          />
        </FormField>
        <FormField id="vehicleType" label="Vehicle type" error={errors.vehicleType?.message}>
          <Select
            {...fieldAria('vehicleType', { error: Boolean(errors.vehicleType) })}
            {...register('vehicleType')}
          >
            {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="brand" label="Brand" error={errors.brand?.message}>
          <Input {...fieldAria('brand', { error: Boolean(errors.brand) })} {...register('brand')} />
        </FormField>
        <FormField id="model" label="Model" error={errors.model?.message}>
          <Input {...fieldAria('model', { error: Boolean(errors.model) })} {...register('model')} />
        </FormField>
        <FormField
          id="manufactureYear"
          label="Manufacture year"
          error={errors.manufactureYear?.message}
        >
          <Input
            type="number"
            {...fieldAria('manufactureYear', { error: Boolean(errors.manufactureYear) })}
            {...register('manufactureYear')}
          />
        </FormField>
        <FormField id="color" label="Color" error={errors.color?.message}>
          <Input {...fieldAria('color', { error: Boolean(errors.color) })} {...register('color')} />
        </FormField>
        <FormField
          id="seatingCapacity"
          label="Seating capacity"
          error={errors.seatingCapacity?.message}
        >
          <Input
            type="number"
            {...fieldAria('seatingCapacity', { error: Boolean(errors.seatingCapacity) })}
            {...register('seatingCapacity')}
          />
        </FormField>
        <FormField
          id="patientCapacity"
          label="Patient capacity"
          error={errors.patientCapacity?.message}
        >
          <Input
            type="number"
            {...fieldAria('patientCapacity', { error: Boolean(errors.patientCapacity) })}
            {...register('patientCapacity')}
          />
        </FormField>
        <FormField
          id="insuranceExpiry"
          label="Insurance expiry"
          error={errors.insuranceExpiry?.message}
        >
          <Input
            type="date"
            {...fieldAria('insuranceExpiry', { error: Boolean(errors.insuranceExpiry) })}
            {...register('insuranceExpiry')}
          />
        </FormField>
        <FormField id="fitnessExpiry" label="Fitness expiry" error={errors.fitnessExpiry?.message}>
          <Input
            type="date"
            {...fieldAria('fitnessExpiry', { error: Boolean(errors.fitnessExpiry) })}
            {...register('fitnessExpiry')}
          />
        </FormField>
        <FormField
          id="pollutionExpiry"
          label="Pollution expiry"
          error={errors.pollutionExpiry?.message}
        >
          <Input
            type="date"
            {...fieldAria('pollutionExpiry', { error: Boolean(errors.pollutionExpiry) })}
            {...register('pollutionExpiry')}
          />
        </FormField>
      </div>

      <FileUploadField
        id="photos"
        label="Photos (optional)"
        accept="image/jpeg,image/png,image/webp"
        multiple
        files={photos}
        onFilesChange={setPhotos}
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
          {isSubmitting ? 'Creating…' : 'Create vehicle'}
        </Button>
      </div>
    </form>
  );
}
