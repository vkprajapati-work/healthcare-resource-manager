import type { Express } from 'express';
import { registerParserMiddleware } from './parsers.js';
import { registerSecurityMiddleware } from './security.js';
import { registerErrorHandlers } from './error-handlers.js';
import { registerRoutes } from './routes.js';
import { requestLogger } from '../middlewares/request-logger.js';

export const configureApp = (app: Express): void => {
  registerSecurityMiddleware(app);
  registerParserMiddleware(app);
  app.use(requestLogger);
  registerRoutes(app);
  registerErrorHandlers(app);
};
