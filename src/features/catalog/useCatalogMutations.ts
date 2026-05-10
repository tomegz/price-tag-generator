import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { CatalogItemsById, LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  catalogRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "./useCatalog";

type UseCatalogMutationsOptions = {
  handleCatalogError: CatalogErrorHandler;
  onCatalogItemRemoved(itemId: string): void;
  setCatalogItems: Dispatch<SetStateAction<CatalogItemsById>>;
};

export type CatalogMutations = {
  addCatalogItem(item: LegacyCatalogItem): Promise<void>;
  removeCatalogItem(itemId: string): Promise<void>;
  updateCatalogItem(itemId: string, updatedItem: LegacyCatalogItem): Promise<void>;
};

export function useCatalogMutations({
  handleCatalogError,
  onCatalogItemRemoved,
  setCatalogItems
}: UseCatalogMutationsOptions): CatalogMutations {
  const addCatalogItem = useCallback(async (item: LegacyCatalogItem) => {
    const key = `item${Date.now()}`;
    try {
      await catalogRepository.saveCatalogItem(key, item);
      setCatalogItems(currentItems => ({
        ...currentItems,
        [key]: item
      }));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError, setCatalogItems]);

  const updateCatalogItem = useCallback(async (key: string, updatedItem: LegacyCatalogItem) => {
    try {
      await catalogRepository.saveCatalogItem(key, updatedItem);
      setCatalogItems(currentItems => ({
        ...currentItems,
        [key]: updatedItem
      }));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError, setCatalogItems]);

  const removeCatalogItem = useCallback(async (id: string) => {
    try {
      await catalogRepository.deleteCatalogItem(id);
      setCatalogItems(currentItems => {
        const next = { ...currentItems };
        delete next[id];
        return next;
      });
      onCatalogItemRemoved(id);
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [handleCatalogError, onCatalogItemRemoved, setCatalogItems]);

  return {
    addCatalogItem,
    removeCatalogItem,
    updateCatalogItem
  };
}
