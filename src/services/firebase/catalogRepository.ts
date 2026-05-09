import { get, onValue, ref, remove, set, type Database } from 'firebase/database';

import {
  parseLegacyCatalogBrands,
  parseLegacyCatalogItem,
  parseLegacyCatalogItems,
  type CatalogBrands,
  type CatalogItemsById,
  type LegacyCatalogItem
} from '../../domains/catalog/catalog';

export const defaultStoreId = 'profi-bike';

export const catalogPaths = {
  brands(storeId = defaultStoreId) {
    return `${storeId}/brands`;
  },
  items(storeId = defaultStoreId) {
    return `${storeId}/items`;
  },
  item(itemId: string, storeId = defaultStoreId) {
    return `${storeId}/items/${itemId}`;
  }
};

export type FirebaseRepositoryError = {
  code: string;
  message: string;
  cause: unknown;
};

type SubscriptionHandlers<T> = {
  next(value: T): void;
  error?(error: FirebaseRepositoryError): void;
};

export type CatalogRepository = {
  subscribeCatalogItems(handlers: SubscriptionHandlers<CatalogItemsById>): () => void;
  subscribeCatalogBrands(handlers: SubscriptionHandlers<CatalogBrands>): () => void;
  saveCatalogItem(itemId: string, item: LegacyCatalogItem): Promise<void>;
  deleteCatalogItem(itemId: string): Promise<void>;
};

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

export function toFirebaseRepositoryError(error: unknown): FirebaseRepositoryError {
  const firebaseError = error as FirebaseErrorLike;
  return {
    code: firebaseError.code || 'unknown',
    message: firebaseError.message || 'Unknown Firebase repository error',
    cause: error
  };
}

export function isPermissionDenied(error: FirebaseRepositoryError): boolean {
  return error.code === 'PERMISSION_DENIED' || error.code === 'permission-denied';
}

export function ensureWritableCatalogItem(item: LegacyCatalogItem): LegacyCatalogItem {
  const parsed = parseLegacyCatalogItem(item);
  if (!parsed) {
    throw new Error('Invalid catalog item. Refusing to write malformed legacy DB data.');
  }
  return parsed;
}

export function createCatalogRepository(
  database: Database,
  storeId = defaultStoreId
): CatalogRepository {
  return {
    subscribeCatalogItems({ next, error }) {
      return onValue(
        ref(database, catalogPaths.items(storeId)),
        snapshot => next(parseLegacyCatalogItems(snapshot.val())),
        firebaseError => error?.(toFirebaseRepositoryError(firebaseError))
      );
    },
    subscribeCatalogBrands({ next, error }) {
      return onValue(
        ref(database, catalogPaths.brands(storeId)),
        snapshot => next(parseLegacyCatalogBrands(snapshot.val())),
        firebaseError => error?.(toFirebaseRepositoryError(firebaseError))
      );
    },
    saveCatalogItem(itemId, item) {
      return set(ref(database, catalogPaths.item(itemId, storeId)), ensureWritableCatalogItem(item));
    },
    deleteCatalogItem(itemId) {
      return remove(ref(database, catalogPaths.item(itemId, storeId)));
    }
  };
}

export async function readCatalogBrands(database: Database, storeId = defaultStoreId): Promise<CatalogBrands> {
  const snapshot = await get(ref(database, catalogPaths.brands(storeId)));
  return parseLegacyCatalogBrands(snapshot.val());
}
