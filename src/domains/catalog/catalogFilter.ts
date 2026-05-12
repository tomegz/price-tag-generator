import type { CatalogProduct } from "./catalogProduct";

export const ALL_BRANDS = "all";
export const ALL_YEARS = "all";

export type CatalogFilterOptions = {
  brand: string;
  query: string;
  year?: string;
};

export function filterCatalogProducts(
  products: CatalogProduct[],
  { brand, query, year = ALL_YEARS }: CatalogFilterOptions
): CatalogProduct[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter(product => {
    const matchesQuery =
      !normalizedQuery ||
      `${product.brand} ${product.model}`.toLowerCase().includes(normalizedQuery);
    const matchesBrand = brand === ALL_BRANDS || product.brand === brand;
    const matchesYear = year === ALL_YEARS || product.yearLabel === year;

    return matchesQuery && matchesBrand && matchesYear;
  });
}

export function getCatalogYears(products: CatalogProduct[]): string[] {
  const years = new Set<number>();

  products.forEach(product => {
    const year = Number(product.yearLabel);
    if (Number.isInteger(year) && year > 0) years.add(year);
  });

  return Array.from(years)
    .sort((first, second) => second - first)
    .map(String);
}

export function getLatestCatalogYears(products: CatalogProduct[], limit = 2): string[] {
  return getCatalogYears(products).slice(0, limit);
}
