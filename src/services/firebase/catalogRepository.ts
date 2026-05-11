import { get, onValue, ref, remove, set, update, type Database } from 'firebase/database';

import type { RepositoryError } from '../../app/catalogErrors';
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

export type FirebaseRepositoryError = RepositoryError;

export type SubscriptionHandlers<T> = {
  next(value: T): void;
  error?(error: FirebaseRepositoryError): void;
};

export type CatalogReadRepository = {
  subscribeCatalogItems(handlers: SubscriptionHandlers<CatalogItemsById>): () => void;
  subscribeCatalogBrands(handlers: SubscriptionHandlers<CatalogBrands>): () => void;
};

export type CatalogWriteRepository = {
  saveCatalogItem(itemId: string, item: LegacyCatalogItem): Promise<void>;
  saveCatalogItems(items: CatalogItemsById): Promise<void>;
  deleteCatalogItem(itemId: string): Promise<void>;
  deleteCatalogItems(itemIds: string[]): Promise<void>;
};

export type CatalogRepository = CatalogReadRepository & CatalogWriteRepository;

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

export function createCatalogItemsDeletePayload(itemIds: string[]): Record<string, null> {
  return itemIds.reduce<Record<string, null>>((payload, itemId) => {
    payload[itemId] = null;
    return payload;
  }, {});
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
    saveCatalogItems(items) {
      const writableItems = Object.entries(items).reduce<CatalogItemsById>((nextItems, [itemId, item]) => {
        nextItems[itemId] = ensureWritableCatalogItem(item);
        return nextItems;
      }, {});

      if (Object.keys(writableItems).length === 0) return Promise.resolve();
      return update(ref(database, catalogPaths.items(storeId)), writableItems);
    },
    deleteCatalogItem(itemId) {
      return remove(ref(database, catalogPaths.item(itemId, storeId)));
    },
    deleteCatalogItems(itemIds) {
      if (itemIds.length === 0) return Promise.resolve();
      return update(ref(database, catalogPaths.items(storeId)), createCatalogItemsDeletePayload(itemIds));
    }
  };
}

export async function readCatalogBrands(database: Database, storeId = defaultStoreId): Promise<CatalogBrands> {
  const snapshot = await get(ref(database, catalogPaths.brands(storeId)));
  return parseLegacyCatalogBrands(snapshot.val());
}
