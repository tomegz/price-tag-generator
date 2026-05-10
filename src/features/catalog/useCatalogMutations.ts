import { useCallback } from "react";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "../../app/catalogErrors";

type UseCatalogMutationsOptions = {
  createCatalogItemId?: () => string;
  handleCatalogError: CatalogErrorHandler;
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
  onCatalogItemRemoved,
  repository
}: UseCatalogMutationsOptions): CatalogMutations {
  const addCatalogItem = useCallback(async (item: LegacyCatalogItem) => {
    const key = createCatalogItemId();
    try {
      await repository.saveCatalogItem(key, item);
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [createCatalogItemId, handleCatalogError, repository]);

  const updateCatalogItem = useCallback(async (key: string, updatedItem: LegacyCatalogItem) => {
    try {
      await repository.saveCatalogItem(key, updatedItem);
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError, repository]);

  const removeCatalogItem = useCallback(async (id: string) => {
    try {
      await repository.deleteCatalogItem(id);
      onCatalogItemRemoved(id);
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError, onCatalogItemRemoved, repository]);

  return {
    addCatalogItem,
    removeCatalogItem,
    updateCatalogItem
  };
}

function createTimestampCatalogItemId(): string {
  return `item${Date.now()}`;
}
