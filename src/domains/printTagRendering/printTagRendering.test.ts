import { describe, expect, it } from 'vitest';

import { buildPrintTagRenderQueue } from './printTagRendering';

const item = {
  name: 'KTM',
  model: 'Macina Cross',
  price: 16999,
  discountPrice: 10999,
  discountStatus: 'on' as const,
  year: 2026
};

describe('buildPrintTagRenderQueue', () => {
  it('expands print queue quantities into render entries', () => {
    expect(buildPrintTagRenderQueue({ item1: item }, { item1: 2 })).toEqual([
      { key: 'item1-0', item },
      { key: 'item1-1', item }
    ]);
  });

  it('skips queue entries for missing catalog items', () => {
    expect(buildPrintTagRenderQueue({}, { item1: 2 })).toEqual([]);
  });
});
