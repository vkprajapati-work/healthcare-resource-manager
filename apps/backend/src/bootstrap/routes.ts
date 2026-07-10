import type { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import { env } from '../config/env.js';
import { ImageFileCategory } from '../modules/files/files.types.js';
import { createApiRouter } from '../routes/index.js';
import { notFoundHandler } from '../middlewares/not-found.js';

const PUBLICLY_SERVABLE_CATEGORIES = new Set(
  Object.values(ImageFileCategory).map((category) => category.toLowerCase()),
);

/**
 * Only image categories (profile photos, vehicle photos) are safe to serve
 * inline from static storage. Document categories (medical licenses, IDs,
 * Aadhaar/PAN/passport scans, etc.) hold PII and must go through the
 * authenticated, ownership-checked /api/v1/files/:id/download endpoint.
 */
const guardPubliclyServableUploads = (req: Request, res: Response, next: NextFunction): void => {
  const [category] = req.path.split('/').filter(Boolean);

  if (!category || !PUBLICLY_SERVABLE_CATEGORIES.has(category.toLowerCase())) {
    res.status(404).end();
    return;
  }

  next();
};

export const registerRoutes = (app: Express): void => {
  app.use(
    env.FILE_PUBLIC_BASE_URL,
    guardPubliclyServableUploads,
    express.static(env.LOCAL_STORAGE_ROOT),
  );
  app.use('/api/v1', createApiRouter());
  app.use(notFoundHandler);
};
