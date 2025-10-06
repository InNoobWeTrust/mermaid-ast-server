import { Hono } from 'hono';
import {
  requestIdMiddleware,
  httpLoggingMiddleware,
} from './middleware/logging';
import { parseRouter } from './routes/parse';
import { healthRouter } from './routes/health';

export function createApp(): Hono {
  const app = new Hono();

  app.use('*', requestIdMiddleware);

  if (httpLoggingMiddleware) {
    app.use('*', httpLoggingMiddleware);
  }

  app.route('/parse', parseRouter);
  app.route('/health', healthRouter);

  return app;
}
