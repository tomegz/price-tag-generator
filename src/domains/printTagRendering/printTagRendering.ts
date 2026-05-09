import type { CatalogItemsById, LegacyCatalogItem } from '../catalog/catalog';
import type { PrintQueue } from '../printQueue/printQueue';

export type PrintTagRenderEntry = {
  key: string;
  item: LegacyCatalogItem;
};

export function buildPrintTagRenderQueue(
  items: CatalogItemsById,
  queue: PrintQueue
): PrintTagRenderEntry[] {
  return Object.entries(queue).flatMap(([itemId, quantity]) => {
    const item = items[itemId];
    if (!item) return [];

    return Array.from({ length: quantity }, (_, index) => ({
      key: `${itemId}-${index}`,
      item
    }));
  });
}
