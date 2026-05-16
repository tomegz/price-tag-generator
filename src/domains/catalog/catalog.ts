import {
  isCatalogDisplayPrice,
  isCatalogYear,
  type CatalogDisplayPrice,
  type CatalogYear
} from "./catalogValues";

export type DiscountStatus = 'on' | 'off';

export const DiscountStatuses = {
  ON: 'on',
  OFF: 'off'
} as const satisfies Record<string, DiscountStatus>;

export type LegacyCatalogItem = {
  name: string;
  model: string;
  price: CatalogDisplayPrice;
  discountPrice: CatalogDisplayPrice;
  discountStatus: DiscountStatus;
  year: CatalogYear;
};

export type LegacyCatalogItemsById = Record<string, LegacyCatalogItem>;
export type CatalogBrands = string[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseLegacyCatalogItem(value: unknown): LegacyCatalogItem | null {
  if (!isRecord(value)) return null;

  const { name, model, price, discountPrice, discountStatus, year } = value;
  if (typeof name !== 'string' || name.length === 0) return null;
  if (typeof model !== 'string') return null;
  if (!isCatalogDisplayPrice(price)) return null;
  if (!isCatalogDisplayPrice(discountPrice)) return null;
  if (discountStatus !== 'on' && discountStatus !== 'off') return null;
  if (!isCatalogYear(year)) return null;

  return {
    name,
    model,
    price,
    discountPrice,
    discountStatus,
    year
  };
}

export function parseLegacyCatalogItems(value: unknown): LegacyCatalogItemsById {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<LegacyCatalogItemsById>((items, [id, item]) => {
    const parsed = parseLegacyCatalogItem(item);
    if (parsed) {
      items[id] = parsed;
    }
    return items;
  }, {});
}

export function parseLegacyCatalogBrands(value: unknown): CatalogBrands {
  if (!Array.isArray(value)) return [];
  return value.filter((brand): brand is string => typeof brand === 'string' && brand.length > 0);
}
