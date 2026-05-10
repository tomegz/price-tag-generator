import type { LegacyCatalogItem } from "../../domains/catalog/catalog";

export type BulkPromotionMode = "percent" | "amount";

export type BulkPromotionOptions = {
  mode: BulkPromotionMode;
  percent: number;
  amount: number;
};

export function calculateBulkDiscountPrice(
  price: number,
  { amount, mode, percent }: BulkPromotionOptions
): number {
  if (mode === "percent") {
    return Math.round(price * (1 - percent / 100));
  }

  return Math.max(0, price - amount);
}

export function applyBulkPromotion(
  item: LegacyCatalogItem,
  options: BulkPromotionOptions
): LegacyCatalogItem {
  return {
    ...item,
    discountPrice: calculateBulkDiscountPrice(item.price, options),
    discountStatus: "on"
  };
}
