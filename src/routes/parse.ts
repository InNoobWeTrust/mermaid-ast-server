import { Hono, Context } from 'hono';
import { logger } from '../config/logger';
import { parseMermaidChartToAST } from '../lib/mermaidParser';
import { parseCache } from '../lib/cache';
import { metrics } from '../lib/metrics';

const parseRouter = new Hono();

parseRouter.post('/', async (c: Context) => {
  const reqId = c.get('requestId');
  metrics.incrementRequest();

  try {
    const contentType = c.req.header('content-type');

    if (contentType !== 'application/json') {
      metrics.incrementError();
      logger.warn({ requestId: reqId, contentType }, 'Invalid content type');
      return c.json({ error: 'Content-Type must be application/json' }, 400);
    }

    const jsonData = await c.req.json();
    const diagramText = jsonData.data;

    logger.debug({ requestId: reqId, data: jsonData }, 'Request received');

    // Check cache first
    let ast = parseCache.get(diagramText);
    if (ast) {
      metrics.incrementCacheHit();
      logger.debug({ requestId: reqId }, 'Cache hit');
      return c.json(ast);
    }

    // Parse and cache
    metrics.incrementCacheMiss();
    ast = await parseMermaidChartToAST(diagramText);
    parseCache.set(diagramText, ast);

    metrics.incrementSuccess();
    logger.debug({ requestId: reqId, ast }, 'Response generated');
    logger.info(
      { requestId: reqId, diagramType: ast.type },
      'Parse successful'
    );

    return c.json(ast);
  } catch (error) {
    metrics.incrementError();
    logger.error(
      { requestId: reqId, error: (error as Error).message },
      'Parse failed'
    );
    return c.json(
      {
        error: 'Failed to parse Mermaid text',
        details: (error as Error).message,
      },
      400
    );
  }
});

export { parseRouter };
