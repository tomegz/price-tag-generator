import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogItemsById, LegacyCatalogItem } from "../../domains/catalog/catalog";
import type { CatalogRepository } from "../../services/firebase";
import { useCatalogMutations } from "./useCatalogMutations";

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

const item: LegacyCatalogItem = {
  discountPrice: 0,
  discountStatus: "off",
  model: "Scarp",
  name: "KTM",
  price: 12999,
  year: 2026
};

describe("useCatalogMutations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("adds new catalog items through the injected repository", async () => {
    vi.spyOn(Date, "now").mockReturnValue(123);
    const repository = createCatalogRepository();
    const catalogState = createCatalogState({});
    const { result } = renderHook(() =>
      useCatalogMutations({
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved: vi.fn(),
        repository,
        setCatalogItems: catalogState.setCatalogItems
      })
    );

    await result.current.addCatalogItem(item);

    expect(repository.saveCatalogItem).toHaveBeenCalledWith("item123", item);
    expect(catalogState.getCatalogItems()).toEqual({ item123: item });
  });

  it("updates existing catalog items through the injected repository", async () => {
    const repository = createCatalogRepository();
    const catalogState = createCatalogState({ item1: item });
    const updatedItem = { ...item, price: 9999 };
    const { result } = renderHook(() =>
      useCatalogMutations({
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved: vi.fn(),
        repository,
        setCatalogItems: catalogState.setCatalogItems
      })
    );

    await result.current.updateCatalogItem("item1", updatedItem);

    expect(repository.saveCatalogItem).toHaveBeenCalledWith("item1", updatedItem);
    expect(catalogState.getCatalogItems()).toEqual({ item1: updatedItem });
  });

  it("removes catalog items and clears dependent print queue state", async () => {
    const repository = createCatalogRepository();
    const onCatalogItemRemoved = vi.fn();
    const catalogState = createCatalogState({ item1: item, item2: { ...item, model: "X-Caliber" } });
    const { result } = renderHook(() =>
      useCatalogMutations({
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved,
        repository,
        setCatalogItems: catalogState.setCatalogItems
      })
    );

    await result.current.removeCatalogItem("item1");

    expect(repository.deleteCatalogItem).toHaveBeenCalledWith("item1");
    expect(catalogState.getCatalogItems()).toEqual({ item2: { ...item, model: "X-Caliber" } });
    expect(onCatalogItemRemoved).toHaveBeenCalledWith("item1");
  });
});
