type FieldValue = string | number | boolean | undefined;

/**
 * Builds the multipart body for the backend's create-from-form endpoints:
 * scalar fields plus file fields (repeated entries for multi-file inputs).
 * Undefined and empty-string values are omitted so backend defaults apply.
 */
export function buildFormData(
  fields: Record<string, FieldValue>,
  files: Record<string, File[]> = {},
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') {
      continue;
    }
    formData.append(key, String(value));
  }

  for (const [key, fileList] of Object.entries(files)) {
    for (const file of fileList) {
      formData.append(key, file);
    }
  }

  return formData;
}
