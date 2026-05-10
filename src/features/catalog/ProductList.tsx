import { useMemo, useState } from "react";
import FilterPills from "../../design-system/FilterPills";
import Icon from "../../design-system/Icon";
import SearchInput from "../../design-system/SearchInput";
import SegmentedControl, { type SegmentedOption } from "../../design-system/SegmentedControl";
import type { PrintQueue } from "../../domains/printQueue/printQueue";
import {
  ALL_BRANDS,
  filterCatalogProducts,
  getDefaultCatalogSortDirection,
  sortCatalogProducts,
  toggleCatalogSortDirection,
  type CatalogSort,
  type CatalogSortMode,
  type CatalogProduct
} from "./catalogViewModel";
import ProductRow from "./ProductRow";

type ProductListProps = {
  brands: string[];
  products: CatalogProduct[];
  printQueue: PrintQueue;
  onAdd(productId: string, quantity: number): void;
};

const sortOptionsBase: Array<{ label: string; value: CatalogSortMode }> = [
  { label: "Marka", value: "brand" },
  { label: "Cena", value: "price" },
  { label: "Rok", value: "year" },
  { label: "Promo", value: "promo" }
];

const ProductList = ({ brands, onAdd, printQueue, products }: ProductListProps) => {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(ALL_BRANDS);
  const [sort, setSort] = useState<CatalogSort>({ mode: "brand", direction: "asc" });

  const brandOptions = useMemo(
    () => [
      { label: "Wszystkie", value: ALL_BRANDS },
      ...brands.map(item => ({ label: item, value: item }))
    ],
    [brands]
  );

  const visibleProducts = useMemo(
    () => sortCatalogProducts(filterCatalogProducts(products, { brand, query }), sort),
    [brand, products, query, sort]
  );

  const sortOptions = useMemo<Array<SegmentedOption<CatalogSortMode>>>(
    () =>
      sortOptionsBase.map(option => {
        const active = option.value === sort.mode;
        const directionLabel = sort.direction === "asc" ? "rosnąco" : "malejąco";

        return {
          value: option.value,
          ariaLabel: active ? `${option.label}, ${directionLabel}` : option.label,
          label: (
            <span className="product-list__sort-option">
              {option.label}
              {active ? (
                <Icon
                  className="product-list__sort-arrow"
                  name={sort.direction === "asc" ? "arrow-up" : "arrow-down"}
                  size={11}
                />
              ) : null}
            </span>
          )
        };
      }),
    [sort.direction, sort.mode]
  );

  const handleSortChange = (mode: CatalogSortMode) => {
    setSort(current => {
      if (current.mode === mode) {
        return { ...current, direction: toggleCatalogSortDirection(current.direction) };
      }

      return { mode, direction: getDefaultCatalogSortDirection(mode) };
    });
  };

  return (
    <section aria-labelledby="product-list-title" className="product-list">
      <div className="product-list__header">
        <div>
          <h2 id="product-list-title">
            Produkty <span className="pb-mono">· {visibleProducts.length}</span>
          </h2>
          <p>{query || brand !== ALL_BRANDS ? "Aktywny filtr" : "Cały cennik"}</p>
        </div>
        <div className="product-list__tools">
          <SearchInput
            aria-label="Szukaj produktu"
            className="product-list__search"
            onChange={event => setQuery(event.target.value)}
            placeholder="Szukaj produktu · marka, model"
            value={query}
          />
          <div className="product-list__sort">
            <span>Sortuj</span>
            <SegmentedControl<CatalogSortMode>
              ariaLabel="Sortowanie produktów"
              onChange={handleSortChange}
              options={sortOptions}
              value={sort.mode}
            />
          </div>
        </div>
      </div>

      <div className="product-list__filters">
        <FilterPills ariaLabel="Filtr marki" onChange={setBrand} options={brandOptions} value={brand} />
      </div>

      <div className="product-table__header">
        <span>PRODUKT</span>
        <span>ROK</span>
        <span>CENA</span>
        <span>STATUS</span>
        <span>ILOŚĆ</span>
      </div>

      <div className="product-list__rows">
        {visibleProducts.length === 0 ? (
          <div className="empty-state">
            <strong>Brak wyników</strong>
            <span>Spróbuj innej frazy albo wybierz inną markę.</span>
          </div>
        ) : (
          visibleProducts.map(product => (
            <ProductRow
              inQueue={printQueue[product.id] || 0}
              key={product.id}
              onAdd={onAdd}
              product={product}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default ProductList;
