import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthUser } from "@/domains/auth/authUser";
import type { RepositoryError } from "@/services/firebase/repositoryError";
import {
  getCatalogErrorMessage,
  type CatalogErrorHandler
} from "./catalogErrors";
import type { CatalogItemsById } from "@/domains/catalog/catalogItem";
import type { CatalogReadRepository } from "@/services/firebase";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "@/services/observability";
import {
  catalogItemsToProducts,
  getCatalogBrands,
  type CatalogProduct
} from "@/domains/catalog/catalogProduct";

type CatalogDataState = {
  error: string;
  items: CatalogItemsById;
  itemsLoadedForUid: string | null;
};

const emptyCatalogItems: CatalogItemsById = {};

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
  repository: CatalogReadRepository,
  observability: ObservabilityService = defaultObservability
): CatalogState {
  const activeUid = currentUser?.uid ?? null;
  const trackedCatalogLoadsRef = useRef(new Set<string>());
  const [catalogData, setCatalogData] = useState<CatalogDataState>({
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
        if (!trackedCatalogLoadsRef.current.has(activeUid)) {
          workflowTelemetry.trackCatalogLoadSuccess(observability, Object.keys(items).length);
          trackedCatalogLoadsRef.current.add(activeUid);
        }
      },
      error: error => {
        handleCatalogError(error);
        workflowTelemetry.trackCatalogLoadFailure(observability, "catalog.subscribe_items", error);
      }
    });

    return () => {
      unsubscribeItems();
    };
  }, [activeUid, handleCatalogError, observability, repository]);

  const catalogItems =
    activeUid && catalogData.itemsLoadedForUid === activeUid ? catalogData.items : emptyCatalogItems;
  const catalogError = activeUid ? catalogData.error : "";
  const catalogLoading = Boolean(activeUid && catalogData.itemsLoadedForUid !== activeUid && !catalogError);

  const products = useMemo(() => catalogItemsToProducts(catalogItems), [catalogItems]);
  const brands = useMemo(() => getCatalogBrands(products), [products]);

  return {
    brands,
    catalogError,
    catalogItems,
    catalogLoading,
    handleCatalogError,
    products
  };
}
