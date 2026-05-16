import { getPolishPlural } from '../language/polishPlural';

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

export function setPrintQueueItemQuantity(queue: PrintQueue, itemId: string, quantity: number): PrintQueue {
  if (quantity <= 0) {
    return removeFromPrintQueue(queue, itemId);
  }

  return {
    ...queue,
    [itemId]: Math.floor(quantity)
  };
}

export function clearPrintQueue(): PrintQueue {
  return {};
}

export function getPrintQueueTotal(queue: PrintQueue): number {
  return Object.values(queue).reduce((total, quantity) => total + quantity, 0);
}

export function getPriceCountWord(count: number): "cena" | "ceny" | "cen" {
  return getPolishPlural(count, {
    one: "cena",
    few: "ceny",
    many: "cen"
  });
}

export function getTagCountWord(count: number): "etykietę" | "etykiety" | "etykiet" {
  return getPolishPlural(count, {
    one: "etykietę",
    few: "etykiety",
    many: "etykiet"
  });
}

export function getPrintableTagCountWord(count: number): "etykieta" | "etykiety" | "etykiet" {
  return getPolishPlural(count, {
    one: "etykieta",
    few: "etykiety",
    many: "etykiet"
  });
}

export function getPrintSheetCountWord(count: number): "arkusz" | "arkusze" | "arkuszy" {
  return getPolishPlural(count, {
    one: "arkusz",
    few: "arkusze",
    many: "arkuszy"
  });
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
