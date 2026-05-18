import { useCallback } from "react";
import type { CatalogItemInput } from "@/domains/catalog/catalogItem";
import {
  catalogDraftToItem,
  isDraftDirty,
  isDraftValid,
  type CatalogDraft
} from "@/domains/catalog/catalogDraft";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";

type UseCatalogEditSaveOptions = {
  drafts: Record<string, CatalogDraft>;
  onUpdateProduct(productId: string, item: CatalogItemInput): Promise<void>;
  onSaved(productId: string): void;
};

export type CatalogEditSaveState = {
  saveEdit(product: CatalogProduct): Promise<void>;
};

export function useCatalogEditSave({
  drafts,
  onSaved,
  onUpdateProduct
}: UseCatalogEditSaveOptions): CatalogEditSaveState {
  const saveEdit = useCallback(async (product: CatalogProduct) => {
    const draft = drafts[product.id];
    if (!draft || !isDraftValid(draft) || !isDraftDirty(product, draft)) return;
    await onUpdateProduct(product.id, catalogDraftToItem(draft));
    onSaved(product.id);
  }, [drafts, onSaved, onUpdateProduct]);

  return { saveEdit };
}
