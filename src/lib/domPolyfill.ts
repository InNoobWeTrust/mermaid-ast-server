import { Window } from 'happy-dom';

function injectDOMPolyfill(context: typeof globalThis): void {
  const window = new Window();

  Object.assign(context, {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    SVGElement: window.SVGElement,
  });

  for (const key of Object.getOwnPropertyNames(window)) {
    if (key in context) continue;
    try {
      (context as any)[key] = (window as any)[key];
    } catch (_error: Error) {
      // Ignore errors for read-only properties
    }
  }
}

injectDOMPolyfill(globalThis);
