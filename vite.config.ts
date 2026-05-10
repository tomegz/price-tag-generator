import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sentrySourceMapsEnabled = Boolean(
    env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
  );

  return {
    base: '/price-tag-generator/',
    build: {
      sourcemap: sentrySourceMapsEnabled ? 'hidden' : false
    },
    plugins: [
      react(),
      ...(sentrySourceMapsEnabled
        ? sentryVitePlugin({
            authToken: env.SENTRY_AUTH_TOKEN,
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            release: {
              name: env.VITE_SENTRY_RELEASE
            },
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map']
            }
          })
        : [])
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      setupFiles: './src/test/setup.ts'
    }
  };
});
