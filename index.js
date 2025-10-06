// Ensure DOM polyfills are applied
import './src/domPolyfill.js';

// Initialize Mermaid (this module also exports the initialized mermaid object)
import './src/mermaidParser.js';

import { initializeServer } from './src/server.js';

if (import.meta.main) {
  const PORT = process.env.PORT || 5000;
  const server = initializeServer();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
