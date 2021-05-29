// eslint-disable-next-line func-names
(function () {
  /**
   * Ajuste decimal de un número.
   *
   * @param {String}  type  El tipo de ajuste.
   * @param {Number}  value El número.
   * @param {Integer} exp   El exponente (El logaritmo de ajuste en base 10).
   * @returns {Number} El valor ajustado.
   */
  function decimalAdjust(type, value, exp) {
    // Si exp es undefined o cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o exp no es un entero...
    if (Object.is(value, NaN) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(`${value[0]}e${value[1] ? (+value[1] - exp) : -exp}`));
    // Shift back
    value = value.toString().split('e');
    return +(`${value[0]}e${value[1] ? (+value[1] + exp) : exp}`);
  }

  // Decimal round
  if (!Math.round10) {
    // eslint-disable-next-line func-names
    Math.round10 = function (value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    // eslint-disable-next-line func-names
    Math.floor10 = function (value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    // eslint-disable-next-line func-names
    Math.ceil10 = function (value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
}());

const value = (amount, decimals = 2) => {
  if(Array.isArray(amount)) return NaN
  let parsedValue = parseFloat(amount)
  if(Object.is(parsedValue, NaN)) return NaN

  if (parsedValue % 1 === 0) { // integer
    return parsedValue;
  }

  const sign = parsedValue >=0 ? 1 : -1
  parsedValue = Math.abs(parsedValue)
  const s = parsedValue.toString().split('.');
  const l = s[1] ? s[1].length : 0;
  const base = 10 ** l;
  return sign*Math.ceil10((parsedValue * base) / base, -decimals);
};

const selectBase = (amount1, amount2) => {
  const s1 = amount1.toString().split('.');
  const l1 = s1[1] ? s1[1].length : 0;

  const s2 = amount2.toString().split('.');
  const l2 = s2[1] ? s2[1].length : 0;

  const maxl = (l1 >= l2) ? l1 : l2;
  return  10 ** maxl;
}

const extractBase = (amountList) => {
  let base = 0
  amountList.forEach((a,index) => {
    if(index < amountList.length-1) {
      const newBase = selectBase(a,amountList[index+1])
      base = newBase > base ? newBase : base
    }
  })
  return base
}

function sum(...amount){
  // return value(value(amount1,3)+value(amount2,3))
  const amountList = [...amount]
  if(amountList.length === 0) return NaN
  if(amountList.length === 1) {
    if(Array.isArray(amountList[0])) return sum(...amountList[0])
    return value(amountList[0])
  }

  let base = extractBase(amountList)
  const baseSum = amountList.reduce((s,a) => s+a*base,0)

  return Math.ceil10(baseSum / base, -2);
};

const multiply = (amount, factor, decimals = 2) => {
  // if (!factor) throw Error('expected a non zero numeric factor');
  amount = amount || 0;
  factor = factor || 1;
  if (factor === 1) return amount;
  if (amount % 1 === 0 && factor % 1 === 0) { // both integers
    return amount * factor;
  }

  const base = selectBase(amount,factor)
  return Math.ceil10(((amount * base) * (factor * base)) / (base ** 2), -decimals);
};

module.exports = {
  /** return currency value */
  value: (amount,decimals = 2) => value(amount, decimals),
  /** currency change operation*/
  fx: (amount,fxRate,decimals = 2) => multiply(amount,fxRate,decimals),
  /** sum amounts */
  sum,
  /** sum alias */
  add: sum,
  /** difference of two amounts */
  subtract: (amount1, amount2) => sum(amount1, -amount2),
  /** multiply an amount by a factor */
  multiply,
  /** divide an amount by a factor */
  divide: (amount, factor) => {
    if (factor === 0) throw new Error('cant divide by zero');
    if (factor === 1) return module.exports.value(amount);
    return multiply(amount, 1 / factor);
  },
  /** compute a percent amount from amount and percent value */
  percent: (amount, p) => {
    if (p < 0) throw new Error('p must be positive (%)');
    if (p === 0) return 0;
    // return module.exports.value(module.exports.divide(multiply(amount, p), 100));
    return module.exports.value(amount * p/100);
  },
  /** apply a percent discount to base amount */
  applyDiscount: (amount, p) => module.exports.multiply(amount,1-p/100),
  /** compute tax to base amount, follow max policy from percent value and fee value */
  maxTax: (amount, p, fee) => Math.max(module.exports.percent(amount, p), module.exports.value(fee)),
  // /** apply discount to base amount, follow max policy from percent value and fee value */
  // maxDiscount: (amount, p, fee) => Math.max(module.exports.percent(amount, p), module.exports.value(fee)),
  /** apply a percent tax to base amount */
  applyTax: (amount, p) => module.exports.multiply(amount,1+p/100), //sum(amount, module.exports.percent(amount, p)),
  /** apply tax to base amount, follow max policy from percent value and fee value */
  applyMaxTax: (amount, p, fee) => sum(amount, module.exports.maxTax(amount, p, fee)),
  /** apply tax to base amount, follow sum policy from percent value and fee value */
  applySumTax: (amount, p, fee) => sum(module.exports.applyTax(amount, p), fee),
  /** apply discount to base amount, follow max policy from percent value and fee value */
  // applyMaxDiscount: (amount, p, fee) => module.exports.subtract(amount, module.exports.maxDiscount(amount, p, fee)),
  /** apply discount to base amount, follow sum policy from percent value and fee value */
  // applySumDiscount: (amount, p, fee) => module.exports.subtract(module.exports.applyDiscount(amount, p), fee),
  
  
  
  /** currency(12.35).distribute(3); // => [4.12, 4.12, 4.11]
      currency(12.00).distribute(3); // => [4.00, 4.00, 4.00] */
  // distribute () => {}
  /** currency(123.45).dollars(); // => 123
      currency("0.99").dollars(); // => 0 */
  // dollars () => {}
  /** currency(123.45).cents(); // => 45
      currency("0.99").cents(); // => 99 */
  // cents () => {}
  /** currency("123.45").add(.01).intValue; // => 12346 */
  // intValue () => {}
};
