import type { LegacyCatalogItem } from "../catalog/catalog";

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
