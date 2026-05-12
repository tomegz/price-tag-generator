import type { LegacyCatalogItem, LegacyCatalogItemsById } from "./catalog";

export type CatalogItemInput = {
  brand: string;
  model: string;
  year: string | number;
  price: number;
  discountPrice: number;
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
    year: item.year,
    price: item.price,
    discountPrice: item.discountPrice,
    discountStatus: item.discountEnabled ? "on" : "off"
  };
}

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
