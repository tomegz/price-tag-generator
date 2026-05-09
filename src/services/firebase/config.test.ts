import { describe, expect, it } from 'vitest';

import { readFirebaseRuntimeConfig } from './config';

describe('readFirebaseRuntimeConfig', () => {
  it('uses demo config for local emulator development', () => {
    expect(
      readFirebaseRuntimeConfig({
        DEV: true,
        VITE_USE_FIREBASE_EMULATORS: 'true'
      })
    ).toMatchObject({
      firebaseOptions: {
        apiKey: 'demo-api-key',
        authDomain: 'demo-price-tag-generator.firebaseapp.com',
        databaseURL: 'https://demo-price-tag-generator-default-rtdb.firebaseio.com',
        projectId: 'demo-price-tag-generator'
      },
      useEmulators: true
    });
  });

  it('fails clearly when production config is missing', () => {
    expect(() => readFirebaseRuntimeConfig({ DEV: false })).toThrow(
      'Missing Firebase environment variables'
    );
  });

  it('refuses local development against the production project without emulators', () => {
    expect(() =>
      readFirebaseRuntimeConfig({
        DEV: true,
        VITE_FIREBASE_PROJECT_ID: 'pricetag-generator',
        VITE_USE_FIREBASE_EMULATORS: 'false'
      })
    ).toThrow('Refusing to run local development against the production Firebase project');
  });

  it('validates the database emulator port', () => {
    expect(() =>
      readFirebaseRuntimeConfig({
        DEV: true,
        VITE_USE_FIREBASE_EMULATORS: 'true',
        VITE_FIREBASE_DATABASE_EMULATOR_PORT: 'not-a-port'
      })
    ).toThrow('VITE_FIREBASE_DATABASE_EMULATOR_PORT must be a positive integer');
  });
});
