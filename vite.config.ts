import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export function shouldUploadSentrySourceMaps(env: Record<string, string | undefined>): boolean {
  return Boolean(env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT);
}

export const productionCodeSplittingGroups = [
  {
    name: 'vendor-react',
    test: /node_modules[\\/](?:\.pnpm[\\/][^\\/]*(?:react|react-dom)[^\\/]*[\\/]node_modules[\\/])?(?:react|react-dom)[\\/]/,
    priority: 50
  },
  {
    name: 'vendor-firebase',
    test: /node_modules[\\/](?:\.pnpm[\\/][^\\/]*(?:@firebase|firebase)[^\\/]*[\\/]node_modules[\\/])?(?:@firebase|firebase)[\\/]/,
    priority: 40
  },
  {
    name: 'vendor-sentry-replay',
    test: /node_modules[\\/](?:\.pnpm[\\/]@sentry-internal\+(?:replay|replay-canvas)[^\\/]*[\\/]node_modules[\\/])?@sentry-internal[\\/](?:replay|replay-canvas)[\\/]/,
    priority: 35
  },
  {
    name: 'vendor-observability',
    test: /node_modules[\\/](?:\.pnpm[\\/][^\\/]*sentry[^\\/]*[\\/]node_modules[\\/])?(?:@sentry|@sentry-internal)[\\/]/,
    priority: 30
  },
  {
    name: 'observability',
    test: /src[\\/]services[\\/]observability[\\/]/,
    priority: 20
  },
  {
    name: 'vendor',
    test: /node_modules[\\/]/,
    priority: 10
  }
];

export function getProductionChunkName(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/');
  return productionCodeSplittingGroups.find(group => group.test.test(normalizedId))?.name;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sentrySourceMapsEnabled = shouldUploadSentrySourceMaps(env);

  return {
    base: '/price-tag-generator/',
    build: {
      sourcemap: sentrySourceMapsEnabled ? 'hidden' : false,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: productionCodeSplittingGroups
          }
        }
      }
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
