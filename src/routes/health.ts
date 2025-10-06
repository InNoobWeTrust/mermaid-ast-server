import { Hono } from 'hono';
import { metrics } from '../lib/metrics';
import { parseCache } from '../lib/cache';

const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    metrics: metrics.getMetrics(),
    cache: parseCache.getStats()
  });
});

export { healthRouter };
