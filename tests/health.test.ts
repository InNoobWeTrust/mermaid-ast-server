import { test, describe, beforeAll, afterAll, expect } from 'vitest';
import { serve, ServerType } from '@hono/node-server';
import { createApp } from '../src/app';

let server: ServerType;
let serverAddress: string;

beforeAll(async () => {
  const app = createApp();
  server = serve({
    fetch: app.fetch,
    port: 0,
  });

  await new Promise<void>((resolve) => {
    server.on('listening', () => {
      const address = server.address();
      serverAddress = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('Health endpoint', () => {
  test('should return health status with metrics', async () => {
    const response = await fetch(`${serverAddress}/health`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.timestamp).toBeDefined();
    expect(json.metrics).toBeDefined();
    expect(json.cache).toBeDefined();
  });
});
