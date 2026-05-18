import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const relativeLayerImportPattern = (layers) => `^(?:\\.\\./)+(?:${layers.join('|')})(?:/|$)`;
const aliasedLayerImportPattern = (layers) => `^@/(?:${layers.join('|')})(?:/|$)`;

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'emulator-data', 'Design system & app redesign'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        module: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },
  {
    files: ['src/domains/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'react',
            message: 'Domain modules must stay framework-free. Move React code to features or app.'
          },
          {
            name: 'react-dom',
            message: 'Domain modules must stay framework-free. Move React DOM code to features or app.'
          }
        ],
        patterns: [
          {
            regex: relativeLayerImportPattern(['app', 'design-system', 'features', 'services']),
            message: 'Domain modules must not depend on app, UI, feature, or service layers.'
          },
          {
            regex: aliasedLayerImportPattern(['app', 'design-system', 'features', 'services']),
            message: 'Domain modules must not depend on app, UI, feature, or service layers.'
          }
        ]
      }]
    }
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            regex: relativeLayerImportPattern(['app']),
            message: 'App-layer modules compose features; move shared contracts into domains or services instead.'
          },
          {
            regex: aliasedLayerImportPattern(['app']),
            message: 'App-layer modules compose features; move shared contracts into domains or services instead.'
          },
          {
            group: ['firebase/*', '@sentry/*'],
            message: 'Feature code must use the typed service layers instead of importing SDK modules directly.'
          }
        ]
      }]
    }
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            regex: relativeLayerImportPattern(['app', 'design-system', 'features']),
            message: 'Service modules must not depend on app, UI, or feature layers.'
          },
          {
            regex: aliasedLayerImportPattern(['app', 'design-system', 'features']),
            message: 'Service modules must not depend on app, UI, or feature layers.'
          }
        ]
      }]
    }
  },
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            regex: relativeLayerImportPattern(['app', 'domains', 'features', 'services']),
            message: 'Design-system primitives must stay generic and not depend on app-specific layers.'
          },
          {
            regex: aliasedLayerImportPattern(['app', 'domains', 'features', 'services']),
            message: 'Design-system primitives must stay generic and not depend on app-specific layers.'
          }
        ]
      }]
    }
  }
);
