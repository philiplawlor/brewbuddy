import request from 'supertest';
import express from 'express';
import { healthRouter } from '../src/routes/health';

describe('Health Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/api', healthRouter);
  });

  it('should return 200 status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('should return status as ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.status).toBe('ok');
  });

  it('should return timestamp', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.timestamp).toBeDefined();
    expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
  });

  it('should return environment', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.environment).toBe('string');
  });
});
