import { describe, expect, it } from 'vitest';

import { calculateDiscountPrice, roundToPriceEndingIn9 } from './discount';

describe('calculateDiscountPrice', () => {
  it('calculates a rounded percent discount', () => {
    expect(calculateDiscountPrice(2499, { percent: 15, roundDown: false })).toBe(2124);
  });

  it('preserves the legacy ending-in-9 rounding behavior', () => {
    expect(calculateDiscountPrice(2499, { percent: 15, roundDown: true })).toBe(2129);
  });

  it('rejects invalid percent values', () => {
    expect(() => calculateDiscountPrice(2499, { percent: 0, roundDown: true })).toThrow(
      'Params provided are invalid'
    );
    expect(() => calculateDiscountPrice(2499, { percent: Number.NaN, roundDown: true })).toThrow(
      'Params provided are invalid'
    );
  });

  it('rejects invalid price values', () => {
    expect(() => calculateDiscountPrice(-1, { percent: 15, roundDown: true })).toThrow(
      'Params provided are invalid'
    );
  });
});

describe('roundToPriceEndingIn9', () => {
  it('rounds to the legacy price ending convention', () => {
    expect(roundToPriceEndingIn9(2124)).toBe(2129);
    expect(roundToPriceEndingIn9(2129)).toBe(2129);
  });
});
