import type { LegacyCatalogItem, LegacyCatalogItemsById } from "./catalog";
import {
  assertCatalogDisplayPrice,
  assertCatalogYear,
  type CatalogDisplayPrice,
  type CatalogYear
} from "./catalogValues";

export type CatalogItemInput = {
  brand: string;
  model: string;
  year: CatalogYear;
  price: CatalogDisplayPrice;
  discountPrice: CatalogDisplayPrice;
  discountEnabled: boolean;
};

export type CatalogItem = CatalogItemInput & {
  id: string;
};

export type CatalogItemsById = Record<string, CatalogItem>;

export function legacyCatalogItemToCatalogItem(id: string, item: LegacyCatalogItem): CatalogItem {
  return {
    id,
    brand: item.name,
    model: item.model,
    year: item.year,
    price: item.price,
    discountPrice: item.discountPrice,
    discountEnabled: item.discountStatus === "on"
  };
}

export function catalogItemToLegacyCatalogItem(item: CatalogItemInput): LegacyCatalogItem {
  return {
    name: item.brand,
    model: item.model,
    year: assertCatalogYear(item.year),
    price: assertCatalogDisplayPrice(item.price, "price"),
    discountPrice: assertCatalogDisplayPrice(item.discountPrice, "discountPrice"),
    discountStatus: item.discountEnabled ? "on" : "off"
  };
}

export type { CatalogDisplayPrice, CatalogYear } from "./catalogValues";

export function legacyCatalogItemsToCatalogItems(items: LegacyCatalogItemsById): CatalogItemsById {
  return Object.entries(items).reduce<CatalogItemsById>((nextItems, [id, item]) => {
    nextItems[id] = legacyCatalogItemToCatalogItem(id, item);
    return nextItems;
  }, {});
}

export function catalogItemsToLegacyCatalogItems(items: Record<string, CatalogItemInput>): LegacyCatalogItemsById {
  return Object.entries(items).reduce<LegacyCatalogItemsById>((nextItems, [id, item]) => {
    nextItems[id] = catalogItemToLegacyCatalogItem(item);
    return nextItems;
  }, {});
}
