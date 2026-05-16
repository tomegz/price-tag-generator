import type { CatalogDraft } from "@/domains/catalog/catalogDraft";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";
import CatalogAdminAddRow from "./CatalogAdminAddRow";
import CatalogAdminEditRow from "./CatalogAdminEditRow";
import CatalogAdminReadRow from "./CatalogAdminReadRow";

type CatalogAdminTableProps = {
  adding: boolean;
  allFilteredSelected: boolean;
  bulkMode: boolean;
  drafts: Record<string, CatalogDraft>;
  filteredProducts: CatalogProduct[];
  newDraft: CatalogDraft;
  selected: Record<string, true>;
  onAddProduct(): Promise<void>;
  onCancelAdd(): void;
  onCancelEdit(productId: string): void;
  onDeleteProduct(product: CatalogProduct): void;
  onSaveEdit(product: CatalogProduct): Promise<void>;
  onStartEdit(product: CatalogProduct): void;
  onToggleAllFiltered(): void;
  onToggleProductSelection(productId: string): void;
  onUpdateDraft<K extends keyof CatalogDraft>(productId: string, field: K, value: CatalogDraft[K]): void;
  onUpdateNewDraft<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]): void;
};

const CatalogAdminTable = ({
  adding,
  allFilteredSelected,
  bulkMode,
  drafts,
  filteredProducts,
  newDraft,
  onAddProduct,
  onCancelAdd,
  onCancelEdit,
  onDeleteProduct,
  onSaveEdit,
  onStartEdit,
  onToggleAllFiltered,
  onToggleProductSelection,
  onUpdateDraft,
  onUpdateNewDraft,
  selected
}: CatalogAdminTableProps) => (
  <section className={`admin-table${bulkMode ? " admin-table--bulk" : ""}`} aria-label="Cennik produktów">
    <div className="admin-table__header">
      {bulkMode ? (
        <label className="admin-select-all">
          <input
            aria-label="Zaznacz wszystko"
            checked={allFilteredSelected}
            onChange={onToggleAllFiltered}
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
      <CatalogAdminAddRow
        bulkMode={bulkMode}
        draft={newDraft}
        onCancel={onCancelAdd}
        onSave={onAddProduct}
        onUpdateDraft={onUpdateNewDraft}
      />
    ) : null}

    {filteredProducts.map(product => {
      const draft = drafts[product.id];

      if (draft) {
        return (
          <CatalogAdminEditRow
            bulkMode={bulkMode}
            draft={draft}
            key={product.id}
            onCancel={() => onCancelEdit(product.id)}
            onSave={() => onSaveEdit(product)}
            onUpdateDraft={(field, value) => onUpdateDraft(product.id, field, value)}
            product={product}
          />
        );
      }

      return (
        <CatalogAdminReadRow
          bulkMode={bulkMode}
          key={product.id}
          onDelete={() => onDeleteProduct(product)}
          onEdit={() => onStartEdit(product)}
          onToggleSelection={() => onToggleProductSelection(product.id)}
          product={product}
          selected={Boolean(selected[product.id])}
        />
      );
    })}
  </section>
);

export default CatalogAdminTable;
