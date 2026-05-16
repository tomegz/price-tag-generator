import { useCallback } from "react";
import {
  catalogItemToLegacyCatalogItem,
  type CatalogItemInput
} from "../../domains/catalog/catalogItem";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "./catalogErrors";
import {
  observability as defaultObservability,
  type ObservabilityService
} from "../../services/observability";

type UseCatalogMutationsOptions = {
  createCatalogItemId?: () => string;
  handleCatalogError: CatalogErrorHandler;
  observability?: ObservabilityService;
  onCatalogItemRemoved(itemId: string): void;
  repository: CatalogWriteRepository;
};

export type CatalogMutations = {
  addCatalogItem(item: CatalogItemInput): Promise<void>;
  removeCatalogItem(itemId: string): Promise<void>;
  removeCatalogItems(itemIds: string[]): Promise<void>;
  updateCatalogItem(itemId: string, updatedItem: CatalogItemInput): Promise<void>;
};

export function useCatalogMutations({
  createCatalogItemId = createRandomCatalogItemId,
  handleCatalogError,
  observability = defaultObservability,
  onCatalogItemRemoved,
  repository
}: UseCatalogMutationsOptions): CatalogMutations {
  const addCatalogItem = useCallback(async (item: CatalogItemInput) => {
    const key = createCatalogItemId();
    try {
      await repository.saveCatalogItem(key, catalogItemToLegacyCatalogItem(item));
      observability.trackEvent("catalog_item_create");
    } catch (error) {
      const repositoryError = toFirebaseRepositoryError(error);
      handleCatalogError(repositoryError);
      observability.captureError(error, {
        operation: "catalog.create",
        params: {
          error_code: repositoryError.code
        }
      });
      throw error;
    }
  }, [createCatalogItemId, handleCatalogError, observability, repository]);

  const updateCatalogItem = useCallback(async (key: string, updatedItem: CatalogItemInput) => {
    try {
      await repository.saveCatalogItem(key, catalogItemToLegacyCatalogItem(updatedItem));
      observability.trackEvent("catalog_item_update");
    } catch (error) {
      const repositoryError = toFirebaseRepositoryError(error);
      handleCatalogError(repositoryError);
      observability.captureError(error, {
        operation: "catalog.update",
        params: {
          error_code: repositoryError.code
        }
      });
      throw error;
    }
  }, [handleCatalogError, observability, repository]);

  const removeCatalogItems = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      if (ids.length === 1) {
        await repository.deleteCatalogItem(ids[0]);
        observability.trackEvent("catalog_item_delete");
      } else {
        await repository.deleteCatalogItems(ids);
        observability.trackEvent("catalog_item_delete", { item_count: ids.length });
      }
      ids.forEach(id => onCatalogItemRemoved(id));
    } catch (error) {
      const repositoryError = toFirebaseRepositoryError(error);
      handleCatalogError(repositoryError);
      observability.captureError(error, {
        operation: "catalog.delete",
        params: {
          error_code: repositoryError.code,
          item_count: ids.length
        }
      });
      throw error;
    }
  }, [handleCatalogError, observability, onCatalogItemRemoved, repository]);

  const removeCatalogItem = useCallback(
    (id: string) => removeCatalogItems([id]),
    [removeCatalogItems]
  );

  return {
    addCatalogItem,
    removeCatalogItem,
    removeCatalogItems,
    updateCatalogItem
  };
}

function createRandomCatalogItemId(): string {
  if (globalThis.crypto?.randomUUID) {
    return `item-${globalThis.crypto.randomUUID()}`;
  }

  const randomSuffix = Math.random().toString(36).slice(2, 12);
  return `item-${Date.now()}-${randomSuffix}`;
}
