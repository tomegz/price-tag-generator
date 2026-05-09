import { parsePrintQueue, type PrintQueue } from '../printQueue/printQueue';

export type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export const printQueueStorageKey = 'order-profi-bike';

export function loadPrintQueueFromStorage(
  storage: StorageLike,
  key = printQueueStorageKey
): PrintQueue {
  const value = storage.getItem(key);
  if (!value) return {};

  try {
    return parsePrintQueue(JSON.parse(value));
  } catch {
    storage.removeItem(key);
    return {};
  }
}

export function savePrintQueueToStorage(
  storage: StorageLike,
  queue: PrintQueue,
  key = printQueueStorageKey
): void {
  storage.setItem(key, JSON.stringify(parsePrintQueue(queue)));
}
