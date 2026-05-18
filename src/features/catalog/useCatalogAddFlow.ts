import { useCallback, useState } from "react";
import type { CatalogItemInput } from "@/domains/catalog/catalogItem";
import {
  catalogDraftToItem,
  emptyCatalogDraft,
  isDraftValid,
  type CatalogDraft
} from "@/domains/catalog/catalogDraft";
import {
  ALL_BRANDS,
  ALL_YEARS
} from "@/domains/catalog/catalogFilter";

type UseCatalogAddFlowOptions = {
  activeBrand: string;
  activeYear: string;
  onAddProduct(item: CatalogItemInput): Promise<void>;
};

export type CatalogAddFlowState = {
  adding: boolean;
  newDraft: CatalogDraft;
  addProduct(): Promise<void>;
  setAdding(adding: boolean): void;
  startAdding(): void;
  updateNewDraft<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]): void;
};

export function useCatalogAddFlow({
  activeBrand,
  activeYear,
  onAddProduct
}: UseCatalogAddFlowOptions): CatalogAddFlowState {
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<CatalogDraft>(() => emptyCatalogDraft());

  const updateNewDraft = useCallback(<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]) => {
    setNewDraft(current => ({ ...current, [field]: value }));
  }, []);

  const addProduct = useCallback(async () => {
    if (!isDraftValid(newDraft)) return;
    await onAddProduct(catalogDraftToItem(newDraft));
    setNewDraft(emptyCatalogDraft());
    setAdding(false);
  }, [newDraft, onAddProduct]);

  const startAdding = useCallback(() => {
    setNewDraft({
      ...emptyCatalogDraft(),
      brand: activeBrand === ALL_BRANDS ? "" : activeBrand,
      year: activeYear === ALL_YEARS ? String(new Date().getFullYear()) : activeYear
    });
    setAdding(true);
  }, [activeBrand, activeYear]);

  return {
    adding,
    addProduct,
    newDraft,
    setAdding,
    startAdding,
    updateNewDraft
  };
}
