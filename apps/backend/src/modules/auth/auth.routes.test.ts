import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { createApp } from '../../app.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { AuthenticationError, AuthorizationError } from '../../shared/errors.js';
import { UserRole } from './auth.types.js';

const buildNextMock = () => jest.fn<(error?: unknown) => void>();

describe('auth routes - unauthenticated access', () => {
  const app = createApp();

  it('rejects GET /me without a session cookie', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR' },
    });
  });

  it('rejects POST /change-password without a session cookie', async () => {
    const response = await request(app).post('/api/v1/auth/change-password').send({});

    expect(response.status).toBe(401);
  });

  it('rejects GET /admin-check without a session cookie', async () => {
    const response = await request(app).get('/api/v1/auth/admin-check');

    expect(response.status).toBe(401);
  });

  it('rejects POST /refresh when there is no refresh-token cookie', async () => {
    const response = await request(app).post('/api/v1/auth/refresh');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR' },
    });
  });
});

describe('POST /api/v1/auth/login validation', () => {
  const app = createApp();

  it('rejects a missing email/password with a 400 validation error, before touching the database', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('rejects a malformed email with a 400 validation error', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'whatever' });

    expect(response.status).toBe(400);
  });
});

describe('authenticate middleware', () => {
  it('rejects a request with no access-token cookie', async () => {
    const next = buildNextMock();
    const req = { cookies: {} } as unknown as Request;

    await authenticate(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthenticationError);
  });

  it('rejects a malformed access-token cookie without querying the database', async () => {
    const next = buildNextMock();
    const req = { cookies: { accessToken: 'not-a-jwt' } } as unknown as Request;

    await authenticate(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthenticationError);
  });
});

describe('authorize middleware', () => {
  it('rejects when no user is attached to the request', () => {
    const next = buildNextMock();

    authorize(UserRole.ADMIN)({} as Request, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthenticationError);
  });

  it('rejects a user whose role is not in the allowed list', () => {
    const next = buildNextMock();
    const req = { user: { role: UserRole.DOCTOR } } as unknown as Request;

    authorize(UserRole.ADMIN)(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthorizationError);
  });

  it('allows a user whose role is in the allowed list', () => {
    const next = buildNextMock();
    const req = { user: { role: UserRole.ADMIN } } as unknown as Request;

    authorize(UserRole.ADMIN)(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });
});
