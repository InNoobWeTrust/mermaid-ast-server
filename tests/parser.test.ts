import { test, describe, expect } from 'vitest';

import '../src/lib/domPolyfill';
import { mermaid, parseMermaidChartToAST } from '../src/lib/mermaidParser';

describe('Mermaid Parser Unit Test', () => {
  test('should parse a simple graph successfully', async () => {
    const simpleGraph =
      'flowchart TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;';

    const ast = await parseMermaidChartToAST(simpleGraph);

    expect(ast).toBeDefined();
    expect(ast.direction).toBeDefined();
    expect(ast.vertices).toBeTypeOf('object');
    expect(Array.isArray(ast.edges)).toBe(true);
  });

  test('should throw an error for an invalid graph using mermaid API directly', async () => {
    const invalidGraph = 'graph TD; A--B';

    await expect(
      mermaid.mermaidAPI.getDiagramFromText(invalidGraph)
    ).rejects.toThrow(/Parse error/);
  });
});
