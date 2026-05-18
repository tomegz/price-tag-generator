import { useCallback } from "react";
import type { CatalogItemsById } from "@/domains/catalog/catalogItem";
import {
  type CatalogWriteRepository,
  toFirebaseRepositoryError
} from "@/services/firebase";
import type { RepositoryError } from "@/services/firebase/repositoryError";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "@/services/observability";
import {
  applyBulkPromotion,
  type BulkPromotionOptions
} from "@/domains/pricing/bulkPromotion";

type UseBulkPromotionActionsOptions = {
  catalogItems: CatalogItemsById;
  handleCatalogError(error: RepositoryError): void;
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
      await repository.saveCatalogItems(Object.fromEntries(
        updates.map(({ productId, item }) => [productId, item])
      ));
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
