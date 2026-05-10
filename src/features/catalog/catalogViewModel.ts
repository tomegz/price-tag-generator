import type {
  CatalogBrands,
  CatalogItemsById,
  DiscountStatus,
  LegacyCatalogItem
} from "../../domains/catalog/catalog";

export const ALL_BRANDS = "all";

export type CatalogProduct = LegacyCatalogItem & {
  id: string;
  brand: string;
  yearLabel: string;
};

export type CatalogFilterOptions = {
  brand: string;
  query: string;
};

export type CatalogSortMode = "brand" | "price" | "year" | "promo";
export type CatalogSortDirection = "asc" | "desc";

export type CatalogSort = {
  mode: CatalogSortMode;
  direction: CatalogSortDirection;
};

export type CatalogDraft = {
  name: string;
  model: string;
  year: string;
  price: string;
  discountPrice: string;
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
    if (activeSort.mode === "price") {
      const priceSort = compareNumericValues(a.price, b.price) * directionFactor;
      if (priceSort !== 0) return priceSort;
    }

    if (activeSort.mode === "year") {
      const yearSort = compareNumericValues(a.year, b.year) * directionFactor;
      if (yearSort !== 0) return yearSort;
    }

    if (activeSort.mode === "promo") {
      const promotionSort =
        (Number(hasActivePromotion(a)) - Number(hasActivePromotion(b))) * directionFactor;
      if (promotionSort !== 0) return promotionSort;
    }

    const brandSort = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "pl");
    return activeSort.mode === "brand" ? brandSort * directionFactor : brandSort;
  });
}

function compareNumericValues(first: number | string, second: number | string): number {
  const firstNumber = Number(first);
  const secondNumber = Number(second);

  if (!Number.isFinite(firstNumber) && !Number.isFinite(secondNumber)) return 0;
  if (!Number.isFinite(firstNumber)) return -1;
  if (!Number.isFinite(secondNumber)) return 1;

  return firstNumber - secondNumber;
}

export function formatPLN(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  return `${Math.round(numeric).toLocaleString("pl-PL")} zł`;
}

export function hasActivePromotion(item: Pick<LegacyCatalogItem, "discountStatus" | "discountPrice">): boolean {
  return item.discountStatus === "on" && Number(item.discountPrice) > 0;
}

export function getEffectivePrice(item: LegacyCatalogItem): number {
  return hasActivePromotion(item) ? item.discountPrice : item.price;
}

export function draftFromItem(item: LegacyCatalogItem): CatalogDraft {
  return {
    name: item.name,
    model: item.model,
    year: String(item.year || ""),
    price: String(item.price || ""),
    discountPrice: item.discountPrice ? String(item.discountPrice) : ""
  };
}

export function emptyCatalogDraft(defaultYear = new Date().getFullYear()): CatalogDraft {
  return {
    name: "",
    model: "",
    year: String(defaultYear),
    price: "",
    discountPrice: ""
  };
}

export function isDraftValid(draft: CatalogDraft): boolean {
  const price = Number(draft.price);
  const discountPrice = draft.discountPrice === "" ? 0 : Number(draft.discountPrice);

  return (
    draft.name.trim().length > 0 &&
    draft.model.trim().length > 0 &&
    draft.year.trim().length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0
  );
}

export function catalogDraftToItem(draft: CatalogDraft): LegacyCatalogItem {
  const discountPrice = draft.discountPrice === "" ? 0 : Number(draft.discountPrice);
  const discountStatus: DiscountStatus = discountPrice > 0 ? "on" : "off";

  return {
    name: draft.name.trim(),
    model: draft.model.trim(),
    year: draft.year.trim(),
    price: Number(draft.price),
    discountPrice,
    discountStatus
  };
}

export function isDraftDirty(original: LegacyCatalogItem, draft: CatalogDraft): boolean {
  const next = catalogDraftToItem(draft);

  return (
    next.name !== original.name ||
    next.model !== original.model ||
    String(next.year) !== String(original.year) ||
    Number(next.price) !== Number(original.price) ||
    Number(next.discountPrice) !== Number(original.discountPrice) ||
    next.discountStatus !== original.discountStatus
  );
}

export function getUserInitials(user: {
  displayName?: string | null;
  email?: string | null;
} | null): string {
  const source = user?.displayName || user?.email || "";
  const emailName = source.split("@")[0] || "";
  const parts = emailName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return (parts[0]?.slice(0, 2) || "PB").toUpperCase();
}
