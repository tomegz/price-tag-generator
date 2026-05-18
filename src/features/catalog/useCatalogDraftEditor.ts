import { useCallback, useMemo, useState } from "react";
import {
  draftFromItem,
  type CatalogDraft
} from "@/domains/catalog/catalogDraft";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";

export type CatalogDraftEditorState = {
  drafts: Record<string, CatalogDraft>;
  editedCount: number;
  cancelEdit(productId: string): void;
  startEdit(product: CatalogProduct): void;
  updateDraft<K extends keyof CatalogDraft>(productId: string, field: K, value: CatalogDraft[K]): void;
};

export function useCatalogDraftEditor(): CatalogDraftEditorState {
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});

  const updateDraft = useCallback(<K extends keyof CatalogDraft>(productId: string, field: K, value: CatalogDraft[K]) => {
    setDrafts(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value
      }
    }));
  }, []);

  const startEdit = useCallback((product: CatalogProduct) => {
    setDrafts(current => ({
      ...current,
      [product.id]: draftFromItem(product)
    }));
  }, []);

  const cancelEdit = useCallback((productId: string) => {
    setDrafts(current => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }, []);

  const editedCount = useMemo(() => Object.keys(drafts).length, [drafts]);

  return {
    cancelEdit,
    drafts,
    editedCount,
    startEdit,
    updateDraft
  };
}
