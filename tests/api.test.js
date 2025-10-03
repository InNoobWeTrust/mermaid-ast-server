import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure DOM polyfills are applied for the test environment
import '../src/domPolyfill.js';
// Initialize Mermaid for the test environment
import '../src/mermaidParser.js';

import { initializeServer } from '../src/server.js'; // Import the server initializer directly

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let serverAddress;

before(async () => {
  server = initializeServer();
  await new Promise((resolve) => {
    server.listen(0, () => {
      // Listen on a random available port
      serverAddress = `http://localhost:${server.address().port}`;
      console.log(`Test server running on ${serverAddress}`);
      resolve();
    });
  });
});

after(() => {
  server.close();
});

// Helper function to extract mermaid code blocks from markdown
const getMermaidSamples = (filePath) => {
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
        const sampleJson = sample;
        const response = await fetch(`${serverAddress}/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: sampleJson,
          }),
        });
        const json = JSON.stringify(await response.json());

        assert.strictEqual(
          response.status,
          200,
          `Failed on sample:\n${sampleJson}\njson:\n${json}`
        );
        assert.ok(
          json,
          `Response body is not valid JSON for sample:\n${sampleJson}\njson:\n${json})
      }`
        );
      });
    }
  });
} else {
  test.skip('No samples found in tests/data/mermaid_sample.md', () => { });
}

// A test for invalid syntax
describe('Mermaid Parser API with invalid syntax', () => {
  test('should return 400 for invalid mermaid syntax', async () => {
    const invalidSample = 'graph TD; A--B'; // Invalid arrow
    const response = await fetch(`${serverAddress}/parse`, {
      // Removed the extra space in the URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: invalidSample }),
    });

    assert.strictEqual(response.status, 400);
    const json = await response.json();
    assert.ok(json.error);
    assert.strictEqual(json.error, 'Failed to parse Mermaid text');
  });
});
