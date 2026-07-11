import { useMemo } from 'react';

import { ImageUploadField } from '@/components/common/ImageUploadField';
import { Label } from '@/components/ui/Label';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { EMPTY_IMAGE_VALUE } from '@/types/image-field';

import type { FileRef, VehiclePhotosValue } from '../types';
import type { ImageFieldValue } from '@/types/image-field';

interface VehiclePhotosFieldProps {
  value: VehiclePhotosValue;
  onChange: (value: VehiclePhotosValue) => void;
  existingPhotos?: FileRef[];
  error?: string;
}

/**
 * Keyed by file identity rather than array index — removing an earlier
 * item shifts every later index down one, which would otherwise make React
 * reuse a later tile's component instance (and any open "remove?" confirm
 * state) for a different photo than the one the user was looking at.
 */
function fileIdentity(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Vehicle-specific composition over ImageUploadField: one instance per
 * already-saved photo still in play (kept or replaced), a flat list of new
 * additions, and a single trailing empty slot to add another. Removing an
 * existing photo drops its tile from the grid entirely — the rest shift up
 * to fill the gap — rather than leaving a refillable empty box behind; the
 * trailing tile is the only "add" entry point. The atom stays single-image
 * and domain-agnostic; this is the "multiple" story for it.
 */
export function VehiclePhotosField({
  value,
  onChange,
  existingPhotos,
  error,
}: VehiclePhotosFieldProps) {
  const urlByPhotoId = useMemo(
    () =>
      new Map((existingPhotos ?? []).map((photo) => [photo.id, toAbsoluteFileUrl(photo.fileUrl)])),
    [existingPhotos],
  );

  const updateExisting = (photoId: string, next: ImageFieldValue): void => {
    onChange({
      ...value,
      existing: value.existing.map((slot) =>
        slot.photoId === photoId ? { ...slot, value: next } : slot,
      ),
    });
  };

  const updateNewFileAt = (index: number, next: ImageFieldValue): void => {
    if (!next.file) {
      onChange({ ...value, newFiles: value.newFiles.filter((_, i) => i !== index) });
      return;
    }
    const nextFile = next.file;
    onChange({
      ...value,
      newFiles: value.newFiles.map((file, i) => (i === index ? nextFile : file)),
    });
  };

  const addNewFile = (next: ImageFieldValue): void => {
    if (next.file) {
      onChange({ ...value, newFiles: [...value.newFiles, next.file] });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label>Photos</Label>
        <p className="mt-0.5 text-xs text-slate-400">
          Landscape photos work best (e.g. 1280×720px), max 5MB each.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.existing
          // A removed-with-no-replacement slot drops out of the grid
          // entirely instead of lingering as an empty, refillable box.
          .filter((slot) => !(slot.value.removed && !slot.value.file))
          .map((slot) => (
            <ImageUploadField
              key={slot.photoId}
              id={`vehicle-photo-${slot.photoId}`}
              label=""
              shape="tile"
              aspectRatio="video"
              existingImageUrl={urlByPhotoId.get(slot.photoId) ?? null}
              value={slot.value}
              onChange={(next) => updateExisting(slot.photoId, next)}
            />
          ))}
        {value.newFiles.map((file, index) => (
          <ImageUploadField
            key={fileIdentity(file)}
            id={`vehicle-photo-new-${fileIdentity(file)}`}
            label=""
            shape="tile"
            aspectRatio="video"
            value={{ file, removed: false }}
            onChange={(next) => updateNewFileAt(index, next)}
          />
        ))}
        <ImageUploadField
          id="vehicle-photo-add"
          label=""
          shape="tile"
          aspectRatio="video"
          value={EMPTY_IMAGE_VALUE}
          onChange={addNewFile}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
