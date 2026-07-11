import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { fieldAria } from '@/components/common/field-aria';
import { FileUploadField } from '@/components/common/FileUploadField';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { ApiError } from '@/types/api';

import { vehicleFormSchema } from '../schemas/vehicle-form-schema';
import { VEHICLE_TYPE_LABELS } from '../types';

import type { VehicleFormInput } from '../schemas/vehicle-form-schema';
import type { FileRef } from '../types';

interface VehicleFormProps {
  onSubmit: (input: VehicleFormInput, photos: File[], existingPhotoIds?: string[]) => Promise<void>;
  onCancel: () => void;
  defaultValues?: VehicleFormInput;
  /** The vehicle's already-saved photos; shown for context and removable when editing. */
  existingPhotos?: FileRef[];
  submitLabel?: string;
}

export function VehicleForm({
  onSubmit,
  onCancel,
  defaultValues,
  existingPhotos,
  submitLabel = 'Create vehicle',
}: VehicleFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [keptPhotoIds, setKeptPhotoIds] = useState<string[]>(
    () => existingPhotos?.map((photo) => photo.id) ?? [],
  );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(vehicleFormSchema),
    ...(defaultValues ? { defaultValues } : {}),
  });

  const removeExistingPhoto = (id: string): void => {
    setKeptPhotoIds((current) => current.filter((photoId) => photoId !== id));
  };

  const submit = async (input: VehicleFormInput): Promise<void> => {
    if (existingPhotos && keptPhotoIds.length === 0 && photos.length === 0) {
      setError('root', { message: 'Add at least one photo — a vehicle needs at least one.' });
      return;
    }
    try {
      await onSubmit(input, photos, existingPhotos ? keptPhotoIds : undefined);
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

      {existingPhotos && existingPhotos.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Current photos</Label>
          <ul className="flex flex-wrap gap-3">
            {existingPhotos
              .filter((photo) => keptPhotoIds.includes(photo.id))
              .map((photo) => (
                <li key={photo.id} className="relative">
                  <img
                    src={toAbsoluteFileUrl(photo.fileUrl)}
                    alt=""
                    className="size-20 rounded-lg border border-slate-200 object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo.id)}
                    aria-label="Remove this photo"
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                      className="size-3"
                    >
                      <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>
          {keptPhotoIds.length === 0 ? (
            <p className="text-xs text-amber-600">
              All current photos removed — add at least one below before saving.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              New photos you add below are kept alongside these.
            </p>
          )}
        </div>
      ) : null}

      <FileUploadField
        id="photos"
        label={defaultValues ? 'Add more photos (optional)' : 'Photos (optional)'}
        hint="Landscape photos work best (e.g. 1280×720px), max 5MB each."
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
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
