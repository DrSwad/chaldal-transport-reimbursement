import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src', '!src/**/*.spec.*'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  dts: false,
  loader: {
    '.html': 'copy',
  },
});
