import { useCallback, useState } from "react";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";
import type { CatalogAdminMode } from "./catalogAdminTypes";

export type CatalogDeleteConfirmState = {
  mode: "quick" | "phrase";
  products: CatalogProduct[];
};

type UseCatalogAdminWorkflowOptions = {
  clearSelection(): void;
  onDeleteProduct(productId: string): Promise<void>;
  onDeleteProducts(productIds: string[]): Promise<void>;
  selectedCount: number;
  selectedProducts: CatalogProduct[];
};

export type CatalogAdminWorkflowState = {
  adminMode: CatalogAdminMode;
  bulkMode: boolean;
  bulkPromotionOpen: boolean;
  deleteConfirm: CatalogDeleteConfirmState | null;
  closeBulkPromotion(): void;
  confirmDelete(): Promise<void>;
  closeDeleteConfirm(): void;
  openBulkDeleteConfirm(): void;
  openBulkPromotion(): void;
  openInlineDeleteConfirm(product: CatalogProduct): void;
  setAdminMode(nextMode: CatalogAdminMode): void;
};

export function useCatalogAdminWorkflow({
  clearSelection,
  onDeleteProduct,
  onDeleteProducts,
  selectedCount,
  selectedProducts
}: UseCatalogAdminWorkflowOptions): CatalogAdminWorkflowState {
  const [adminMode, setAdminModeState] = useState<CatalogAdminMode>("edit");
  const [bulkPromotionOpen, setBulkPromotionOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CatalogDeleteConfirmState | null>(null);
  const bulkMode = adminMode === "bulk";

  const setAdminMode = useCallback((nextMode: CatalogAdminMode) => {
    setAdminModeState(nextMode);
    if (nextMode === "edit") {
      clearSelection();
      setBulkPromotionOpen(false);
    }
  }, [clearSelection]);

  const openBulkPromotion = useCallback(() => {
    if (selectedCount === 0) return;
    setBulkPromotionOpen(true);
  }, [selectedCount]);

  const closeBulkPromotion = useCallback(() => {
    setBulkPromotionOpen(false);
  }, []);

  const openBulkDeleteConfirm = useCallback(() => {
    if (selectedCount === 0) return;
    setDeleteConfirm({ mode: "phrase", products: selectedProducts });
  }, [selectedCount, selectedProducts]);

  const openInlineDeleteConfirm = useCallback((product: CatalogProduct) => {
    setDeleteConfirm({ mode: "quick", products: [product] });
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const confirmDelete = useCallback(async () => {
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
  }, [clearSelection, deleteConfirm, onDeleteProduct, onDeleteProducts]);

  return {
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
  };
}
