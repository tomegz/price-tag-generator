import { describe, expect, it } from 'vitest';

import {
  filterCatalogItemIds,
  parseLegacyCatalogBrands,
  parseLegacyCatalogItem,
  parseLegacyCatalogItems
} from './catalog';

describe('parseLegacyCatalogItem', () => {
  it('accepts the current legacy catalog item shape', () => {
    expect(
      parseLegacyCatalogItem({
        name: 'KTM',
        model: 'Macina Cross',
        price: 16999,
        discountPrice: 10999,
        discountStatus: 'on',
        year: 2026
      })
    ).toEqual({
      name: 'KTM',
      model: 'Macina Cross',
      price: 16999,
      discountPrice: 10999,
      discountStatus: 'on',
      year: 2026
    });
  });

  it('allows legacy year values as strings', () => {
    expect(
      parseLegacyCatalogItem({
        name: 'Kross',
        model: 'Level',
        price: 2999,
        discountPrice: 2499,
        discountStatus: 'off',
        year: '2024'
      })
    ).toMatchObject({ year: '2024' });
  });

  it('rejects invalid item data', () => {
    expect(parseLegacyCatalogItem({ name: 'Missing fields' })).toBeNull();
    expect(
      parseLegacyCatalogItem({
        name: 'KTM',
        model: 'Macina',
        price: -1,
        discountPrice: 100,
        discountStatus: 'off',
        year: 2026
      })
    ).toBeNull();
  });
});

describe('parseLegacyCatalogItems', () => {
  it('keeps valid items and drops invalid records at the Firebase boundary', () => {
    expect(
      parseLegacyCatalogItems({
        item1: {
          name: 'KTM',
          model: 'Macina Cross',
          price: 16999,
          discountPrice: 10999,
          discountStatus: 'on',
          year: 2026
        },
        broken: {
          name: 'Broken'
        }
      })
    ).toEqual({
      item1: {
        name: 'KTM',
        model: 'Macina Cross',
        price: 16999,
        discountPrice: 10999,
        discountStatus: 'on',
        year: 2026
      }
    });
  });
});

describe('filterCatalogItemIds', () => {
  const items = parseLegacyCatalogItems({
    item1: {
      name: 'KTM',
      model: 'Macina Cross',
      price: 16999,
      discountPrice: 10999,
      discountStatus: 'on',
      year: 2026
    },
    item2: {
      name: 'Kross',
      model: 'Level',
      price: 2999,
      discountPrice: 2499,
      discountStatus: 'off',
      year: '2024'
    }
  });

  it('matches catalog items by name', () => {
    expect(filterCatalogItemIds(items, 'ktm')).toEqual(['item1']);
  });

  it('matches catalog items by model', () => {
    expect(filterCatalogItemIds(items, 'level')).toEqual(['item2']);
  });
});

describe('parseLegacyCatalogBrands', () => {
  it('keeps valid brand names from the legacy brands array', () => {
    expect(parseLegacyCatalogBrands(['Kross', '', 'Giant', 123])).toEqual(['Kross', 'Giant']);
  });

  it('returns an empty array for invalid brand data', () => {
    expect(parseLegacyCatalogBrands({ Kross: true })).toEqual([]);
  });
});
