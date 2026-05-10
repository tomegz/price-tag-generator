import { useCallback } from "react";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "../../app/catalogErrors";
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
  addCatalogItem(item: LegacyCatalogItem): Promise<void>;
  removeCatalogItem(itemId: string): Promise<void>;
  updateCatalogItem(itemId: string, updatedItem: LegacyCatalogItem): Promise<void>;
};

export function useCatalogMutations({
  createCatalogItemId = createTimestampCatalogItemId,
  handleCatalogError,
  observability = defaultObservability,
  onCatalogItemRemoved,
  repository
}: UseCatalogMutationsOptions): CatalogMutations {
  const addCatalogItem = useCallback(async (item: LegacyCatalogItem) => {
    const key = createCatalogItemId();
    try {
      await repository.saveCatalogItem(key, item);
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

  const updateCatalogItem = useCallback(async (key: string, updatedItem: LegacyCatalogItem) => {
    try {
      await repository.saveCatalogItem(key, updatedItem);
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

  const removeCatalogItem = useCallback(async (id: string) => {
    try {
      await repository.deleteCatalogItem(id);
      onCatalogItemRemoved(id);
      observability.trackEvent("catalog_item_delete");
    } catch (error) {
      const repositoryError = toFirebaseRepositoryError(error);
      handleCatalogError(repositoryError);
      observability.captureError(error, {
        operation: "catalog.delete",
        params: {
          error_code: repositoryError.code
        }
      });
      throw error;
    }
  }, [handleCatalogError, observability, onCatalogItemRemoved, repository]);

  return {
    addCatalogItem,
    removeCatalogItem,
    updateCatalogItem
  };
}

function createTimestampCatalogItemId(): string {
  return `item${Date.now()}`;
}
