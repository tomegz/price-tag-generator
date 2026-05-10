import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import type { CatalogRepository } from "../../services/firebase";
import { useCatalogMutations } from "./useCatalogMutations";

function createCatalogRepository(): CatalogRepository {
  return {
    deleteCatalogItem: vi.fn(async () => undefined),
    saveCatalogItem: vi.fn(async () => undefined),
    saveCatalogItems: vi.fn(async () => undefined),
    subscribeCatalogBrands: vi.fn(() => vi.fn()),
    subscribeCatalogItems: vi.fn(() => vi.fn())
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
    const repository = createCatalogRepository();
    const { result } = renderHook(() =>
      useCatalogMutations({
        createCatalogItemId: () => "item123",
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved: vi.fn(),
        repository
      })
    );

    await result.current.addCatalogItem(item);

    expect(repository.saveCatalogItem).toHaveBeenCalledWith("item123", item);
  });

  it("updates existing catalog items through the injected repository", async () => {
    const repository = createCatalogRepository();
    const updatedItem = { ...item, price: 9999 };
    const { result } = renderHook(() =>
      useCatalogMutations({
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved: vi.fn(),
        repository
      })
    );

    await result.current.updateCatalogItem("item1", updatedItem);

    expect(repository.saveCatalogItem).toHaveBeenCalledWith("item1", updatedItem);
  });

  it("removes catalog items and clears dependent print queue state", async () => {
    const repository = createCatalogRepository();
    const onCatalogItemRemoved = vi.fn();
    const { result } = renderHook(() =>
      useCatalogMutations({
        handleCatalogError: vi.fn(),
        onCatalogItemRemoved,
        repository
      })
    );

    await result.current.removeCatalogItem("item1");

    expect(repository.deleteCatalogItem).toHaveBeenCalledWith("item1");
    expect(onCatalogItemRemoved).toHaveBeenCalledWith("item1");
  });
});
