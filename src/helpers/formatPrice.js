/*
  Function expects options object
  ex. formatPrice({ price: 2499, percent: 15, downTo99: true });
*/
const formatPrice = (options) => {
  const { price, percent, downTo99 } = options;
  if(typeof price !== "number" || isNaN(price) || price < 0 ||
     typeof percent !== "number" || isNaN(percent) || percent <= 0 ||
     typeof downTo99 !== "boolean") {
    throw new Error(`Options provided are invalid.
                     @price must be a number > 0
                     @percent must be a number >= 0
                     @downTo99 must be a boolean`);
  }
  const mult = 1 - (percent/100);
  let result = Math.round(price * mult);
  if(options.downTo99) {
    result = (Math.round(result / 100) * 100) - 1;
  }
  return result;
}

export default formatPrice;