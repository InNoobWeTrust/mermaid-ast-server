import { Diagram } from 'mermaid/dist/Diagram';
import { logger } from '../config/logger';

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

interface DiagramAST {
  type: string;
  [key: string]: any;
}

function getDiagramAST(diagram: Diagram): DiagramAST {
  const diagramDb = diagram.db;
  const ast: DiagramAST = {
    type: diagram.type,
  };

  for (const key in diagramDb) {
    if (
      Object.prototype.hasOwnProperty.call(diagramDb, key) &&
      typeof diagramDb[key] === 'function' &&
      key.startsWith('get') &&
      diagramDb[key].length === 0
    ) {
      try {
        const propName = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
        ast[propName] = diagramDb[key]();
      } catch (error) {
        logger.warn(
          `Error calling diagramDb.${key}():`,
          (error as Error).message
        );
      }
    }
  }
  return ast;
}

async function parseMermaidChartToAST(
  diagramText: string
): Promise<DiagramAST> {
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(diagramText);
  return getDiagramAST(diagram);
}

export { mermaid, getDiagramAST, parseMermaidChartToAST };
