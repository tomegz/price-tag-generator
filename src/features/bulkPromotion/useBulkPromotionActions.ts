import { useCallback } from "react";
import {
  catalogItemsToLegacyCatalogItems,
  type CatalogItemsById
} from "../../domains/catalog/catalogItem";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "../../services/firebase";
import type { CatalogErrorHandler } from "../catalog/catalogErrors";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "../../services/observability";
import {
  applyBulkPromotion,
  type BulkPromotionOptions
} from "./bulkPromotion";

type UseBulkPromotionActionsOptions = {
  catalogItems: CatalogItemsById;
  handleCatalogError: CatalogErrorHandler;
  observability?: ObservabilityService;
  repository: CatalogWriteRepository;
};

export type BulkPromotionActions = {
  applyPromotionToItems(productIds: string[], options: BulkPromotionOptions): Promise<void>;
};

export function useBulkPromotionActions({
  catalogItems,
  handleCatalogError,
  observability = defaultObservability,
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
      await repository.saveCatalogItems(catalogItemsToLegacyCatalogItems(Object.fromEntries(
        updates.map(({ productId, item }) => [productId, item])
      )));
      workflowTelemetry.trackBulkPromotionApply(observability, options.mode, updates.length);
    } catch (error) {
      const repositoryError = toFirebaseRepositoryError(error);
      handleCatalogError(repositoryError);
      workflowTelemetry.captureBulkPromotionFailure(observability, error, repositoryError, updates.length);
      throw error;
    }
  }, [catalogItems, handleCatalogError, observability, repository]);

  return { applyPromotionToItems };
}
