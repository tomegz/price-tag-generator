import { useMemo, useState } from "react";
import {
  ALL_BRANDS,
  ALL_YEARS,
  filterCatalogProducts,
  getCatalogYears
} from "../../domains/catalog/catalogFilter";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import type { CatalogFilterOption } from "./catalogAdminTypes";

type UseCatalogEditorFiltersOptions = {
  brands: string[];
  products: CatalogProduct[];
};

export type CatalogEditorFiltersState = {
  brand: string;
  brandOptions: CatalogFilterOption[];
  filteredProducts: CatalogProduct[];
  query: string;
  year: string;
  yearOptions: CatalogFilterOption[];
  setBrand(brand: string): void;
  setQuery(query: string): void;
  setYear(year: string): void;
};

export function useCatalogEditorFilters({
  brands,
  products
}: UseCatalogEditorFiltersOptions): CatalogEditorFiltersState {
  const [brand, setBrand] = useState(ALL_BRANDS);
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

  return {
    brand: activeBrand,
    brandOptions,
    filteredProducts,
    query,
    setBrand,
    setQuery,
    setYear,
    year: activeYear,
    yearOptions
  };
}
