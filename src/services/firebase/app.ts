import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase, type Database } from 'firebase/database';

import { readFirebaseRuntimeConfig, type FirebaseRuntimeConfig } from './config';

type FirebaseEmulatorGlobal = typeof globalThis & {
  __PRICE_TAG_FIREBASE_EMULATORS_CONNECTED__?: boolean;
};

export type FirebaseServiceInstances = {
  app: FirebaseApp;
  auth: Auth;
  database: Database;
  runtimeConfig: FirebaseRuntimeConfig;
};

export function createFirebaseServiceInstances(
  runtimeConfig = readFirebaseRuntimeConfig()
): FirebaseServiceInstances {
  const app = getApps().length > 0 ? getApp() : initializeApp(runtimeConfig.firebaseOptions);
  const auth = getAuth(app);
  const database = getDatabase(app);

  const firebaseGlobal = globalThis as FirebaseEmulatorGlobal;
  if (runtimeConfig.useEmulators && !firebaseGlobal.__PRICE_TAG_FIREBASE_EMULATORS_CONNECTED__) {
    connectAuthEmulator(auth, runtimeConfig.authEmulatorUrl, { disableWarnings: true });
    connectDatabaseEmulator(
      database,
      runtimeConfig.databaseEmulatorHost,
      runtimeConfig.databaseEmulatorPort
    );
    firebaseGlobal.__PRICE_TAG_FIREBASE_EMULATORS_CONNECTED__ = true;
  }

  return {
    app,
    auth,
    database,
    runtimeConfig
  };
}

export const firebaseServices = createFirebaseServiceInstances();
