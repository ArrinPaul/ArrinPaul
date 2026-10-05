import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Set BASE_PATH when serving from a sub-path, for example BASE_PATH=/ArrinPaul/ on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
