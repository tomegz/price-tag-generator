import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../../app/authUser";
import {
  getCatalogErrorMessage,
  type CatalogErrorHandler,
  type RepositoryError
} from "../../app/catalogErrors";
import type { CatalogBrands, CatalogItemsById } from "../../domains/catalog/catalog";
import type { CatalogReadRepository } from "../../services/firebase";
import {
  catalogItemsToProducts,
  getCatalogBrands,
  type CatalogProduct
} from "../../domains/catalog/catalogProduct";

type CatalogDataState = {
  brands: CatalogBrands;
  brandsLoadedForUid: string | null;
  error: string;
  items: CatalogItemsById;
  itemsLoadedForUid: string | null;
};

const emptyCatalogItems: CatalogItemsById = {};
const emptyCatalogBrands: CatalogBrands = [];

export type CatalogState = {
  brands: string[];
  catalogError: string;
  catalogItems: CatalogItemsById;
  catalogLoading: boolean;
  handleCatalogError: CatalogErrorHandler;
  products: CatalogProduct[];
};

export function useCatalog(
  currentUser: AuthUser | null,
  repository: CatalogReadRepository
): CatalogState {
  const activeUid = currentUser?.uid ?? null;
  const [catalogData, setCatalogData] = useState<CatalogDataState>({
    brands: [],
    brandsLoadedForUid: null,
    error: "",
    items: {},
    itemsLoadedForUid: null
  });

  const handleCatalogError = useCallback((error: RepositoryError) => {
    setCatalogData(currentData => ({
      ...currentData,
      error: getCatalogErrorMessage(error)
    }));
  }, []);

  useEffect(() => {
    if (!activeUid) return undefined;

    const unsubscribeItems = repository.subscribeCatalogItems({
      next: items => {
        setCatalogData(currentData => ({
          ...currentData,
          error: "",
          items,
          itemsLoadedForUid: activeUid
        }));
      },
      error: handleCatalogError
    });

    const unsubscribeBrands = repository.subscribeCatalogBrands({
      next: brands => {
        setCatalogData(currentData => ({
          ...currentData,
          brands,
          brandsLoadedForUid: activeUid
        }));
      },
      error: handleCatalogError
    });

    return () => {
      unsubscribeItems();
      unsubscribeBrands();
    };
  }, [activeUid, handleCatalogError, repository]);

  const catalogItems =
    activeUid && catalogData.itemsLoadedForUid === activeUid ? catalogData.items : emptyCatalogItems;
  const catalogBrands =
    activeUid && catalogData.brandsLoadedForUid === activeUid ? catalogData.brands : emptyCatalogBrands;
  const catalogError = activeUid ? catalogData.error : "";
  const catalogLoading = Boolean(activeUid && catalogData.itemsLoadedForUid !== activeUid && !catalogError);

  const products = useMemo(() => catalogItemsToProducts(catalogItems), [catalogItems]);
  const brands = useMemo(() => getCatalogBrands(products, catalogBrands), [catalogBrands, products]);

  return {
    brands,
    catalogError,
    catalogItems,
    catalogLoading,
    handleCatalogError,
    products
  };
}
