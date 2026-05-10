import { useMemo, useState } from "react";
import FilterPills from "../../design-system/FilterPills";
import SearchInput from "../../design-system/SearchInput";
import type { PrintQueue } from "../../domains/printQueue/printQueue";
import {
  ALL_BRANDS,
  filterCatalogProducts,
  type CatalogProduct
} from "./catalogViewModel";
import ProductRow from "./ProductRow";

type ProductListProps = {
  brands: string[];
  products: CatalogProduct[];
  printQueue: PrintQueue;
  onAdd(productId: string, quantity: number): void;
};

const ProductList = ({ brands, onAdd, printQueue, products }: ProductListProps) => {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(ALL_BRANDS);

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

  return (
    <section aria-labelledby="product-list-title" className="product-list">
      <div className="product-list__header">
        <div>
          <h2 id="product-list-title">
            Produkty <span className="pb-mono">· {filteredProducts.length}</span>
          </h2>
          <p>{query || brand !== ALL_BRANDS ? "Aktywny filtr" : "Cały cennik"}</p>
        </div>
        <SearchInput
          aria-label="Szukaj produktu"
          className="product-list__search"
          onChange={event => setQuery(event.target.value)}
          placeholder="Szukaj produktu · marka, model"
          value={query}
        />
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
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <strong>Brak wyników</strong>
            <span>Spróbuj innej frazy albo wybierz inną markę.</span>
          </div>
        ) : (
          filteredProducts.map(product => (
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
