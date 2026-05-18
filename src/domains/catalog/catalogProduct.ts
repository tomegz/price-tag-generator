import type { CatalogItem, CatalogItemsById } from "./catalogItem";

export type CatalogProduct = CatalogItem & {
  yearLabel: string;
};

export function catalogItemsToProducts(items: CatalogItemsById): CatalogProduct[] {
  return Object.values(items)
    .map(item => ({
      ...item,
      yearLabel: String(item.year || "-")
    }))
    .sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "pl"));
}

export function getCatalogBrands(products: CatalogProduct[]): string[] {
  const brands = new Set<string>();
  products.forEach(product => {
    if (product.brand.trim()) brands.add(product.brand.trim());
  });

  return [...brands].sort((a, b) => a.localeCompare(b, "pl"));
}
