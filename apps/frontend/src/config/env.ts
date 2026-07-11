import { z } from 'zod';

const envSchema = z.object({
  MODE: z.string().default('development'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:5000/api/v1'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  VITE_APP_NAME: z.string().min(1).default('Healthcare Resource Manager'),
});

/**
 * Typed, validated environment. The only place `import.meta.env` may be read;
 * everything else imports `env` from here.
 */
export const env = envSchema.parse(import.meta.env);
