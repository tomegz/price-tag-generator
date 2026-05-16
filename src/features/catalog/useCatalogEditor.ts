import { useCallback, useMemo, useState } from "react";
import type { CatalogItemInput } from "../../domains/catalog/catalogItem";
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
  ALL_YEARS,
  filterCatalogProducts,
  getCatalogYears
} from "../../domains/catalog/catalogFilter";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import type { CatalogFilterOption } from "./catalogAdminTypes";

type UseCatalogEditorOptions = {
  brands: string[];
  products: CatalogProduct[];
  onAddProduct(item: CatalogItemInput): Promise<void>;
  onUpdateProduct(productId: string, item: CatalogItemInput): Promise<void>;
};

export type CatalogEditorState = {
  adding: boolean;
  brand: string;
  brandOptions: CatalogFilterOption[];
  drafts: Record<string, CatalogDraft>;
  editedCount: number;
  filteredProducts: CatalogProduct[];
  newDraft: CatalogDraft;
  query: string;
  year: string;
  yearOptions: CatalogFilterOption[];
  addProduct(): Promise<void>;
  cancelEdit(productId: string): void;
  saveEdit(product: CatalogProduct): Promise<void>;
  setAdding(adding: boolean): void;
  setBrand(brand: string): void;
  setQuery(query: string): void;
  setYear(year: string): void;
  startAdding(): void;
  startEdit(product: CatalogProduct): void;
  updateDraft(productId: string, field: keyof CatalogDraft, value: string): void;
  updateNewDraft(field: keyof CatalogDraft, value: string): void;
};

export function useCatalogEditor({
  brands,
  onAddProduct,
  onUpdateProduct,
  products
}: UseCatalogEditorOptions): CatalogEditorState {
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState(ALL_BRANDS);
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});
  const [newDraft, setNewDraft] = useState<CatalogDraft>(() => emptyCatalogDraft());
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(ALL_YEARS);

  const brandOptions = useMemo(
    () => [
      { label: "Wszystkie", value: ALL_BRANDS },
      ...brands.map(item => ({ label: item, value: item }))
    ],
    [brands]
  );

  const yearOptions = useMemo(
    () => [
      { label: "Wszystkie", value: ALL_YEARS },
      ...getCatalogYears(products).map(item => ({ label: item, value: item }))
    ],
    [products]
  );

  const productBrands = useMemo(
    () => new Set(products.map(product => product.brand).filter(Boolean)),
    [products]
  );
  const productYears = useMemo(
    () => new Set(getCatalogYears(products)),
    [products]
  );

  const activeBrand = brand === ALL_BRANDS || productBrands.has(brand) ? brand : ALL_BRANDS;
  const activeYear = year === ALL_YEARS || productYears.has(year) ? year : ALL_YEARS;

  const filteredProducts = useMemo(
    () => filterCatalogProducts(products, { brand: activeBrand, query, year: activeYear }),
    [activeBrand, activeYear, products, query]
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
    brand: activeBrand,
    brandOptions,
    cancelEdit,
    drafts,
    editedCount: Object.keys(drafts).length,
    filteredProducts,
    newDraft,
    query,
    saveEdit,
    setAdding,
    setBrand,
    setQuery,
    setYear,
    startAdding,
    startEdit,
    updateDraft,
    updateNewDraft,
    year: activeYear,
    yearOptions
  };
}
