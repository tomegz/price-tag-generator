import { useMemo, useState } from "react";
import Button from "../../design-system/Button";
import FilterPills from "../../design-system/FilterPills";
import Icon from "../../design-system/Icon";
import SearchInput from "../../design-system/SearchInput";
import TextField from "../../design-system/TextField";
import type { LegacyCatalogItem } from "../../domains/catalog/catalog";
import {
  ALL_BRANDS,
  catalogDraftToItem,
  draftFromItem,
  emptyCatalogDraft,
  filterCatalogProducts,
  formatPLN,
  hasActivePromotion,
  isDraftDirty,
  isDraftValid,
  type CatalogDraft,
  type CatalogProduct
} from "./catalogViewModel";

type CatalogAdminScreenProps = {
  brands: string[];
  catalogError: string;
  products: CatalogProduct[];
  onAddProduct(item: LegacyCatalogItem): Promise<void>;
  onBackToPrint(): void;
  onDeleteProduct(productId: string): Promise<void>;
  onOpenBulkPromotion(): void;
  onUpdateProduct(productId: string, item: LegacyCatalogItem): Promise<void>;
};

const draftFields: Array<keyof CatalogDraft> = ["name", "model", "year", "price", "discountPrice"];

function fieldPlaceholder(field: keyof CatalogDraft): string {
  return {
    name: "Marka",
    model: "Model",
    year: "Rok",
    price: "Cena",
    discountPrice: "Promo"
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
  onBackToPrint,
  onDeleteProduct,
  onOpenBulkPromotion,
  onUpdateProduct,
  products
}: CatalogAdminScreenProps) => {
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

  const updateDraft = (productId: string, field: keyof CatalogDraft, value: string) => {
    setDrafts(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value
      }
    }));
  };

  const startEdit = (product: CatalogProduct) => {
    setDrafts(current => ({
      ...current,
      [product.id]: draftFromItem(product)
    }));
  };

  const cancelEdit = (productId: string) => {
    setDrafts(current => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const saveEdit = async (product: CatalogProduct) => {
    const draft = drafts[product.id];
    if (!draft || !isDraftValid(draft) || !isDraftDirty(product, draft)) return;
    await onUpdateProduct(product.id, catalogDraftToItem(draft));
    cancelEdit(product.id);
  };

  const addProduct = async () => {
    if (!isDraftValid(newDraft)) return;
    await onAddProduct(catalogDraftToItem(newDraft));
    setNewDraft(emptyCatalogDraft());
    setAdding(false);
  };

  const deleteProduct = async (product: CatalogProduct) => {
    const confirmed = window.confirm(`Czy na pewno chcesz usunąć ${product.brand} ${product.model} z bazy cen?`);
    if (!confirmed) return;
    await onDeleteProduct(product.id);
  };

  const editedCount = Object.keys(drafts).length;

  return (
    <main className="admin-screen">
      <header className="admin-bar">
        <Icon name="pencil" size={14} />
        <span className="pb-mono">EDYCJA CENNIKA</span>
        <div className="admin-bar__spacer" />
        <Button icon="percent" onClick={onOpenBulkPromotion} variant="darkGhost">
          Promocja zbiorcza
        </Button>
        <Button onClick={onBackToPrint} variant="darkGhost">
          Wróć do druku
        </Button>
      </header>

      <section className="admin-title-row">
        <div>
          <h1>Cennik produktów</h1>
          <p>Każda zmiana wymaga zapisania. Wiersze zapisują się niezależnie.</p>
        </div>
        <Button icon="plus" onClick={() => setAdding(true)}>
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
        <FilterPills ariaLabel="Filtr marki" onChange={setBrand} options={brandOptions} value={brand} />
        <span className="admin-filters__count pb-mono">
          {filteredProducts.length} / {products.length}
        </span>
      </section>

      <section className="admin-table" aria-label="Cennik produktów">
        <div className="admin-table__header">
          <span>MARKA</span>
          <span>MODEL</span>
          <span>ROK</span>
          <span>CENA</span>
          <span>CENA PROMO</span>
          <span />
        </div>

        {adding ? (
          <div className="admin-row admin-row--editing">
            {draftFields.map(field => (
              <TextField
                aria-label={fieldPlaceholder(field)}
                key={field}
                numeric={field === "price" || field === "discountPrice" || field === "year"}
                onChange={event => setNewDraft(current => ({ ...current, [field]: event.target.value }))}
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

          if (editing && draft) {
            return (
              <div className="admin-row admin-row--editing" key={product.id}>
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
            <div className="admin-row" key={product.id}>
              <strong>{product.brand}</strong>
              <span>{product.model}</span>
              <span className="pb-mono muted">{product.yearLabel}</span>
              <strong className="pb-mono">{formatPLN(product.price)}</strong>
              <span className={`pb-mono ${onPromo ? "accent" : "muted"}`}>
                {onPromo ? formatPLN(product.discountPrice) : "—"}
              </span>
              <div className="admin-row__actions">
                <Button icon="pencil" onClick={() => startEdit(product)} variant="ghost">Edytuj</Button>
                <Button aria-label={`Usuń ${product.brand} ${product.model}`} icon="trash" onClick={() => void deleteProduct(product)} variant="icon" />
              </div>
            </div>
          );
        })}
      </section>

      <footer className="admin-status pb-mono">
        {editedCount > 0 ? `${editedCount} wierszy w trakcie edycji · niezapisane` : "Wszystkie zmiany zapisane"}
      </footer>
    </main>
  );
};

export default CatalogAdminScreen;
