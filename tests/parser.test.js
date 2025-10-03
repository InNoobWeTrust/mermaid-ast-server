import { test, describe } from 'node:test';
import assert from 'node:assert';

// Ensure DOM polyfills are applied for the test environment
import '../src/domPolyfill.js';
// Import the pre-initialized mermaid object
import { mermaid, parseMermaidChartToAST } from '../src/mermaidParser.js';

describe('Mermaid Parser Unit Test', () => {
  test('should parse a simple graph successfully', async () => {
    const simpleGraph =
      'flowchart TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;';
    let ast;
    try {
      ast = await parseMermaidChartToAST(simpleGraph); // Use the new function
      const astJson = JSON.stringify(ast, null, 2);
      console.log(astJson);
    } catch (error) {
      assert.fail(`Parsing failed for a simple valid graph: ${error.message}`);
    }
    assert.ok(ast, 'AST should not be empty');
    assert.ok(ast.direction, 'AST should contain direction');
    assert.ok(typeof ast.vertices === 'object' && ast.vertices !== null, 'AST should contain vertices object');
    assert.ok(Array.isArray(ast.edges), 'AST should contain edges array');
  });

  test('should throw an error for an invalid graph using mermaid API directly', async () => {
    const invalidGraph = 'graph TD; A--B'; // Invalid arrow
    await assert.rejects(
      async () => {
        // We still use mermaidAPI directly here to ensure the underlying parsing error is caught
        await mermaid.mermaidAPI.getDiagramFromText(invalidGraph);
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /Parse error/);
        return true;
      },
      'Should throw a parse error for invalid syntax'
    );
  });
});
