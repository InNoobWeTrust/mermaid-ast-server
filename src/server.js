import http from 'http';
import { parseMermaidChartToAST } from './mermaidParser.js'; // Import parseMermaidChartToAST

export function initializeServer() {
  const server = http.createServer(async (req, res) => {
    if (
      req.url === '/parse' &&
      req.method === 'POST' &&
      req.headers['content-type'] === 'application/json'
    ) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        // (Optionally) Protect against large bodies:
        if (body.length > 1e6) req.connection.destroy(); // 1MB limit
      });

      req.on('end', async () => {
        try {
          const jsonData = JSON.parse(body);
          console.log(jsonData.data);

          const ast = await parseMermaidChartToAST(jsonData.data);

          const resJson = JSON.stringify(ast, null, 2);
          console.log(resJson);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(resJson);
        } catch (error) {
          console.error('Error during mermaid parsing:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Failed to parse Mermaid text',
              details: error.message,
            })
          );
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}
