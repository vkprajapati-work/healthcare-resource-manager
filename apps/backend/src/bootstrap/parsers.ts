import type { Express } from 'express';
import express from 'express';
import { env } from '../config/env.js';

export const registerParserMiddleware = (app: Express): void => {
  app.use(express.json({ limit: env.REQUEST_BODY_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.REQUEST_BODY_SIZE_LIMIT }));
};
