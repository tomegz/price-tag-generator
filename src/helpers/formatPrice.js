/*
  Function expects options object
  ex. formatPrice(2499, { percent: 15, roundDown: true });
*/
const formatPrice = (price, options) => {
  const { percent, roundDown } = options;
  if(typeof price !== "number" || isNaN(price) || price < 0 ||
     typeof percent !== "number" || isNaN(percent) || percent <= 0 ||
     typeof roundDown !== "boolean") 
  {
    throw new Error(`Params provided are invalid.
                     @price must be a number > 0
                     @percent option must be a number >= 0
                     @roundDown option must be a boolean`);
  }
  const mult = 1 - (percent/100);
  let result = Math.round(price * mult);
  if(options.roundDown) {
    result = Number(Math.floor(result / 10).toString() + "9");
  }
  return result;
}

export default formatPrice;