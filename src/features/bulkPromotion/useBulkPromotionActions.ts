import { useCallback } from "react";
import type { CatalogItemsById } from "../../domains/catalog/catalog";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "../../app/catalogErrors";
import {
  applyBulkPromotion,
  type BulkPromotionOptions
} from "./bulkPromotion";

type UseBulkPromotionActionsOptions = {
  catalogItems: CatalogItemsById;
  handleCatalogError: CatalogErrorHandler;
  repository: CatalogWriteRepository;
};

export type BulkPromotionActions = {
  applyPromotionToItems(productIds: string[], options: BulkPromotionOptions): Promise<void>;
};

export function useBulkPromotionActions({
  catalogItems,
  handleCatalogError,
  repository
}: UseBulkPromotionActionsOptions): BulkPromotionActions {
  const applyPromotionToItems = useCallback(async (
    productIds: string[],
    options: BulkPromotionOptions
  ) => {
    const updates = productIds.flatMap(productId => {
      const item = catalogItems[productId];
      return item ? [{ productId, item: applyBulkPromotion(item, options) }] : [];
    });
    if (updates.length === 0) return;

    try {
      await repository.saveCatalogItems(Object.fromEntries(
        updates.map(({ productId, item }) => [productId, item])
      ));
    } catch (error) {
      handleCatalogError(toFirebaseRepositoryError(error));
      throw error;
    }
  }, [catalogItems, handleCatalogError, repository]);

  return { applyPromotionToItems };
}
