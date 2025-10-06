import { requestId } from 'hono/request-id';
import { logger as honoLogger } from 'hono/logger';

export const requestIdMiddleware = requestId();

export const httpLoggingMiddleware = process.env.DEBUG
  ? honoLogger()
  : undefined;
