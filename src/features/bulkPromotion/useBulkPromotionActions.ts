import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { CatalogItemsById } from "../../domains/catalog/catalog";
import {
  catalogRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "../catalog/useCatalog";
import {
  applyBulkPromotion,
  type BulkPromotionOptions
} from "./bulkPromotion";

type UseBulkPromotionActionsOptions = {
  catalogItems: CatalogItemsById;
  handleCatalogError: CatalogErrorHandler;
  setCatalogItems: Dispatch<SetStateAction<CatalogItemsById>>;
};

export type BulkPromotionActions = {
  applyPromotionToItems(productIds: string[], options: BulkPromotionOptions): Promise<void>;
};

export function useBulkPromotionActions({
  catalogItems,
  handleCatalogError,
  setCatalogItems
}: UseBulkPromotionActionsOptions): BulkPromotionActions {
  const applyPromotionToItems = useCallback(async (
    productIds: string[],
    options: BulkPromotionOptions
  ) => {
    const updates = productIds.flatMap(productId => {
      const item = catalogItems[productId];
      return item ? [{ productId, item: applyBulkPromotion(item, options) }] : [];
    });

    try {
      await Promise.all(
        updates.map(({ productId, item }) => catalogRepository.saveCatalogItem(productId, item))
      );

      setCatalogItems(currentItems => {
        const next = { ...currentItems };
        updates.forEach(({ productId, item }) => {
          next[productId] = item;
        });
        return next;
      });
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [catalogItems, handleCatalogError, setCatalogItems]);

  return { applyPromotionToItems };
}
