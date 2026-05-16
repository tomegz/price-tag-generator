import { describe, expect, it } from 'vitest';

import {
  addToPrintQueue,
  clearPrintQueue,
  getPrintableTagCountWord,
  getPriceCountWord,
  getPrintSheetCountWord,
  getPrintQueueTotal,
  getTagCountWord,
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

describe('getPriceCountWord', () => {
  it('uses Polish count forms for price labels', () => {
    expect(getPriceCountWord(0)).toBe('cen');
    expect(getPriceCountWord(1)).toBe('cena');
    expect(getPriceCountWord(2)).toBe('ceny');
    expect(getPriceCountWord(4)).toBe('ceny');
    expect(getPriceCountWord(5)).toBe('cen');
    expect(getPriceCountWord(11)).toBe('cen');
    expect(getPriceCountWord(21)).toBe('cen');
    expect(getPriceCountWord(22)).toBe('ceny');
    expect(getPriceCountWord(24)).toBe('ceny');
    expect(getPriceCountWord(25)).toBe('cen');
    expect(getPriceCountWord(31)).toBe('cen');
    expect(getPriceCountWord(32)).toBe('ceny');
    expect(getPriceCountWord(112)).toBe('cen');
    expect(getPriceCountWord(122)).toBe('ceny');
  });
});

describe('print queue count labels', () => {
  it('uses Polish count forms for tag labels', () => {
    expect(getTagCountWord(0)).toBe('etykiet');
    expect(getTagCountWord(1)).toBe('etykietę');
    expect(getTagCountWord(2)).toBe('etykiety');
    expect(getTagCountWord(5)).toBe('etykiet');
    expect(getTagCountWord(22)).toBe('etykiety');
    expect(getPrintableTagCountWord(0)).toBe('etykiet');
    expect(getPrintableTagCountWord(1)).toBe('etykieta');
    expect(getPrintableTagCountWord(2)).toBe('etykiety');
    expect(getPrintableTagCountWord(5)).toBe('etykiet');
    expect(getPrintableTagCountWord(22)).toBe('etykiety');
  });

  it('uses Polish count forms for sheet labels', () => {
    expect(getPrintSheetCountWord(1)).toBe('arkusz');
    expect(getPrintSheetCountWord(2)).toBe('arkusze');
    expect(getPrintSheetCountWord(5)).toBe('arkuszy');
    expect(getPrintSheetCountWord(22)).toBe('arkusze');
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
