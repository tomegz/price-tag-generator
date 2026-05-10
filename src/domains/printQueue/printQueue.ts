export type PrintQueue = Record<string, number>;

export function addToPrintQueue(queue: PrintQueue, itemId: string, quantity: number): PrintQueue {
  if (!itemId || typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) {
    return queue;
  }

  const count = Math.floor(quantity);

  return {
    ...queue,
    [itemId]: (queue[itemId] || 0) + count
  };
}

export function removeFromPrintQueue(queue: PrintQueue, itemId: string): PrintQueue {
  const nextQueue = { ...queue };
  delete nextQueue[itemId];
  return nextQueue;
}

export function clearPrintQueue(): PrintQueue {
  return {};
}

export function getPrintQueueTotal(queue: PrintQueue): number {
  return Object.values(queue).reduce((total, quantity) => total + quantity, 0);
}

export function getPriceCountWord(count: number): "cena" | "ceny" | "cen" {
  if (!Number.isFinite(count)) return "cen";

  const normalizedCount = Math.abs(Math.trunc(count));
  if (normalizedCount === 1) return "cena";

  const lastDigit = normalizedCount % 10;
  const lastTwoDigits = normalizedCount % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "ceny";
  }

  return "cen";
}

export function parsePrintQueue(value: unknown): PrintQueue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<PrintQueue>((queue, [itemId, quantity]) => {
    if (
      typeof itemId === 'string' &&
      typeof quantity === 'number' &&
      Number.isFinite(quantity) &&
      quantity > 0
    ) {
      queue[itemId] = Math.floor(quantity);
    }
    return queue;
  }, {});
}
