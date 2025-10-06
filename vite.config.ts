import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
      name: 'mermaid-ast-server',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'hono',
        '@hono/node-server',
        'hono/logger',
        'hono/request-id',
        'pino',
        'pino-pretty',
        'mermaid',
        'happy-dom',
        'dompurify',
        'crypto',
      ],
    },
  },
  test: {
    environment: 'node',
  },
});
