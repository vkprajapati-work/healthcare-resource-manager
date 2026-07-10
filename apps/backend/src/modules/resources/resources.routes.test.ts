import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { createApp } from '../../app.js';
import { FeatureDisabledError } from '../../shared/errors.js';
import { blockResourceCreation } from './resources.routes.js';

const buildNextMock = () => jest.fn<(error?: unknown) => void>();

describe('resources routes - authorization guard', () => {
  const app = createApp();

  it('rejects an unauthenticated create with a 401 error envelope', async () => {
    const response = await request(app).post('/api/v1/resources').send({});

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR' },
    });
  });

  it('rejects an unauthenticated update with a 401 error envelope', async () => {
    const response = await request(app)
      .patch('/api/v1/resources/665f1c2e8b3e2a0012345678')
      .send({});

    expect(response.status).toBe(401);
  });

  it('rejects an unauthenticated delete with a 401 error envelope', async () => {
    const response = await request(app).delete('/api/v1/resources/665f1c2e8b3e2a0012345678');

    expect(response.status).toBe(401);
  });
});

describe('blockResourceCreation', () => {
  it('rejects even an authenticated ADMIN with FEATURE_DISABLED, not a permissions error', () => {
    const next = buildNextMock();

    blockResourceCreation({} as Request, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(FeatureDisabledError);
    expect((error as FeatureDisabledError).statusCode).toBe(403);
    expect((error as FeatureDisabledError).code).toBe('FEATURE_DISABLED');
  });
});
