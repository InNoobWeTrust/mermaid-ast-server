import { Window } from 'happy-dom';

// Function to inject DOM polyfills from a happy-dom Window instance into the given context
function injectDOMPolyfill(context) {
  const window = new Window();

  // Explicitly assign core DOM objects to globalThis for libraries expecting them
  Object.assign(context, {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    SVGElement: window.SVGElement, // Crucial for SVG-based rendering libraries like Mermaid
    // You might need more if other Mermaid dependencies surface issues (e.g., Node, Text, DOMParser)
  });

  // Also copy other properties in case some specific ones are needed
  for (const key of Object.getOwnPropertyNames(window)) {
    if (key in context) continue;
    try {
      context[key] = window[key];
    } catch (error) {
      // Ignore errors that might occur for read-only properties or specific access issues
      // console.warn(`Could not polyfill ${key}: ${error.message}`);
    }
  }
}

// Inject DOM polyfills into the global scope
injectDOMPolyfill(globalThis);
