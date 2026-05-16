import { describe, expect, it } from "vitest";

import {
  catalogItemsToLegacyCatalogItems,
  catalogItemToLegacyCatalogItem,
  legacyCatalogItemsToCatalogItems,
  legacyCatalogItemToCatalogItem
} from "./catalogItem";
import type { LegacyCatalogItem } from "./catalog";

const legacyItem: LegacyCatalogItem = {
  name: "Kross",
  model: "Hexagon 3.0",
  year: "2026",
  price: 1299,
  discountPrice: 1099,
  discountStatus: "on"
};

describe("catalog item adapters", () => {
  it("maps legacy database items to the internal catalog shape", () => {
    expect(legacyCatalogItemToCatalogItem("item1", legacyItem)).toEqual({
      id: "item1",
      brand: "Kross",
      model: "Hexagon 3.0",
      year: "2026",
      price: 1299,
      discountPrice: 1099,
      discountEnabled: true
    });
  });

  it("maps internal catalog items back to the unchanged legacy database shape", () => {
    expect(
      catalogItemToLegacyCatalogItem({
        brand: "Kross",
        model: "Hexagon 3.0",
        year: "2026",
        price: 1299,
        discountPrice: 1099,
        discountEnabled: true
      })
    ).toEqual(legacyItem);
  });

  it("round-trips display prices and legacy year values without conversion", () => {
    expect(
      catalogItemsToLegacyCatalogItems(
        legacyCatalogItemsToCatalogItems({
          item1: legacyItem,
          item2: {
            ...legacyItem,
            discountPrice: 0,
            discountStatus: "off",
            year: 2026
          }
        })
      )
    ).toEqual({
      item1: legacyItem,
      item2: {
        ...legacyItem,
        discountPrice: 0,
        discountStatus: "off",
        year: 2026
      }
    });
  });

  it("rejects non-finite display prices before writing legacy catalog data", () => {
    expect(() =>
      catalogItemToLegacyCatalogItem({
        brand: "Kross",
        model: "Hexagon 3.0",
        year: "2026",
        price: Number.POSITIVE_INFINITY,
        discountPrice: 1099,
        discountEnabled: true
      })
    ).toThrow("price must be a non-negative finite display amount");
  });
});
