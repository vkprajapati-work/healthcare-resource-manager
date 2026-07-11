/**
 * Controlled value shape for ImageUploadField, kept in its own module (not
 * components/common) so Zod form schemas can reference the type without
 * importing UI component code.
 */
export interface ImageFieldValue {
  /** Newly selected file to upload, replacing whatever is currently shown. */
  file: File | null;
  /** True when the user explicitly removed the image (no replacement chosen). */
  removed: boolean;
}

export const EMPTY_IMAGE_VALUE: ImageFieldValue = { file: null, removed: false };
