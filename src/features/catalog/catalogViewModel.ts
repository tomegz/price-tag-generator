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
