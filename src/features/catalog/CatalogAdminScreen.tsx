import { useMemo, useState } from "react";
import Button from "../../design-system/Button";
import FilterPills from "../../design-system/FilterPills";
import Icon from "../../design-system/Icon";
import SearchInput from "../../design-system/SearchInput";
import SegmentedControl from "../../design-system/SegmentedControl";
import TextField from "../../design-system/TextField";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  isDraftDirty,
  isDraftValid,
  type CatalogDraft
} from "../../domains/catalog/catalogDraft";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import {
  formatPLN,
  hasActivePromotion
} from "../../domains/pricing/priceFormatting";
import BulkPromotionModal from "../bulkPromotion/BulkPromotionModal";
import type { BulkPromotionOptions } from "../bulkPromotion/bulkPromotion";
import {
  editingRowsLabel,
  hiddenRowsLabel,
  selectedRowsLabel
} from "./catalogAdminCopy";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useCatalogEditor } from "./useCatalogEditor";

type AdminMode = "edit" | "bulk";

type DeleteConfirmState = {
  mode: "quick" | "phrase";
  products: CatalogProduct[];
};

type CatalogAdminScreenProps = {
  brands: string[];
  catalogError: string;
  products: CatalogProduct[];
  onAddProduct(item: LegacyCatalogItem): Promise<void>;
  onApplyBulkPromotion(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onBackToPrint(): void;
  onDeleteProduct(productId: string): Promise<void>;
  onDeleteProducts(productIds: string[]): Promise<void>;
  onUpdateProduct(productId: string, item: LegacyCatalogItem): Promise<void>;
};

const draftFields: Array<keyof CatalogDraft> = ["name", "model", "year", "price", "discountPrice"];

function fieldPlaceholder(field: keyof CatalogDraft): string {
  return {
    name: "Marka",
    model: "Model",
    year: "Rocznik",
    price: "Cena katalogowa",
    discountPrice: "Cena promocyjna"
  }[field];
}

function isFieldDirty(product: LegacyCatalogItem, draft: CatalogDraft, field: keyof CatalogDraft): boolean {
  if (field === "discountPrice") return Number(draft.discountPrice || 0) !== Number(product.discountPrice);
  if (field === "price") return Number(draft.price) !== Number(product.price);
  if (field === "year") return String(draft.year) !== String(product.year);
  return draft[field] !== product[field];
}

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
  const [adminMode, setAdminMode] = useState<AdminMode>("edit");
  const [bulkPromotionOpen, setBulkPromotionOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [selected, setSelected] = useState<Record<string, true>>({});
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
  const selectedProducts = useMemo(
    () => products.filter(product => selected[product.id]),
    [products, selected]
  );
  const filteredProductIds = useMemo(
    () => new Set(filteredProducts.map(product => product.id)),
    [filteredProducts]
  );
  const hiddenSelectedCount = selectedProducts.filter(product => !filteredProductIds.has(product.id)).length;
  const selectedCount = selectedProducts.length;
  const allFilteredSelected =
    selectableFilteredProducts.length > 0 &&
    selectableFilteredProducts.every(product => selected[product.id]);

  const clearSelection = () => setSelected({});

  const toggleAdminMode = (nextMode: AdminMode) => {
    setAdminMode(nextMode);
    if (nextMode === "edit") {
      clearSelection();
      setBulkPromotionOpen(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelected(current => {
      const next = { ...current };
      if (next[productId]) delete next[productId];
      else next[productId] = true;
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelected(current => {
      const next = { ...current };
      if (allFilteredSelected) {
        selectableFilteredProducts.forEach(product => {
          delete next[product.id];
        });
      } else {
        selectableFilteredProducts.forEach(product => {
          next[product.id] = true;
        });
      }
      return next;
    });
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
      <header className="admin-bar">
        <Icon name="pencil" size={14} />
        <span className="pb-mono">EDYCJA CENNIKA</span>
        <div className="admin-bar__spacer" />
        <SegmentedControl<AdminMode>
          ariaLabel="Tryb edycji cennika"
          className="admin-mode-toggle"
          onChange={toggleAdminMode}
          options={[
            { label: "Edycja", value: "edit" },
            { label: "Edycja zbiorcza", value: "bulk" }
          ]}
          value={adminMode}
        />
        <Button onClick={onBackToPrint} variant="darkGhost">
          Wróć do druku
        </Button>
      </header>

      <section className="admin-title-row">
        <div>
          <h1>Cennik produktów</h1>
          <p>
            {bulkMode
              ? "Zaznacz produkty w tabeli. Następnie wybierz akcję z paska na dole."
              : "Każda zmiana wymaga zapisania. Wiersze zapisują się niezależnie."}
          </p>
        </div>
        <Button icon="plus" onClick={startAdding}>
          Dodaj produkt
        </Button>
      </section>

      {catalogError ? <p className="app-error" role="alert">{catalogError}</p> : null}

      <section className="admin-filters">
        <SearchInput
          aria-label="Szukaj w cenniku"
          onChange={event => setQuery(event.target.value)}
          placeholder="Szukaj marki lub modelu..."
          value={query}
        />
        <div className="admin-filters__years">
          <span className="admin-filters__label pb-mono">ROCZNIK</span>
          <FilterPills
            ariaLabel="Filtr rocznika"
            mono
            onChange={setYear}
            options={yearOptions}
            value={year}
          />
        </div>
        <div className="admin-filters__brands">
          <span className="admin-filters__label pb-mono">MARKA</span>
          <FilterPills ariaLabel="Filtr marki" grow onChange={setBrand} options={brandOptions} value={brand} />
        </div>
        <span className="admin-filters__count pb-mono">
          {filteredProducts.length} / {products.length}
        </span>
      </section>

      <section className={`admin-table${bulkMode ? " admin-table--bulk" : ""}`} aria-label="Cennik produktów">
        <div className="admin-table__header">
          {bulkMode ? (
            <label className="admin-select-all">
              <input
                aria-label="Zaznacz wszystko"
                checked={allFilteredSelected}
                onChange={toggleAllFiltered}
                type="checkbox"
              />
              <span>ZAZNACZ WSZYSTKO</span>
            </label>
          ) : null}
          <span>MARKA</span>
          <span>MODEL</span>
          <span>ROCZNIK</span>
          <span>CENA KATALOGOWA</span>
          <span>CENA PROMOCYJNA</span>
          {!bulkMode ? <span /> : null}
        </div>

        {adding ? (
          <div className={`admin-row admin-row--editing${bulkMode ? " admin-row--bulk-editing" : ""}`} data-testid="admin-add-row">
            {bulkMode ? <span /> : null}
            {draftFields.map(field => (
              <TextField
                aria-label={fieldPlaceholder(field)}
                key={field}
                numeric={field === "price" || field === "discountPrice" || field === "year"}
                onChange={event => updateNewDraft(field, event.target.value)}
                placeholder={fieldPlaceholder(field)}
                value={newDraft[field]}
              />
            ))}
            <div className="admin-row__actions">
              <Button onClick={() => setAdding(false)} variant="ghost">Anuluj</Button>
              <Button disabled={!isDraftValid(newDraft)} icon="check" onClick={addProduct} variant="accent">Zapisz</Button>
            </div>
          </div>
        ) : null}

        {filteredProducts.map(product => {
          const draft = drafts[product.id];
          const editing = Boolean(draft);
          const dirty = draft ? isDraftValid(draft) && isDraftDirty(product, draft) : false;
          const onPromo = hasActivePromotion(product);
          const selectedRow = Boolean(selected[product.id]);

          if (editing && draft) {
            return (
              <div
                className={`admin-row admin-row--editing${bulkMode ? " admin-row--bulk-editing" : ""}`}
                data-product-id={product.id}
                data-testid="admin-product-row"
                key={product.id}
              >
                {bulkMode ? <span /> : null}
                {draftFields.map(field => (
                  <TextField
                    aria-label={fieldPlaceholder(field)}
                    className={isFieldDirty(product, draft, field) ? "admin-input--dirty" : ""}
                    key={field}
                    numeric={field === "price" || field === "discountPrice" || field === "year"}
                    onChange={event => updateDraft(product.id, field, event.target.value)}
                    placeholder={fieldPlaceholder(field)}
                    value={draft[field]}
                  />
                ))}
                <div className="admin-row__actions">
                  <Button onClick={() => cancelEdit(product.id)} variant="ghost">Anuluj</Button>
                  <Button disabled={!dirty} icon="check" onClick={() => void saveEdit(product)} variant={dirty ? "accent" : "primary"}>
                    Zapisz
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              className="admin-row"
              data-product-id={product.id}
              data-selected={bulkMode && selectedRow ? "true" : "false"}
              data-testid="admin-product-row"
              key={product.id}
              onClick={() => {
                if (bulkMode) toggleProductSelection(product.id);
              }}
            >
              {bulkMode ? (
                <label className="admin-row__select" onClick={event => event.stopPropagation()}>
                  <input
                    aria-label={`Zaznacz ${product.brand} ${product.model}`}
                    checked={selectedRow}
                    onChange={() => toggleProductSelection(product.id)}
                    type="checkbox"
                  />
                </label>
              ) : null}
              <strong>{product.brand}</strong>
              <span>{product.model}</span>
              <span className="pb-mono muted">{product.yearLabel}</span>
              <strong className="pb-mono">{formatPLN(product.price)}</strong>
              <span className={`pb-mono ${onPromo ? "accent" : "muted"}`}>
                {onPromo ? formatPLN(product.discountPrice) : "—"}
              </span>
              {!bulkMode ? (
                <div className="admin-row__actions">
                  <Button icon="pencil" onClick={() => startEdit(product)} variant="ghost">Edytuj</Button>
                  <Button
                    aria-label={`Usuń ${product.brand} ${product.model}`}
                    icon="trash"
                    onClick={() => openInlineDeleteConfirm(product)}
                    variant="icon"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {editedCount > 0 ? (
        <footer className="admin-status pb-mono">
          <span>{editedCount}</span> {editingRowsLabel(editedCount)} · niezapisane
        </footer>
      ) : null}

      {bulkMode ? (
        <SelectionPill
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

type SelectionPillProps = {
  hiddenSelectedCount: number;
  selectedCount: number;
  onClear(): void;
  onDelete(): void;
  onPromotion(): void;
};

const SelectionPill = ({
  hiddenSelectedCount,
  onClear,
  onDelete,
  onPromotion,
  selectedCount
}: SelectionPillProps) => {
  const empty = selectedCount === 0;

  return (
    <div className="selection-pill">
      <span className="selection-pill__count pb-mono" data-empty={empty ? "true" : "false"}>
        {selectedCount}
      </span>
      <span className="selection-pill__label">
        {empty ? "Zaznacz produkty, aby kontynuować" : selectedRowsLabel(selectedCount)}
        {!empty && hiddenSelectedCount > 0 ? (
          <span className="selection-pill__hint pb-mono">
            {hiddenSelectedCount} {hiddenRowsLabel(hiddenSelectedCount)} przez filtr
          </span>
        ) : null}
      </span>
      {!empty ? (
        <button className="selection-pill__clear" onClick={onClear} type="button">
          <Icon name="x" size={11} /> Wyczyść
        </button>
      ) : null}
      <span className="selection-pill__separator" />
      <button
        className="selection-pill__action selection-pill__action--promo"
        disabled={empty}
        onClick={empty ? undefined : onPromotion}
        type="button"
      >
        <Icon name="percent" size={12} /> Promocja
      </button>
      <button
        className="selection-pill__action selection-pill__action--delete"
        disabled={empty}
        onClick={empty ? undefined : onDelete}
        type="button"
      >
        <Icon name="trash" size={12} /> Usuń
      </button>
    </div>
  );
};

export default CatalogAdminScreen;
