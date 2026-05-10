import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItemsById } from "../../domains/catalog/catalog";
import type { CatalogRepository } from "../../services/firebase";
import { useBulkPromotionActions } from "./useBulkPromotionActions";

function createCatalogRepository(): CatalogRepository {
  return {
    deleteCatalogItem: vi.fn(async () => undefined),
    saveCatalogItem: vi.fn(async () => undefined),
    subscribeCatalogBrands: vi.fn(() => vi.fn()),
    subscribeCatalogItems: vi.fn(() => vi.fn())
  };
}

function createCatalogState(initialItems: CatalogItemsById) {
  let catalogItems = initialItems;

  return {
    getCatalogItems: () => catalogItems,
    setCatalogItems: vi.fn(nextItems => {
      catalogItems =
        typeof nextItems === "function" ? nextItems(catalogItems) : nextItems;
    })
  };
}

const catalogItems: CatalogItemsById = {
  item1: {
    discountPrice: 0,
    discountStatus: "off",
    model: "Scarp",
    name: "KTM",
    price: 1000,
    year: 2026
  },
  item2: {
    discountPrice: 0,
    discountStatus: "off",
    model: "Madone",
    name: "Trek",
    price: 5000,
    year: 2026
  }
};

describe("useBulkPromotionActions", () => {
  it("applies bulk promotion updates through the injected repository", async () => {
    const repository = createCatalogRepository();
    const catalogState = createCatalogState(catalogItems);
    const { result } = renderHook(() =>
      useBulkPromotionActions({
        catalogItems,
        handleCatalogError: vi.fn(),
        repository,
        setCatalogItems: catalogState.setCatalogItems
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
      discountStatus: "on" as const
    };
    expect(repository.saveCatalogItem).toHaveBeenCalledTimes(1);
    expect(repository.saveCatalogItem).toHaveBeenCalledWith("item1", promotedItem);
    expect(catalogState.getCatalogItems()).toEqual({
      ...catalogItems,
      item1: promotedItem
    });
  });

  it("surfaces repository failures through the catalog error handler", async () => {
    const repository = createCatalogRepository();
    const error = new Error("write failed");
    vi.mocked(repository.saveCatalogItem).mockRejectedValueOnce(error);
    const handleCatalogError = vi.fn();
    const catalogState = createCatalogState(catalogItems);
    const { result } = renderHook(() =>
      useBulkPromotionActions({
        catalogItems,
        handleCatalogError,
        repository,
        setCatalogItems: catalogState.setCatalogItems
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
  });
});
