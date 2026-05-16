import { useMemo, useState } from "react";
import type { CatalogItemInput } from "../../domains/catalog/catalogItem";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import BulkPromotionModal from "../bulkPromotion/BulkPromotionModal";
import type { BulkPromotionOptions } from "../bulkPromotion/bulkPromotion";
import { editingRowsLabel } from "./catalogAdminCopy";
import CatalogAdminFilters from "./CatalogAdminFilters";
import CatalogAdminHeader from "./CatalogAdminHeader";
import CatalogAdminTable from "./CatalogAdminTable";
import CatalogSelectionPill from "./CatalogSelectionPill";
import type { CatalogAdminMode } from "./catalogAdminTypes";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useCatalogEditor } from "./useCatalogEditor";
import { useCatalogSelection } from "./useCatalogSelection";

type DeleteConfirmState = {
  mode: "quick" | "phrase";
  products: CatalogProduct[];
};

type CatalogAdminScreenProps = {
  brands: string[];
  catalogError: string;
  products: CatalogProduct[];
  onAddProduct(item: CatalogItemInput): Promise<void>;
  onApplyBulkPromotion(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onBackToPrint(): void;
  onDeleteProduct(productId: string): Promise<void>;
  onDeleteProducts(productIds: string[]): Promise<void>;
  onUpdateProduct(productId: string, item: CatalogItemInput): Promise<void>;
};

const CatalogAdminScreen = ({
  brands,
  catalogError,
  onAddProduct,
  onApplyBulkPromotion,
  onBackToPrint,
  onDeleteProduct,
  onDeleteProducts,
  onUpdateProduct,
  products
}: CatalogAdminScreenProps) => {
  const [adminMode, setAdminMode] = useState<CatalogAdminMode>("edit");
  const [bulkPromotionOpen, setBulkPromotionOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const bulkMode = adminMode === "bulk";
  const {
    adding,
    addProduct,
    brand,
    brandOptions,
    cancelEdit,
    drafts,
    editedCount,
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
    year,
    yearOptions
  } = useCatalogEditor({
    brands,
    onAddProduct,
    onUpdateProduct,
    products
  });

  const selectableFilteredProducts = useMemo(
    () => filteredProducts.filter(product => !drafts[product.id]),
    [drafts, filteredProducts]
  );
  const {
    allFilteredSelected,
    clearSelection,
    hiddenSelectedCount,
    selected,
    selectedCount,
    selectedProducts,
    toggleAllFiltered,
    toggleProductSelection
  } = useCatalogSelection({
    filteredProducts,
    products,
    selectableFilteredProducts
  });

  const toggleAdminMode = (nextMode: CatalogAdminMode) => {
    setAdminMode(nextMode);
    if (nextMode === "edit") {
      clearSelection();
      setBulkPromotionOpen(false);
    }
  };

  const openBulkPromotion = () => {
    if (selectedCount === 0) return;
    setBulkPromotionOpen(true);
  };

  const openBulkDeleteConfirm = () => {
    if (selectedCount === 0) return;
    setDeleteConfirm({ mode: "phrase", products: selectedProducts });
  };

  const openInlineDeleteConfirm = (product: CatalogProduct) => {
    setDeleteConfirm({ mode: "quick", products: [product] });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || deleteConfirm.products.length === 0) return;
    const productIds = deleteConfirm.products.map(product => product.id);

    try {
      if (deleteConfirm.mode === "quick") {
        await onDeleteProduct(productIds[0]);
      } else {
        await onDeleteProducts(productIds);
        clearSelection();
      }
      setDeleteConfirm(null);
    } catch {
      // The mutation layer sets catalogError; keep the dialog open so the user can retry or cancel.
    }
  };

  return (
    <main className="admin-screen">
      <CatalogAdminHeader
        mode={adminMode}
        onBackToPrint={onBackToPrint}
        onModeChange={toggleAdminMode}
        onStartAdding={startAdding}
      />

      {catalogError ? <p className="app-error" role="alert">{catalogError}</p> : null}

      <CatalogAdminFilters
        brand={brand}
        brandOptions={brandOptions}
        filteredCount={filteredProducts.length}
        onBrandChange={setBrand}
        onQueryChange={setQuery}
        onYearChange={setYear}
        query={query}
        totalCount={products.length}
        year={year}
        yearOptions={yearOptions}
      />

      <CatalogAdminTable
        adding={adding}
        allFilteredSelected={allFilteredSelected}
        bulkMode={bulkMode}
        drafts={drafts}
        filteredProducts={filteredProducts}
        newDraft={newDraft}
        onAddProduct={addProduct}
        onCancelAdd={() => setAdding(false)}
        onCancelEdit={cancelEdit}
        onDeleteProduct={openInlineDeleteConfirm}
        onSaveEdit={saveEdit}
        onStartEdit={startEdit}
        onToggleAllFiltered={toggleAllFiltered}
        onToggleProductSelection={toggleProductSelection}
        onUpdateDraft={updateDraft}
        onUpdateNewDraft={updateNewDraft}
        selected={selected}
      />

      {editedCount > 0 ? (
        <footer className="admin-status pb-mono">
          <span>{editedCount}</span> {editingRowsLabel(editedCount)} · niezapisane
        </footer>
      ) : null}

      {bulkMode ? (
        <CatalogSelectionPill
          hiddenSelectedCount={hiddenSelectedCount}
          onClear={clearSelection}
          onDelete={openBulkDeleteConfirm}
          onPromotion={openBulkPromotion}
          selectedCount={selectedCount}
        />
      ) : null}

      {bulkPromotionOpen ? (
        <BulkPromotionModal
          onApply={onApplyBulkPromotion}
          onClose={() => setBulkPromotionOpen(false)}
          products={selectedProducts}
        />
      ) : null}

      {deleteConfirm ? (
        <DeleteConfirmModal
          mode={deleteConfirm.mode}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => void confirmDelete()}
          products={deleteConfirm.products}
        />
      ) : null}
    </main>
  );
};

export default CatalogAdminScreen;
