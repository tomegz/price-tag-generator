import { describe, expect, it } from 'vitest';

import {
  buildPrintTagRenderQueue,
  getPrintSheetCount,
  PRINT_TAGS_PER_A4_SHEET
} from './printTagRendering';

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

describe('getPrintSheetCount', () => {
  it('counts A4 sheets using five rendered tags per page', () => {
    expect(PRINT_TAGS_PER_A4_SHEET).toBe(5);
    expect(getPrintSheetCount(0)).toBe(0);
    expect(getPrintSheetCount(1)).toBe(1);
    expect(getPrintSheetCount(5)).toBe(1);
    expect(getPrintSheetCount(6)).toBe(2);
    expect(getPrintSheetCount(11)).toBe(3);
  });
});
