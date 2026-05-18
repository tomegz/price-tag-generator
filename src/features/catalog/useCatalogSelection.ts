import { useCallback, useMemo, useState } from "react";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";

type SelectedProducts = Record<string, true>;

type UseCatalogSelectionOptions = {
  filteredProducts: CatalogProduct[];
  products: CatalogProduct[];
  selectableFilteredProducts: CatalogProduct[];
};

export type CatalogSelectionState = {
  allFilteredSelected: boolean;
  hiddenSelectedCount: number;
  selected: SelectedProducts;
  selectedCount: number;
  selectedProducts: CatalogProduct[];
  clearSelection(): void;
  toggleAllFiltered(): void;
  toggleProductSelection(productId: string): void;
};

export function useCatalogSelection({
  filteredProducts,
  products,
  selectableFilteredProducts
}: UseCatalogSelectionOptions): CatalogSelectionState {
  const [selected, setSelected] = useState<SelectedProducts>({});

  const selectedProducts = useMemo(
    () => products.filter(product => selected[product.id]),
    [products, selected]
  );
  const filteredProductIds = useMemo(
    () => new Set(filteredProducts.map(product => product.id)),
    [filteredProducts]
  );
  const hiddenSelectedCount = selectedProducts.filter(product => !filteredProductIds.has(product.id)).length;
  const selectedCount = selectedProducts.length;
  const allFilteredSelected =
    selectableFilteredProducts.length > 0 &&
    selectableFilteredProducts.every(product => selected[product.id]);

  const clearSelection = useCallback(() => setSelected({}), []);

  const toggleProductSelection = useCallback((productId: string) => {
    setSelected(current => {
      const next = { ...current };
      if (next[productId]) delete next[productId];
      else next[productId] = true;
      return next;
    });
  }, []);

  const toggleAllFiltered = useCallback(() => {
    setSelected(current => {
      const next = { ...current };
      if (allFilteredSelected) {
        selectableFilteredProducts.forEach(product => {
          delete next[product.id];
        });
      } else {
        selectableFilteredProducts.forEach(product => {
          next[product.id] = true;
        });
      }
      return next;
    });
  }, [allFilteredSelected, selectableFilteredProducts]);

  return {
    allFilteredSelected,
    clearSelection,
    hiddenSelectedCount,
    selected,
    selectedCount,
    selectedProducts,
    toggleAllFiltered,
    toggleProductSelection
  };
}
