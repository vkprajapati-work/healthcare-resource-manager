import type { Express } from 'express';
import { errorHandler } from '../middlewares/error-handler.js';

export const registerErrorHandlers = (app: Express): void => {
  app.use(errorHandler);
};
