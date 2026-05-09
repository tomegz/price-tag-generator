import { describe, expect, it } from 'vitest';

import {
  catalogPaths,
  ensureWritableCatalogItem,
  isPermissionDenied,
  toFirebaseRepositoryError
} from './catalogRepository';

describe('catalogPaths', () => {
  it('centralizes legacy Realtime Database paths', () => {
    expect(catalogPaths.brands()).toBe('profi-bike/brands');
    expect(catalogPaths.items()).toBe('profi-bike/items');
    expect(catalogPaths.item('item1')).toBe('profi-bike/items/item1');
  });
});

describe('ensureWritableCatalogItem', () => {
  it('keeps valid legacy catalog writes unchanged', () => {
    const item = {
      name: 'Kross',
      model: 'Level',
      price: 2999,
      discountPrice: 2499,
      discountStatus: 'off' as const,
      year: 2026
    };

    expect(ensureWritableCatalogItem(item)).toEqual(item);
  });

  it('rejects malformed catalog writes before Firebase receives them', () => {
    expect(() =>
      ensureWritableCatalogItem({
        name: 'Kross',
        model: 'Level',
        price: -1,
        discountPrice: 2499,
        discountStatus: 'off',
        year: 2026
      })
    ).toThrow('Invalid catalog item');
  });
});

describe('Firebase repository errors', () => {
  it('normalizes Firebase error objects', () => {
    expect(toFirebaseRepositoryError({ code: 'PERMISSION_DENIED', message: 'Permission denied' }))
      .toMatchObject({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied'
      });
  });

  it('detects permission-denied errors', () => {
    expect(
      isPermissionDenied({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
        cause: null
      })
    ).toBe(true);
  });
});
