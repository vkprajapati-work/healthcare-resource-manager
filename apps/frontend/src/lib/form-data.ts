type FieldValue = string | number | boolean | undefined | string[];

/**
 * Builds the multipart body for the backend's create/update-from-form
 * endpoints: scalar fields plus file fields (repeated entries for
 * multi-file inputs). Undefined and empty-string values are omitted so
 * backend defaults apply. A `string[]` field (e.g. the ids of existing
 * files to keep) is sent as repeated entries of the same key — except an
 * *empty* array, which is sent as a single empty-string entry, since
 * omitting the key entirely would be indistinguishable from "unchanged"
 * and the backend would fall back to keeping everything.
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
    if (Array.isArray(value)) {
      if (value.length === 0) {
        formData.append(key, '');
        continue;
      }
      for (const item of value) {
        formData.append(key, item);
      }
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
