import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import { useCatalogEditor } from "./useCatalogEditor";

const products: CatalogProduct[] = [
  {
    brand: "Kross",
    discountEnabled: false,
    discountPrice: 0,
    id: "item-2026",
    model: "Level",
    price: 1000,
    year: 2026,
    yearLabel: "2026"
  },
  {
    brand: "Giant",
    discountEnabled: false,
    discountPrice: 0,
    id: "item-2025",
    model: "Talon",
    price: 2000,
    year: 2025,
    yearLabel: "2025"
  },
  {
    brand: "Trek",
    discountEnabled: true,
    discountPrice: 2500,
    id: "item-2024",
    model: "Marlin",
    price: 3000,
    year: 2024,
    yearLabel: "2024"
  }
];

function renderCatalogEditor(overrides: Partial<Parameters<typeof useCatalogEditor>[0]> = {}) {
  const options: Parameters<typeof useCatalogEditor>[0] = {
    brands: ["Giant", "Kross", "Trek"],
    onAddProduct: vi.fn(async () => undefined),
    onUpdateProduct: vi.fn(async () => undefined),
    products,
    ...overrides
  };

  return {
    options,
    ...renderHook((props: Parameters<typeof useCatalogEditor>[0]) => useCatalogEditor(props), {
      initialProps: options
    })
  };
}

describe("useCatalogEditor", () => {
  it("derives filter options, filtered products, and active fallback filters", () => {
    const { options, result, rerender } = renderCatalogEditor();

    expect(result.current.brandOptions.map(option => option.value)).toEqual([
      "all",
      "Giant",
      "Kross",
      "Trek"
    ]);
    expect(result.current.yearOptions.map(option => option.value)).toEqual([
      "all",
      "2026",
      "2025",
      "2024"
    ]);

    act(() => {
      result.current.setBrand("Giant");
      result.current.setYear("2025");
      result.current.setQuery("tal");
    });

    expect(result.current.filteredProducts.map(product => product.id)).toEqual(["item-2025"]);

    rerender({
      ...options,
      products: products.filter(product => product.id !== "item-2025")
    });

    expect(result.current.brand).toBe("all");
    expect(result.current.year).toBe("all");
  });

  it("starts an add row from active filters and saves a valid new product", async () => {
    const { options, result } = renderCatalogEditor();

    act(() => {
      result.current.setBrand("Giant");
      result.current.setYear("2025");
    });
    act(() => result.current.startAdding());

    expect(result.current.adding).toBe(true);
    expect(result.current.newDraft).toMatchObject({
      brand: "Giant",
      year: "2025"
    });

    await act(async () => {
      await result.current.addProduct();
    });
    expect(options.onAddProduct).not.toHaveBeenCalled();

    act(() => {
      result.current.updateNewDraft("brand", "  Orbea  ");
      result.current.updateNewDraft("model", "  Laufey  ");
      result.current.updateNewDraft("price", "4299");
      result.current.updateNewDraft("discountEnabled", true);
      result.current.updateNewDraft("discountPrice", "3999");
    });

    await act(async () => {
      await result.current.addProduct();
    });

    expect(options.onAddProduct).toHaveBeenCalledWith({
      brand: "Orbea",
      discountEnabled: true,
      discountPrice: 3999,
      model: "Laufey",
      price: 4299,
      year: "2025"
    });
    expect(result.current.adding).toBe(false);
  });

  it("tracks edit drafts and saves only dirty valid products", async () => {
    const { options, result } = renderCatalogEditor();
    const product = products[0];

    act(() => result.current.startEdit(product));

    expect(result.current.editedCount).toBe(1);
    expect(result.current.drafts[product.id]).toMatchObject({
      brand: "Kross",
      model: "Level"
    });

    await act(async () => {
      await result.current.saveEdit(product);
    });
    expect(options.onUpdateProduct).not.toHaveBeenCalled();
    expect(result.current.editedCount).toBe(1);

    act(() => result.current.updateDraft(product.id, "model", "  Level X  "));

    await act(async () => {
      await result.current.saveEdit(product);
    });

    expect(options.onUpdateProduct).toHaveBeenCalledWith("item-2026", {
      brand: "Kross",
      discountEnabled: false,
      discountPrice: 0,
      model: "Level X",
      price: 1000,
      year: "2026"
    });
    expect(result.current.drafts[product.id]).toBeUndefined();
    expect(result.current.editedCount).toBe(0);
  });
});
