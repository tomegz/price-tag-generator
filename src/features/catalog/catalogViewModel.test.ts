import { describe, expect, it } from "vitest";
import { getUserInitials } from "../../app/authUser";
import {
  catalogDraftToItem,
  isDraftValid
} from "../../domains/catalog/catalogDraft";
import {
  ALL_BRANDS,
  ALL_YEARS,
  filterCatalogProducts,
  getCatalogYears
} from "../../domains/catalog/catalogFilter";
import {
  catalogItemsToProducts,
  getCatalogBrands
} from "../../domains/catalog/catalogProduct";
import {
  sortCatalogProducts
} from "../../domains/catalog/catalogSort";
import {
  formatPLN,
  hasActivePromotion
} from "../../domains/pricing/priceFormatting";
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

describe("catalog domain view models", () => {
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

    expect(filterCatalogProducts(products, { brand: "Kross", query: "hex", year: ALL_YEARS })).toHaveLength(1);
    expect(filterCatalogProducts(products, { brand: "Kross", query: "marlin", year: ALL_YEARS })).toHaveLength(0);
    expect(filterCatalogProducts(products, { brand: ALL_BRANDS, query: "TREK", year: "2025" })[0].id).toBe("item2");
    expect(filterCatalogProducts(products, { brand: ALL_BRANDS, query: "TREK", year: "2026" })).toHaveLength(0);
  });

  it("derives all distinct rocznik filters from products", () => {
    const products = catalogItemsToProducts({
      ...catalogItems,
      item3: { ...catalogItems.item1, model: "Older", year: "2024" },
      item4: { ...catalogItems.item1, model: "Duplicate", year: 2026 },
      item5: { ...catalogItems.item1, model: "Unknown", year: "" }
    });

    expect(getCatalogYears(products)).toEqual(["2026", "2025", "2024"]);
  });

  it("sorts catalog products for the main list controls", () => {
    const products = catalogItemsToProducts(catalogItems);

    expect(sortCatalogProducts(products, "brand").map(product => product.id)).toEqual(["item1", "item2"]);
    expect(
      sortCatalogProducts(products, { mode: "brand", direction: "desc" }).map(product => product.id)
    ).toEqual(["item2", "item1"]);
    expect(sortCatalogProducts(products, "price").map(product => product.id)).toEqual(["item2", "item1"]);
    expect(
      sortCatalogProducts(products, { mode: "price", direction: "asc" }).map(product => product.id)
    ).toEqual(["item1", "item2"]);
    expect(sortCatalogProducts(products, "year").map(product => product.id)).toEqual(["item1", "item2"]);
    expect(sortCatalogProducts(products, "promo").map(product => product.id)).toEqual(["item1", "item2"]);
    expect(
      sortCatalogProducts(products, { mode: "promo", direction: "asc" }).map(product => product.id)
    ).toEqual(["item2", "item1"]);
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
