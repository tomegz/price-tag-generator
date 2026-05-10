import { describe, expect, it } from "vitest";
import {
  ALL_BRANDS,
  catalogDraftToItem,
  catalogItemsToProducts,
  filterCatalogProducts,
  formatPLN,
  getCatalogBrands,
  getUserInitials,
  hasActivePromotion,
  isDraftValid
} from "./catalogViewModel";
import type { CatalogItemsById } from "../../domains/catalog/catalog";

const catalogItems: CatalogItemsById = {
  item1: {
    name: "Kross",
    model: "Hexagon 3.0",
    year: "2026",
    price: 1299,
    discountPrice: 1099,
    discountStatus: "on"
  },
  item2: {
    name: "Trek",
    model: "Marlin 7",
    year: "2025",
    price: 3899,
    discountPrice: 0,
    discountStatus: "off"
  }
};

describe("catalogViewModel", () => {
  it("converts legacy catalog records to stable products", () => {
    expect(catalogItemsToProducts(catalogItems)).toEqual([
      expect.objectContaining({ brand: "Kross", id: "item1", yearLabel: "2026" }),
      expect.objectContaining({ brand: "Trek", id: "item2", yearLabel: "2025" })
    ]);
  });

  it("uses DB brands and item-derived brands without duplicates", () => {
    const products = catalogItemsToProducts(catalogItems);

    expect(getCatalogBrands(products, ["Trek", "Giant"])).toEqual(["Giant", "Kross", "Trek"]);
  });

  it("composes case-insensitive search and brand filtering", () => {
    const products = catalogItemsToProducts(catalogItems);

    expect(filterCatalogProducts(products, { brand: "Kross", query: "hex" })).toHaveLength(1);
    expect(filterCatalogProducts(products, { brand: "Kross", query: "marlin" })).toHaveLength(0);
    expect(filterCatalogProducts(products, { brand: ALL_BRANDS, query: "TREK" })[0].id).toBe("item2");
  });

  it("formats prices using Polish grouping and zł suffix", () => {
    expect(formatPLN(18999)).toBe("18\u00a0999 zł");
    expect(formatPLN(null)).toBe("—");
  });

  it("recognizes active promotions only when status and price are present", () => {
    expect(hasActivePromotion(catalogItems.item1)).toBe(true);
    expect(hasActivePromotion(catalogItems.item2)).toBe(false);
  });

  it("validates and converts catalog drafts to legacy item shape", () => {
    const draft = {
      name: " Giant ",
      model: "Talon",
      year: "2026",
      price: "2999",
      discountPrice: "2499"
    };

    expect(isDraftValid(draft)).toBe(true);
    expect(catalogDraftToItem(draft)).toEqual({
      name: "Giant",
      model: "Talon",
      year: "2026",
      price: 2999,
      discountPrice: 2499,
      discountStatus: "on"
    });
  });

  it("derives user initials from display name or email", () => {
    expect(getUserInitials({ displayName: "Jan Kowalski", email: null })).toBe("JK");
    expect(getUserInitials({ displayName: null, email: "tomasz.bubala@example.com" })).toBe("TB");
  });
});
