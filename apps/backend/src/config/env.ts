import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().trim().min(1),
  CLIENT_URL: z.string().trim().url().optional(),
  ACCESS_TOKEN_SECRET: z.string().trim().min(1),
  ACCESS_TOKEN_EXPIRES_IN: z.string().trim().min(1).default('15m'),
  REFRESH_TOKEN_SECRET: z.string().trim().min(1),
  REFRESH_TOKEN_EXPIRES_IN: z.string().trim().min(1).default('7d'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  REQUEST_BODY_SIZE_LIMIT: z.string().trim().min(1).default('10mb'),
  MAX_UPLOAD_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  LOCAL_STORAGE_ROOT: z.string().trim().min(1).default('uploads'),
  FILE_PUBLIC_BASE_URL: z.string().trim().min(1).default('/uploads'),
  FILE_STORAGE_PROVIDER: z.literal('LOCAL').default('LOCAL'),
  ALLOWED_IMAGE_MIME_TYPES: z.string().trim().min(1).default('image/jpeg,image/png,image/webp'),
  ALLOWED_DOCUMENT_MIME_TYPES: z.string().trim().min(1).default('application/pdf'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  REFRESH_TOKEN_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(7 * 24 * 60 * 60 * 1000),
  ADMIN_EMAIL: z.string().trim().email().default('admin@healthcare.local'),
  ADMIN_PASSWORD: z.string().trim().min(1).default('Admin@123'),
  ADMIN_FIRST_NAME: z.string().trim().min(1).default('System'),
  ADMIN_LAST_NAME: z.string().trim().min(1).default('Admin'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnv.data;
