import type { CatalogItem } from "../../domains/catalog/catalogItem";

export type BulkPromotionMode = "percent" | "amount";

export type BulkPromotionOptions = {
  mode: BulkPromotionMode;
  percent: number;
  amount: number;
};

export function calculateBulkDiscountPrice(
  price: number,
  options: BulkPromotionOptions
): number {
  return bulkPromotionCalculators[options.mode](price, options);
}

type BulkPromotionCalculator = (price: number, options: BulkPromotionOptions) => number;

const bulkPromotionCalculators: Record<BulkPromotionMode, BulkPromotionCalculator> = {
  percent: (price, { percent }) => Math.round(price * (1 - percent / 100)),
  amount: (price, { amount }) => Math.max(0, price - amount)
};

export function applyBulkPromotion(
  item: CatalogItem,
  options: BulkPromotionOptions
): CatalogItem {
  return {
    ...item,
    discountPrice: calculateBulkDiscountPrice(item.price, options),
    discountEnabled: true
  };
}
