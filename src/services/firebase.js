import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  connectDatabaseEmulator,
  get,
  getDatabase,
  onValue,
  ref,
  remove,
  set
} from 'firebase/database';
import { parseLegacyCatalogItems } from '../domains/catalog/catalog';

const defaultProjectId = 'demo-price-tag-generator';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${defaultProjectId}.firebaseapp.com`,
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    `https://${defaultProjectId}-default-rtdb.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultProjectId
};

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (import.meta.env.DEV && !useEmulators && firebaseConfig.projectId === 'pricetag-generator') {
  throw new Error(
    'Refusing to run local development against the production Firebase project. Set VITE_USE_FIREBASE_EMULATORS=true.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

if (useEmulators && !globalThis.__PRICE_TAG_FIREBASE_EMULATORS_CONNECTED__) {
  const authUrl =
    import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
  const databaseHost =
    import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1';
  const databasePort = Number(import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || 9000);

  connectAuthEmulator(auth, authUrl, { disableWarnings: true });
  connectDatabaseEmulator(database, databaseHost, databasePort);
  globalThis.__PRICE_TAG_FIREBASE_EMULATORS_CONNECTED__ = true;
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToItems(callback) {
  const itemsRef = ref(database, 'profi-bike/items');
  return onValue(itemsRef, snapshot => {
    callback(parseLegacyCatalogItems(snapshot.val()));
  });
}

export async function getOwners() {
  const ownerUidsSnapshot = await get(ref(database, 'profi-bike/ownerUids'));
  if (ownerUidsSnapshot.exists()) {
    return ownerUidsSnapshot.val();
  }

  const legacyOwnersSnapshot = await get(ref(database, 'profi-bike/owners'));
  return legacyOwnersSnapshot.val() || [];
}

export function isOwner(owners, uid) {
  if (!uid) return false;
  if (Array.isArray(owners)) return owners.includes(uid);
  return owners && owners[uid] === true;
}

export function setItem(id, item) {
  return set(ref(database, `profi-bike/items/${id}`), item);
}

export function deleteItem(id) {
  return remove(ref(database, `profi-bike/items/${id}`));
}
