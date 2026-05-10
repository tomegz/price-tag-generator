import type { CatalogBrands, CatalogItemsById, LegacyCatalogItem } from "./catalog";

export type CatalogProduct = LegacyCatalogItem & {
  id: string;
  brand: string;
  yearLabel: string;
};

export function catalogItemsToProducts(items: CatalogItemsById): CatalogProduct[] {
  return Object.entries(items)
    .map(([id, item]) => ({
      ...item,
      id,
      brand: item.name,
      yearLabel: String(item.year || "-")
    }))
    .sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "pl"));
}

export function getCatalogBrands(products: CatalogProduct[], dbBrands: CatalogBrands = []): string[] {
  const brands = new Set<string>();
  dbBrands.forEach(brand => {
    if (brand.trim()) brands.add(brand.trim());
  });
  products.forEach(product => {
    if (product.brand.trim()) brands.add(product.brand.trim());
  });

  return [...brands].sort((a, b) => a.localeCompare(b, "pl"));
}
