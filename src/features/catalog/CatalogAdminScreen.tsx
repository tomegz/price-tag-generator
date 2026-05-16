import { useMemo } from "react";
import type { CatalogItemInput } from "../../domains/catalog/catalogItem";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import { editingRowsLabel } from "../../domains/language/catalogCopy";
import type { BulkPromotionOptions } from "../../domains/pricing/bulkPromotion";
import BulkPromotionModal from "../bulkPromotion/BulkPromotionModal";
import CatalogAdminFilters from "./CatalogAdminFilters";
import CatalogAdminHeader from "./CatalogAdminHeader";
import CatalogAdminTable from "./CatalogAdminTable";
import CatalogSelectionPill from "./CatalogSelectionPill";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useCatalogAdminWorkflow } from "./useCatalogAdminWorkflow";
import { useCatalogEditor } from "./useCatalogEditor";
import { useCatalogSelection } from "./useCatalogSelection";
import "./CatalogAdminScreen.css";

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
  const {
    adminMode,
    bulkMode,
    bulkPromotionOpen,
    closeBulkPromotion,
    closeDeleteConfirm,
    confirmDelete,
    deleteConfirm,
    openBulkDeleteConfirm,
    openBulkPromotion,
    openInlineDeleteConfirm,
    setAdminMode
  } = useCatalogAdminWorkflow({
    clearSelection,
    onDeleteProduct,
    onDeleteProducts,
    selectedCount,
    selectedProducts
  });

  return (
    <main className="admin-screen">
      <CatalogAdminHeader
        mode={adminMode}
        onBackToPrint={onBackToPrint}
        onModeChange={setAdminMode}
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
          onClose={closeBulkPromotion}
          products={selectedProducts}
        />
      ) : null}

      {deleteConfirm ? (
        <DeleteConfirmModal
          mode={deleteConfirm.mode}
          onCancel={closeDeleteConfirm}
          onConfirm={() => void confirmDelete()}
          products={deleteConfirm.products}
        />
      ) : null}
    </main>
  );
};

export default CatalogAdminScreen;
