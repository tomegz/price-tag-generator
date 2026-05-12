import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.rules.test.{js,ts}'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000
  }
});
