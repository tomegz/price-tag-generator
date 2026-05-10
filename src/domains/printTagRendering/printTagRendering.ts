import type { CatalogItemsById, LegacyCatalogItem } from '../catalog/catalog';
import type { PrintQueue } from '../printQueue/printQueue';

export type PrintTagRenderEntry = {
  key: string;
  item: LegacyCatalogItem;
};

export const PRINT_TAGS_PER_A4_SHEET = 5;

export function getPrintSheetCount(tagCount: number): number {
  if (!Number.isFinite(tagCount) || tagCount <= 0) return 0;

  return Math.ceil(tagCount / PRINT_TAGS_PER_A4_SHEET);
}

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
