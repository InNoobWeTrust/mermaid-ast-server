const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

/**
 * Extracts the Abstract Syntax Tree (AST) from a Mermaid diagram object.
 * @param {object} diagram The Mermaid diagram object, obtained from mermaidAPI.getDiagramFromText.
 * @returns {object} The AST representation of the diagram.
 */
function getDiagramAST(diagram) {
  const diagramDb = diagram.db;
  const ast = {
    type: diagramDb.type,
  };

  for (const key in diagramDb) {
    if (
      Object.prototype.hasOwnProperty.call(diagramDb, key) &&
      typeof diagramDb[key] === 'function' &&
      key.startsWith('get') &&
      diagramDb[key].length === 0 // Check if the function takes no arguments
    ) {
      try {
        const propName = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
        ast[propName] = diagramDb[key]();
      } catch (error) {
        // Handle cases where a getter might throw an error or not be fully functional
        console.warn(`Error calling diagramDb.${key}():`, error.message);
      }
    }
  }
  return ast;
}

/**
 * Parses a Mermaid diagram text and returns its Abstract Syntax Tree (AST).
 * This function handles the parsing of the text and extraction of the AST in one step.
 * @param {string} diagramText The Mermaid diagram definition as a string.
 * @returns {Promise<object>} A promise that resolves to the AST representation of the diagram.
 * @throws {Error} Throws an error if the diagram text cannot be parsed.
 */
async function parseMermaidChartToAST(diagramText) {
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(diagramText);
  return getDiagramAST(diagram);
}

export { mermaid, getDiagramAST, parseMermaidChartToAST };
