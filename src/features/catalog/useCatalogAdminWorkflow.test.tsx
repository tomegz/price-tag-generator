import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import { useCatalogAdminWorkflow } from "./useCatalogAdminWorkflow";

const products: CatalogProduct[] = [
  {
    brand: "Kross",
    discountEnabled: false,
    discountPrice: 0,
    id: "item-1",
    model: "Level",
    price: 1000,
    year: 2026,
    yearLabel: "2026"
  },
  {
    brand: "Giant",
    discountEnabled: false,
    discountPrice: 0,
    id: "item-2",
    model: "Talon",
    price: 2000,
    year: 2025,
    yearLabel: "2025"
  }
];

function renderWorkflow(overrides: Partial<Parameters<typeof useCatalogAdminWorkflow>[0]> = {}) {
  const options = {
    clearSelection: vi.fn(),
    onDeleteProduct: vi.fn(async () => undefined),
    onDeleteProducts: vi.fn(async () => undefined),
    selectedCount: products.length,
    selectedProducts: products,
    ...overrides
  };

  return {
    options,
    ...renderHook(() => useCatalogAdminWorkflow(options))
  };
}

describe("useCatalogAdminWorkflow", () => {
  it("clears selection and closes promotion when leaving bulk mode", () => {
    const { options, result } = renderWorkflow();

    act(() => result.current.setAdminMode("bulk"));
    act(() => result.current.openBulkPromotion());
    expect(result.current.bulkPromotionOpen).toBe(true);

    act(() => result.current.setAdminMode("edit"));

    expect(result.current.bulkMode).toBe(false);
    expect(result.current.bulkPromotionOpen).toBe(false);
    expect(options.clearSelection).toHaveBeenCalledTimes(1);
  });

  it("confirms bulk deletes and clears selection", async () => {
    const { options, result } = renderWorkflow();

    act(() => result.current.openBulkDeleteConfirm());
    expect(result.current.deleteConfirm).toMatchObject({ mode: "phrase", products });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(options.onDeleteProducts).toHaveBeenCalledWith(["item-1", "item-2"]);
    expect(options.clearSelection).toHaveBeenCalledTimes(1);
    expect(result.current.deleteConfirm).toBeNull();
  });

  it("keeps delete confirmation open when deletion fails", async () => {
    const onDeleteProduct = vi.fn(async () => {
      throw new Error("delete failed");
    });
    const { result } = renderWorkflow({ onDeleteProduct });

    act(() => result.current.openInlineDeleteConfirm(products[0]));

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(onDeleteProduct).toHaveBeenCalledWith("item-1");
    expect(result.current.deleteConfirm).toMatchObject({ mode: "quick", products: [products[0]] });
  });
});
