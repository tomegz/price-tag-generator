import { beforeEach, describe, expect, it } from 'vitest';

import {
  loadPrintQueueFromStorage,
  printQueueStorageKey,
  savePrintQueueToStorage
} from './printQueueStorage';

describe('printQueueStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads a valid stored print queue', () => {
    localStorage.setItem(printQueueStorageKey, JSON.stringify({ item1: 2 }));

    expect(loadPrintQueueFromStorage(localStorage)).toEqual({ item1: 2 });
  });

  it('recovers from invalid JSON without throwing', () => {
    localStorage.setItem(printQueueStorageKey, '{not-json');

    expect(loadPrintQueueFromStorage(localStorage)).toEqual({});
    expect(localStorage.getItem(printQueueStorageKey)).toBeNull();
  });

  it('drops invalid queue entries from stored JSON', () => {
    localStorage.setItem(printQueueStorageKey, JSON.stringify({ item1: 2, item2: 'bad' }));

    expect(loadPrintQueueFromStorage(localStorage)).toEqual({ item1: 2 });
  });

  it('saves a normalized print queue', () => {
    savePrintQueueToStorage(localStorage, { item1: 2, item2: 2.9 });

    expect(localStorage.getItem(printQueueStorageKey)).toBe('{"item1":2,"item2":2}');
  });
});
