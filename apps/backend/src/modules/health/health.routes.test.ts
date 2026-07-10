import request from 'supertest';
import { createApp } from '../../app.js';

describe('GET /api/v1/health', () => {
  it('returns a 200 success envelope with the expected shape', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      status: 'OK',
      application: { name: expect.any(String), status: 'running' },
      database: { status: expect.stringMatching(/^(connected|connecting|disconnected)$/) },
    });
  });
});

describe('unknown routes', () => {
  it('returns the documented 404 error envelope', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: expect.any(String), message: expect.any(String) },
    });
  });
});
