import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000
  }
});
