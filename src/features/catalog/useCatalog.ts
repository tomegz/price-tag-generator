import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "firebase/auth";
import type { CatalogBrands, CatalogItemsById } from "../../domains/catalog/catalog";
import {
  isPermissionDenied,
  type CatalogRepository,
  type FirebaseRepositoryError
} from "../../services/firebase";
import {
  catalogItemsToProducts,
  getCatalogBrands,
  type CatalogProduct
} from "./catalogViewModel";

type CatalogDataState = {
  brands: CatalogBrands;
  brandsLoadedForUid: string | null;
  error: string;
  items: CatalogItemsById;
  itemsLoadedForUid: string | null;
};

const emptyCatalogItems: CatalogItemsById = {};
const emptyCatalogBrands: CatalogBrands = [];

export type CatalogErrorHandler = (error: FirebaseRepositoryError) => void;

export type CatalogState = {
  brands: string[];
  catalogError: string;
  catalogItems: CatalogItemsById;
  catalogLoading: boolean;
  handleCatalogError: CatalogErrorHandler;
  products: CatalogProduct[];
  setCatalogItems: Dispatch<SetStateAction<CatalogItemsById>>;
};

export function useCatalog(
  currentUser: User | null,
  repository: CatalogRepository
): CatalogState {
  const activeUid = currentUser?.uid ?? null;
  const [catalogData, setCatalogData] = useState<CatalogDataState>({
    brands: [],
    brandsLoadedForUid: null,
    error: "",
    items: {},
    itemsLoadedForUid: null
  });

  const handleCatalogError = useCallback((error: FirebaseRepositoryError) => {
    const message = isPermissionDenied(error)
      ? "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
      : "Nie udało się zapisać lub pobrać danych katalogu.";
    setCatalogData(currentData => ({
      ...currentData,
      error: message
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

  const setCatalogItems: Dispatch<SetStateAction<CatalogItemsById>> = useCallback((nextItems) => {
    setCatalogData(currentData => {
      const items = typeof nextItems === "function" ? nextItems(currentData.items) : nextItems;

      return {
        ...currentData,
        error: "",
        items,
        itemsLoadedForUid: activeUid
      };
    });
  }, [activeUid]);

  const products = useMemo(() => catalogItemsToProducts(catalogItems), [catalogItems]);
  const brands = useMemo(() => getCatalogBrands(products, catalogBrands), [catalogBrands, products]);

  return {
    brands,
    catalogError,
    catalogItems,
    catalogLoading,
    handleCatalogError,
    products,
    setCatalogItems
  };
}
