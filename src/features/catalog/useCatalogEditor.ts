import { useCallback, useMemo, useState } from "react";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  catalogDraftToItem,
  draftFromItem,
  emptyCatalogDraft,
  isDraftDirty,
  isDraftValid,
  type CatalogDraft
} from "../../domains/catalog/catalogDraft";
import {
  ALL_BRANDS,
  filterCatalogProducts
} from "../../domains/catalog/catalogFilter";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";

type FilterOption = {
  label: string;
  value: string;
};

type UseCatalogEditorOptions = {
  brands: string[];
  products: CatalogProduct[];
  confirmDelete?: (message: string) => boolean;
  onAddProduct(item: LegacyCatalogItem): Promise<void>;
  onDeleteProduct(productId: string): Promise<void>;
  onUpdateProduct(productId: string, item: LegacyCatalogItem): Promise<void>;
};

export type CatalogEditorState = {
  adding: boolean;
  brand: string;
  brandOptions: FilterOption[];
  drafts: Record<string, CatalogDraft>;
  editedCount: number;
  filteredProducts: CatalogProduct[];
  newDraft: CatalogDraft;
  query: string;
  addProduct(): Promise<void>;
  cancelEdit(productId: string): void;
  deleteProduct(product: CatalogProduct): Promise<void>;
  saveEdit(product: CatalogProduct): Promise<void>;
  setAdding(adding: boolean): void;
  setBrand(brand: string): void;
  setQuery(query: string): void;
  startEdit(product: CatalogProduct): void;
  updateDraft(productId: string, field: keyof CatalogDraft, value: string): void;
  updateNewDraft(field: keyof CatalogDraft, value: string): void;
};

export function useCatalogEditor({
  brands,
  confirmDelete = message => window.confirm(message),
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  products
}: UseCatalogEditorOptions): CatalogEditorState {
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState(ALL_BRANDS);
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});
  const [newDraft, setNewDraft] = useState<CatalogDraft>(() => emptyCatalogDraft());
  const [query, setQuery] = useState("");

  const brandOptions = useMemo(
    () => [
      { label: "Wszystkie", value: ALL_BRANDS },
      ...brands.map(item => ({ label: item, value: item }))
    ],
    [brands]
  );

  const filteredProducts = useMemo(
    () => filterCatalogProducts(products, { brand, query }),
    [brand, products, query]
  );

  const updateDraft = useCallback((productId: string, field: keyof CatalogDraft, value: string) => {
    setDrafts(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value
      }
    }));
  }, []);

  const updateNewDraft = useCallback((field: keyof CatalogDraft, value: string) => {
    setNewDraft(current => ({ ...current, [field]: value }));
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

  const saveEdit = useCallback(async (product: CatalogProduct) => {
    const draft = drafts[product.id];
    if (!draft || !isDraftValid(draft) || !isDraftDirty(product, draft)) return;
    await onUpdateProduct(product.id, catalogDraftToItem(draft));
    cancelEdit(product.id);
  }, [cancelEdit, drafts, onUpdateProduct]);

  const addProduct = useCallback(async () => {
    if (!isDraftValid(newDraft)) return;
    await onAddProduct(catalogDraftToItem(newDraft));
    setNewDraft(emptyCatalogDraft());
    setAdding(false);
  }, [newDraft, onAddProduct]);

  const deleteProduct = useCallback(async (product: CatalogProduct) => {
    const confirmed = confirmDelete(`Czy na pewno chcesz usunąć ${product.brand} ${product.model} z bazy cen?`);
    if (!confirmed) return;
    await onDeleteProduct(product.id);
  }, [confirmDelete, onDeleteProduct]);

  return {
    adding,
    addProduct,
    brand,
    brandOptions,
    cancelEdit,
    deleteProduct,
    drafts,
    editedCount: Object.keys(drafts).length,
    filteredProducts,
    newDraft,
    query,
    saveEdit,
    setAdding,
    setBrand,
    setQuery,
    startEdit,
    updateDraft,
    updateNewDraft
  };
}
