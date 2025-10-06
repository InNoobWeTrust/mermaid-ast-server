import { test, describe, beforeAll, afterAll, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serve, ServerType } from '@hono/node-server';

import '../src/lib/domPolyfill';
import '../src/lib/mermaidParser';
import { createApp } from '../src/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      console.log(`Test server running on ${serverAddress}`);
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

const getMermaidSamples = (filePath: string): string[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const mermaidRegex = /```(?:mermaid)?\r?\n([\s\S]*?)```/g;
  const matches = markdown.matchAll(mermaidRegex);
  return Array.from(matches, (m) => m[1].trim());
};

const samples = getMermaidSamples(
  path.resolve(__dirname, 'data/mermaid_sample.md')
);

if (samples.length > 0) {
  describe('Mermaid Parser API with valid samples', () => {
    for (const [index, sample] of samples.entries()) {
      if (sample.length === 0) continue;
      test(`should parse sample ${index + 1}`, async () => {
        const response = await fetch(`${serverAddress}/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: sample,
          }),
        });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toBeDefined();
      });
    }
  });
} else {
  test.skip('No samples found in tests/data/mermaid_sample.md', () => {});
}

describe('Mermaid Parser API with invalid syntax', () => {
  test('should return 400 for invalid mermaid syntax', async () => {
    const invalidSample = 'graph TD; A--B';
    const response = await fetch(`${serverAddress}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: invalidSample }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Failed to parse Mermaid text');
  });
});
