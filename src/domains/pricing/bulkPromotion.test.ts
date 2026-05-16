import { describe, expect, it } from "vitest";
import {
  applyBulkPromotion,
  calculateBulkDiscountPrice
} from "./bulkPromotion";
import type { CatalogItem } from "@/domains/catalog/catalogItem";

const item: CatalogItem = {
  id: "item1",
  brand: "Kross",
  model: "Hexagon",
  year: "2026",
  price: 1299,
  discountPrice: 0,
  discountEnabled: false
};

describe("bulkPromotion", () => {
  it("calculates percent discounts from catalog price", () => {
    expect(calculateBulkDiscountPrice(1299, { amount: 200, mode: "percent", percent: 15 })).toBe(1104);
  });

  it("calculates amount discounts and clamps at zero", () => {
    expect(calculateBulkDiscountPrice(1299, { amount: 200, mode: "amount", percent: 15 })).toBe(1099);
    expect(calculateBulkDiscountPrice(100, { amount: 200, mode: "amount", percent: 15 })).toBe(0);
  });

  it("applies bulk promotion by overwriting discount fields", () => {
    expect(applyBulkPromotion(item, { amount: 200, mode: "amount", percent: 15 })).toEqual({
      ...item,
      discountPrice: 1099,
      discountEnabled: true
    });
  });
});
