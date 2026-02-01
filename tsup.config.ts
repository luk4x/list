import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    target: 'node18',
    splitting: false,
    minify: false,
    outExtension() {
      return { js: '.mjs' };
    },
  },
]);
