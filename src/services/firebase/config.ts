import type { FirebaseOptions } from 'firebase/app';

const defaultProjectId = 'demo-price-tag-generator';

type FirebaseEnv = {
  DEV?: boolean;
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_DATABASE_URL?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_USE_FIREBASE_EMULATORS?: string;
  VITE_FIREBASE_AUTH_EMULATOR_URL?: string;
  VITE_FIREBASE_DATABASE_EMULATOR_HOST?: string;
  VITE_FIREBASE_DATABASE_EMULATOR_PORT?: string;
};

export type FirebaseRuntimeConfig = {
  firebaseOptions: Required<Pick<FirebaseOptions, 'apiKey' | 'authDomain' | 'databaseURL' | 'projectId'>> &
    Pick<FirebaseOptions, 'measurementId'>;
  useEmulators: boolean;
  authEmulatorUrl: string;
  databaseEmulatorHost: string;
  databaseEmulatorPort: number;
};

const envNames = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  databaseURL: 'VITE_FIREBASE_DATABASE_URL',
  projectId: 'VITE_FIREBASE_PROJECT_ID'
} as const;

export function readFirebaseRuntimeConfig(
  env: FirebaseEnv = import.meta.env
): FirebaseRuntimeConfig {
  const useEmulators = env.VITE_USE_FIREBASE_EMULATORS === 'true';
  const allowDemoFallbacks = Boolean(env.DEV) || useEmulators;

  const firebaseOptions = {
    apiKey: env.VITE_FIREBASE_API_KEY || (allowDemoFallbacks ? 'demo-api-key' : ''),
    authDomain:
      env.VITE_FIREBASE_AUTH_DOMAIN ||
      (allowDemoFallbacks ? `${defaultProjectId}.firebaseapp.com` : ''),
    databaseURL:
      env.VITE_FIREBASE_DATABASE_URL ||
      (allowDemoFallbacks ? `https://${defaultProjectId}-default-rtdb.firebaseio.com` : ''),
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
    projectId: env.VITE_FIREBASE_PROJECT_ID || (allowDemoFallbacks ? defaultProjectId : '')
  };

  const missing = Object.entries({
    apiKey: firebaseOptions.apiKey,
    authDomain: firebaseOptions.authDomain,
    databaseURL: firebaseOptions.databaseURL,
    projectId: firebaseOptions.projectId
  })
    .filter(([, value]) => !value)
    .map(([key]) => envNames[key as keyof typeof envNames]);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  }

  if (env.DEV && !useEmulators && firebaseOptions.projectId === 'pricetag-generator') {
    throw new Error(
      'Refusing to run local development against the production Firebase project. Set VITE_USE_FIREBASE_EMULATORS=true.'
    );
  }

  const databaseEmulatorPort = Number(env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || 9000);
  if (!Number.isInteger(databaseEmulatorPort) || databaseEmulatorPort <= 0) {
    throw new Error('VITE_FIREBASE_DATABASE_EMULATOR_PORT must be a positive integer.');
  }

  return {
    firebaseOptions,
    useEmulators,
    authEmulatorUrl: env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099',
    databaseEmulatorHost: env.VITE_FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1',
    databaseEmulatorPort
  };
}
