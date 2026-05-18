import { hasActivePromotion } from "@/domains/pricing/priceFormatting";
import type { CatalogProduct } from "./catalogProduct";

export type CatalogSortMode = "brand" | "price" | "year" | "promo";
export type CatalogSortDirection = "asc" | "desc";

export type CatalogSort = {
  mode: CatalogSortMode;
  direction: CatalogSortDirection;
};

export function getDefaultCatalogSortDirection(mode: CatalogSortMode): CatalogSortDirection {
  return mode === "brand" ? "asc" : "desc";
}

export function toggleCatalogSortDirection(direction: CatalogSortDirection): CatalogSortDirection {
  return direction === "asc" ? "desc" : "asc";
}

export function sortCatalogProducts(
  products: CatalogProduct[],
  sort: CatalogSort | CatalogSortMode
): CatalogProduct[] {
  const activeSort = typeof sort === "string"
    ? { mode: sort, direction: getDefaultCatalogSortDirection(sort) }
    : sort;
  const directionFactor = activeSort.direction === "asc" ? 1 : -1;

  return [...products].sort((a, b) => {
    const primarySort = catalogSortComparators[activeSort.mode](a, b);
    if (primarySort !== 0) return primarySort * directionFactor;

    const brandSort = compareCatalogProductIdentity(a, b);
    return activeSort.mode === "brand" ? brandSort * directionFactor : brandSort;
  });
}

type CatalogProductComparator = (first: CatalogProduct, second: CatalogProduct) => number;

const catalogSortComparators: Record<CatalogSortMode, CatalogProductComparator> = {
  brand: compareCatalogProductIdentity,
  price: (first, second) => compareNumericValues(first.price, second.price),
  year: (first, second) => compareNumericValues(first.year, second.year),
  promo: (first, second) => Number(hasActivePromotion(first)) - Number(hasActivePromotion(second))
};

function compareCatalogProductIdentity(first: CatalogProduct, second: CatalogProduct): number {
  return `${first.brand} ${first.model}`.localeCompare(`${second.brand} ${second.model}`, "pl");
}

function compareNumericValues(first: number | string, second: number | string): number {
  const firstNumber = Number(first);
  const secondNumber = Number(second);

  if (!Number.isFinite(firstNumber) && !Number.isFinite(secondNumber)) return 0;
  if (!Number.isFinite(firstNumber)) return -1;
  if (!Number.isFinite(secondNumber)) return 1;

  return firstNumber - secondNumber;
}
