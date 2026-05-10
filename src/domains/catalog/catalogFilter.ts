import type { CatalogProduct } from "./catalogProduct";

export const ALL_BRANDS = "all";

export type CatalogFilterOptions = {
  brand: string;
  query: string;
};

export function filterCatalogProducts(
  products: CatalogProduct[],
  { brand, query }: CatalogFilterOptions
): CatalogProduct[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter(product => {
    const matchesQuery =
      !normalizedQuery ||
      `${product.brand} ${product.model}`.toLowerCase().includes(normalizedQuery);
    const matchesBrand = brand === ALL_BRANDS || product.brand === brand;

    return matchesQuery && matchesBrand;
  });
}
