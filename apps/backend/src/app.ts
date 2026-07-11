import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { configureApp } from './bootstrap/index.js';

export const createApp = (): Express => {
  const app = express();
  app.use(cookieParser());
  configureApp(app);
  return app;
};
