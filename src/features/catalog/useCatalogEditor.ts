import type { CatalogItemInput } from "@/domains/catalog/catalogItem";
import type { CatalogDraft } from "@/domains/catalog/catalogDraft";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";
import type { CatalogFilterOption } from "./catalogAdminTypes";
import { useCatalogAddFlow } from "./useCatalogAddFlow";
import { useCatalogDraftEditor } from "./useCatalogDraftEditor";
import { useCatalogEditorFilters } from "./useCatalogEditorFilters";
import { useCatalogEditSave } from "./useCatalogEditSave";

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
  updateDraft<K extends keyof CatalogDraft>(productId: string, field: K, value: CatalogDraft[K]): void;
  updateNewDraft<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]): void;
};

export function useCatalogEditor({
  brands,
  onAddProduct,
  onUpdateProduct,
  products
}: UseCatalogEditorOptions): CatalogEditorState {
  const filters = useCatalogEditorFilters({ brands, products });
  const draftEditor = useCatalogDraftEditor();
  const addFlow = useCatalogAddFlow({
    activeBrand: filters.brand,
    activeYear: filters.year,
    onAddProduct
  });
  const { saveEdit } = useCatalogEditSave({
    drafts: draftEditor.drafts,
    onSaved: draftEditor.cancelEdit,
    onUpdateProduct
  });

  return {
    adding: addFlow.adding,
    addProduct: addFlow.addProduct,
    brand: filters.brand,
    brandOptions: filters.brandOptions,
    cancelEdit: draftEditor.cancelEdit,
    drafts: draftEditor.drafts,
    editedCount: draftEditor.editedCount,
    filteredProducts: filters.filteredProducts,
    newDraft: addFlow.newDraft,
    query: filters.query,
    saveEdit,
    setAdding: addFlow.setAdding,
    setBrand: filters.setBrand,
    setQuery: filters.setQuery,
    setYear: filters.setYear,
    startAdding: addFlow.startAdding,
    startEdit: draftEditor.startEdit,
    updateDraft: draftEditor.updateDraft,
    updateNewDraft: addFlow.updateNewDraft,
    year: filters.year,
    yearOptions: filters.yearOptions
  };
}
