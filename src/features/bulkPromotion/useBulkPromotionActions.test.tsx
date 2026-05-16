import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItemsById } from "../../domains/catalog/catalogItem";
import type { CatalogRepository } from "../../services/firebase";
import { createTestObservability } from "../../test/observability";
import { useBulkPromotionActions } from "./useBulkPromotionActions";

function createCatalogRepository(): CatalogRepository {
  return {
    deleteCatalogItem: vi.fn(async () => undefined),
    deleteCatalogItems: vi.fn(async () => undefined),
    saveCatalogItem: vi.fn(async () => undefined),
    saveCatalogItems: vi.fn(async () => undefined),
    subscribeCatalogBrands: vi.fn(() => vi.fn()),
    subscribeCatalogItems: vi.fn(() => vi.fn())
  };
}

const catalogItems: CatalogItemsById = {
  item1: {
    id: "item1",
    brand: "KTM",
    discountPrice: 0,
    discountEnabled: false,
    model: "Scarp",
    price: 1000,
    year: 2026
  },
  item2: {
    id: "item2",
    brand: "Trek",
    discountPrice: 0,
    discountEnabled: false,
    model: "Madone",
    price: 5000,
    year: 2026
  }
};

describe("useBulkPromotionActions", () => {
  it("applies bulk promotion updates through the injected repository", async () => {
    const repository = createCatalogRepository();
    const observability = createTestObservability();
    const { result } = renderHook(() =>
      useBulkPromotionActions({
        catalogItems,
        handleCatalogError: vi.fn(),
        observability,
        repository
      })
    );

    await result.current.applyPromotionToItems(["item1", "missing"], {
      amount: 50,
      mode: "percent",
      percent: 30
    });

    const promotedItem = {
      ...catalogItems.item1,
      discountPrice: 700,
      discountEnabled: true
    };
    expect(repository.saveCatalogItems).toHaveBeenCalledWith({ item1: promotedItem });
    expect(repository.saveCatalogItem).not.toHaveBeenCalled();
    expect(observability.trackEvent).toHaveBeenCalledWith("bulk_promotion_apply", {
      discount_mode: "percent",
      selected_item_count: 1
    });
  });

  it("surfaces repository failures through the catalog error handler", async () => {
    const repository = createCatalogRepository();
    const error = new Error("write failed");
    vi.mocked(repository.saveCatalogItems).mockRejectedValueOnce(error);
    const handleCatalogError = vi.fn();
    const observability = createTestObservability();
    const { result } = renderHook(() =>
      useBulkPromotionActions({
        catalogItems,
        handleCatalogError,
        observability,
        repository
      })
    );

    await expect(
      result.current.applyPromotionToItems(["item1"], {
        amount: 50,
        mode: "amount",
        percent: 30
      })
    ).rejects.toBe(error);

    expect(handleCatalogError).toHaveBeenCalledWith({
      cause: error,
      code: "unknown",
      message: "write failed"
    });
    expect(observability.captureError).toHaveBeenCalledWith(error, {
      operation: "bulk_promotion.apply",
      params: {
        error_code: "unknown",
        selected_item_count: 1
      }
    });
  });
});
