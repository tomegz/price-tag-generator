export type DiscountStatus = 'on' | 'off';

export const DiscountStatuses = {
  ON: 'on',
  OFF: 'off'
} as const satisfies Record<string, DiscountStatus>;

export type LegacyCatalogItem = {
  name: string;
  model: string;
  price: number;
  discountPrice: number;
  discountStatus: DiscountStatus;
  year: string | number;
};

export type CatalogItemsById = Record<string, LegacyCatalogItem>;
export type CatalogBrands = string[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseLegacyCatalogItem(value: unknown): LegacyCatalogItem | null {
  if (!isRecord(value)) return null;

  const { name, model, price, discountPrice, discountStatus, year } = value;
  if (typeof name !== 'string' || name.length === 0) return null;
  if (typeof model !== 'string') return null;
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) return null;
  if (
    typeof discountPrice !== 'number' ||
    !Number.isFinite(discountPrice) ||
    discountPrice < 0
  ) {
    return null;
  }
  if (discountStatus !== 'on' && discountStatus !== 'off') return null;
  if (typeof year !== 'string' && typeof year !== 'number') return null;

  return {
    name,
    model,
    price,
    discountPrice,
    discountStatus,
    year
  };
}

export function parseLegacyCatalogItems(value: unknown): CatalogItemsById {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<CatalogItemsById>((items, [id, item]) => {
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

export function filterCatalogItemIds(items: CatalogItemsById, query: string): string[] {
  const normalizedQuery = query.toLowerCase();

  return Object.keys(items).filter(key => {
    const item = items[key];
    const name = item.name.toLowerCase();
    const model = item.model.toLowerCase();

    return name.includes(normalizedQuery) || model.includes(normalizedQuery);
  });
}
