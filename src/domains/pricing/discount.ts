export type DiscountOptions = {
  percent: number;
  roundDown: boolean;
};

function assertValidDiscountInput(price: number, options: DiscountOptions): void {
  if (
    typeof price !== 'number' ||
    Number.isNaN(price) ||
    price < 0 ||
    typeof options.percent !== 'number' ||
    Number.isNaN(options.percent) ||
    options.percent <= 0 ||
    typeof options.roundDown !== 'boolean'
  ) {
    throw new Error(`Params provided are invalid.
                     @price must be a number > 0
                     @percent option must be a number >= 0
                     @roundDown option must be a boolean`);
  }
}

export function roundToPriceEndingIn9(price: number): number {
  return Number(`${Math.floor(price / 10)}9`);
}

export function calculateDiscountPrice(price: number, options: DiscountOptions): number {
  assertValidDiscountInput(price, options);

  const multiplier = 1 - options.percent / 100;
  const discountedPrice = Math.round(price * multiplier);

  if (!options.roundDown) {
    return discountedPrice;
  }

  return roundToPriceEndingIn9(discountedPrice);
}
