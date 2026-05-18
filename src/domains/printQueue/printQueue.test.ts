import { describe, expect, it } from 'vitest';

import {
  addToPrintQueue,
  clearPrintQueue,
  getPrintQueueTotal,
  parsePrintQueue,
  removeFromPrintQueue,
  setPrintQueueItemQuantity
} from './printQueue';

describe('addToPrintQueue', () => {
  it('adds a new item quantity', () => {
    expect(addToPrintQueue({}, 'item1', 2)).toEqual({ item1: 2 });
  });

  it('increments an existing item quantity', () => {
    expect(addToPrintQueue({ item1: 2 }, 'item1', 3)).toEqual({ item1: 5 });
  });

  it('floors decimal quantities to preserve current behavior', () => {
    expect(addToPrintQueue({}, 'item1', 2.9)).toEqual({ item1: 2 });
  });

  it('rejects invalid quantities', () => {
    const queue = { item1: 2 };
    expect(addToPrintQueue(queue, 'item2', 0)).toBe(queue);
    expect(addToPrintQueue(queue, 'item2', Number.NaN)).toBe(queue);
  });
});

describe('removeFromPrintQueue', () => {
  it('removes an item from the queue', () => {
    expect(removeFromPrintQueue({ item1: 2, item2: 1 }, 'item1')).toEqual({ item2: 1 });
  });
});

describe('setPrintQueueItemQuantity', () => {
  it('sets an item quantity', () => {
    expect(setPrintQueueItemQuantity({ item1: 2 }, 'item1', 5)).toEqual({ item1: 5 });
  });

  it('floors decimal quantities to preserve current behavior', () => {
    expect(setPrintQueueItemQuantity({ item1: 2 }, 'item1', 5.9)).toEqual({ item1: 5 });
  });

  it('removes an item when quantity is zero or lower', () => {
    expect(setPrintQueueItemQuantity({ item1: 2, item2: 1 }, 'item1', 0)).toEqual({ item2: 1 });
    expect(setPrintQueueItemQuantity({ item1: 2, item2: 1 }, 'item1', -2)).toEqual({ item2: 1 });
  });
});

describe('clearPrintQueue', () => {
  it('returns an empty queue', () => {
    expect(clearPrintQueue()).toEqual({});
  });
});

describe('getPrintQueueTotal', () => {
  it('counts the total number of tags to print', () => {
    expect(getPrintQueueTotal({ item1: 2, item2: 3 })).toBe(5);
  });
});

describe('parsePrintQueue', () => {
  it('keeps only positive numeric quantities', () => {
    expect(parsePrintQueue({ item1: 2, item2: 0, item3: '3', item4: 4.8 })).toEqual({
      item1: 2,
      item4: 4
    });
  });

  it('returns an empty queue for invalid data', () => {
    expect(parsePrintQueue(null)).toEqual({});
    expect(parsePrintQueue(['item1'])).toEqual({});
  });
});
