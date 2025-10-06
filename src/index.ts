import './lib/domPolyfill';
import './lib/mermaidParser';
import { serve } from '@hono/node-server';
import { createApp } from './app';
import { logger } from './config/logger';

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();

const server = serve({
  fetch: app.fetch,
  port: PORT,
});

logger.info(`Server running on http://localhost:${PORT}`);

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGQUIT', () => shutdown('SIGQUIT'));
