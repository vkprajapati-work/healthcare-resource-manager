export interface FileValidationOptions {
  /** Comma-separated mime types, e.g. "image/jpeg,image/png,image/webp". */
  accept: string;
  maxSizeBytes: number;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes % 1 === 0 ? megabytes.toFixed(0) : megabytes.toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${bytes}B`;
}

function friendlyTypeList(accept: string): string {
  return accept
    .split(',')
    .map((mimeType) => mimeType.trim().split('/')[1]?.toUpperCase())
    .filter((label): label is string => Boolean(label))
    .join(', ');
}

/** Returns a user-facing error message, or null when the file is acceptable. */
export function validateImageFile(file: File, options: FileValidationOptions): string | null {
  const allowedTypes = options.accept
    .split(',')
    .map((mimeType) => mimeType.trim().toLowerCase())
    .filter(Boolean);

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type.toLowerCase())) {
    return `Unsupported file type. Please choose a ${friendlyTypeList(options.accept)} image.`;
  }

  if (file.size > options.maxSizeBytes) {
    return `File is too large. Maximum size is ${formatBytes(options.maxSizeBytes)}.`;
  }

  return null;
}
