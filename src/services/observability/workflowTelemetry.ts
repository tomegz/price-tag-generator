import type { PrintQueue } from "@/domains/printQueue/printQueue";
import type { RepositoryError } from "@/services/firebase/repositoryError";
import { countTelemetryItems } from "./countTelemetryItems";
import type { ObservabilityService } from "./types";

type CatalogLoadOperation = "catalog.subscribe_items";
type CatalogMutationOperation = "catalog.create" | "catalog.update" | "catalog.delete";

export const workflowTelemetry = {
  identifyAuthUser(observability: ObservabilityService, uid: string): void {
    observability.identifyUser({ uid });
  },

  clearAuthUser(observability: ObservabilityService): void {
    observability.clearUser();
  },

  trackLoginSuccess(observability: ObservabilityService): void {
    observability.trackEvent("login_success");
  },

  trackLoginFailure(observability: ObservabilityService, error: unknown): void {
    observability.trackEvent("login_failure");
    observability.captureError(error, { operation: "auth.login" });
  },

  trackLogout(observability: ObservabilityService): void {
    observability.trackEvent("logout");
    observability.clearUser();
  },

  trackScreenView(observability: ObservabilityService, screen: string): void {
    observability.trackEvent("screen_view", { screen });
  },

  trackCatalogLoadSuccess(observability: ObservabilityService, itemCount: number): void {
    observability.trackEvent("catalog_load_success", { item_count: itemCount });
  },

  trackCatalogLoadFailure(
    observability: ObservabilityService,
    operation: CatalogLoadOperation,
    error: RepositoryError
  ): void {
    observability.trackEvent("catalog_load_failure", { error_code: error.code });
    observability.captureError(error.cause || error, {
      operation,
      params: {
        error_code: error.code
      }
    });
  },

  trackCatalogItemCreate(observability: ObservabilityService): void {
    observability.trackEvent("catalog_item_create");
  },

  trackCatalogItemUpdate(observability: ObservabilityService): void {
    observability.trackEvent("catalog_item_update");
  },

  trackCatalogItemDelete(observability: ObservabilityService, itemCount = 1): void {
    if (itemCount === 1) {
      observability.trackEvent("catalog_item_delete");
      return;
    }

    observability.trackEvent("catalog_item_delete", { item_count: itemCount });
  },

  captureCatalogMutationFailure(
    observability: ObservabilityService,
    operation: CatalogMutationOperation,
    error: unknown,
    repositoryError: RepositoryError,
    itemCount?: number
  ): void {
    observability.captureError(error, {
      operation,
      params: {
        error_code: repositoryError.code,
        item_count: itemCount
      }
    });
  },

  trackBulkPromotionApply(observability: ObservabilityService, mode: string, selectedItemCount: number): void {
    observability.trackEvent("bulk_promotion_apply", {
      discount_mode: mode,
      selected_item_count: selectedItemCount
    });
  },

  captureBulkPromotionFailure(
    observability: ObservabilityService,
    error: unknown,
    repositoryError: RepositoryError,
    selectedItemCount: number
  ): void {
    observability.captureError(error, {
      operation: "bulk_promotion.apply",
      params: {
        error_code: repositoryError.code,
        selected_item_count: selectedItemCount
      }
    });
  },

  trackPrintStarted(observability: ObservabilityService, printQueue: PrintQueue): void {
    const counts = countTelemetryItems(printQueue);
    observability.trackEvent("print_started", {
      queue_item_count: counts.itemCount,
      total_tag_count: counts.totalCount
    });
  },

  trackPrintQueueAdd(observability: ObservabilityService, quantity: number, printQueue: PrintQueue): void {
    const counts = countTelemetryItems(printQueue);
    observability.trackEvent("print_queue_add", {
      quantity: Math.floor(quantity),
      queue_item_count: counts.itemCount,
      total_tag_count: counts.totalCount
    });
  },

  trackPrintQueueQuantityChange(
    observability: ObservabilityService,
    quantity: number,
    printQueue: PrintQueue
  ): void {
    const counts = countTelemetryItems(printQueue);
    observability.trackEvent(quantity <= 0 ? "print_queue_remove" : "print_queue_quantity_change", {
      quantity: quantity <= 0 ? 0 : Math.floor(quantity),
      queue_item_count: counts.itemCount,
      total_tag_count: counts.totalCount
    });
  },

  trackPrintQueueRemove(observability: ObservabilityService, printQueue: PrintQueue): void {
    const counts = countTelemetryItems(printQueue);
    observability.trackEvent("print_queue_remove", {
      queue_item_count: counts.itemCount,
      total_tag_count: counts.totalCount
    });
  },

  trackPrintQueueClear(observability: ObservabilityService, previousPrintQueue: PrintQueue): void {
    const counts = countTelemetryItems(previousPrintQueue);
    observability.trackEvent("print_queue_clear", {
      queue_item_count: counts.itemCount,
      total_tag_count: counts.totalCount
    });
  }
};
