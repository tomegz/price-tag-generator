import type { CatalogItemInput } from "../catalog/catalogItem";

export function formatPLN(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  return `${Math.round(numeric).toLocaleString("pl-PL")} zł`;
}

export function hasActivePromotion(item: Pick<CatalogItemInput, "discountEnabled" | "discountPrice">): boolean {
  return item.discountEnabled && Number(item.discountPrice) > 0;
}

export function getEffectivePrice(item: CatalogItemInput): number {
  return hasActivePromotion(item) ? item.discountPrice : item.price;
}
