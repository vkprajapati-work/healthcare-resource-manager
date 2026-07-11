import { env } from '@/config/env';

/**
 * The backend returns upload URLs relative to its own origin
 * (e.g. /uploads/profile_image/x.png) while the API base URL carries the
 * /api/v1 prefix — resolve against the origin only.
 */
export function toAbsoluteFileUrl(fileUrl: string): string {
  if (/^https?:\/\//.test(fileUrl)) {
    return fileUrl;
  }
  return new URL(fileUrl, new URL(env.VITE_API_BASE_URL).origin).href;
}
