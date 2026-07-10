import compression from 'compression';
import cors from 'cors';
import type { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { env } from '../config/env.js';

export const registerSecurityMiddleware = (app: Express): void => {
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL ?? true,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(mongoSanitize());
  app.use(hpp());
};
