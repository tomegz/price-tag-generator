export function countTelemetryItems(items: Record<string, number>): {
  itemCount: number;
  totalCount: number;
} {
  return Object.values(items).reduce(
    (counts, quantity) => ({
      itemCount: quantity > 0 ? counts.itemCount + 1 : counts.itemCount,
      totalCount: counts.totalCount + quantity
    }),
    { itemCount: 0, totalCount: 0 }
  );
}
