/* eslint-disable max-len */
const arithmetic = require("./lib/arithmetic");
const { ArgumentError } = require("./lib/errors");
const {
  partition,
  applyDiscount,
  applyMaxTax,
  applySumTax,
  applyTax,
  maxTax,
  applyMaxDiscount,
  applySumDiscount,
} = require("./lib/recipes");
const {
  format: formatCurrency,
  convert: convertCurrency,
} = require("./lib/currency");

/**
 * Compute currency value from Number
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} [decimals] integer
 * @returns {Number} Monetary value of amount
 *
 * @example
 * value(10.253) // 10.26
 * value('10.990001',4) // 10.9901
 * value('10.990001') // 11.00
 * value('abcd') // NaN
 * value(null|undefined|any[]|object) // NaN
 */
const value = (amount, decimals = 2) => arithmetic.value(amount, decimals);

/**
 * Compute cents value from Number
 * @public
 * @param {Number|String} amount numeric value
 * @returns {Number} Monetary value in cents of amount
 *
 * @example
 *
 * cents(0.01) // 1
 * cents(0.17) // 17
 * cents('3.12') // 312
 * cents(0.11001) // 12
 * cents('abcd') // NaN
 * cents(null|undefined|any[]|object) // NaN
 */
const cents = (amount) => arithmetic.toCents(amount);

/**
 * Compute currency amount from cents
 * @public
 * @param {Number|String} cents numeric value (positive integer)
 * @returns {Number} Monetary value of cents
 *
 * @throws Will throw an error if the argument is negative or not integer.
 * @throws {ArgumentError} cents must be positive integer
 *
 * @example
 *
 * cents2Amount(157) // 1.57
 * cents2Amount('5513') // 55.13
 * cents2Amount(157) // 1.57
 * cents2Amount('abcd') // NaN
 * cents2Amount(null|undefined|any[]|object) // NaN
 * cents2Amount(12.5) // ArgumentError: cents must be positive integer
 * cents2Amount(-25) // ArgumentError: cents must be positive integer
 */
// eslint-disable-next-line no-shadow
const cents2Amount = (cents) => arithmetic.cents2Amount(cents);

/**
 * Apply fx rate to currency amount
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} fxRate number
 * @param {Number=} decimals integer
 * @returns {Number} Monetary value of amount*fxRate
 *
 * @example
 * fx(100, 1.55235) // 155.24
 * fx('100', 0.01) // 1
 * fx(100, 0.0000155235) // 0.01
 * fx(100, 0.0000155235,4) // 0.0016
 */
const fx = (amount, fxRate, decimals = 2) =>
  arithmetic.fx(amount, fxRate, decimals);

/**
 * Aggregate amounts
 * @public
 * @param {(number | string | number[] | string[])} amounts numeric values
 * @returns {Number} Monetary value of total amount
 * @example
 *
 * sum(0.1,0.2) // 0.3
 * sum(0.1,0.2,'-0.3') // 0
 * sum([0.1,0.2,-0.3]) // 0
 * sum(...['0.1','0.2','-0.3']) // 0
 * sum(0.12345678, 0.00000001, { decimals: 8 }) // 0.12345679
 * sum('abcd','{a: 1}') // NaN
 */
const sum = (...amounts) => arithmetic.sum(...amounts);

/**
 * Compute an amount fraction from a percent value
 * @public
 * @param {Number} amount base amount value
 * @param {Number} p percent value
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {Number} Monetary value of amount*p/100
 *
 */
const percent = (amount, p, decimals = 2) =>
  arithmetic.percent(amount, p, decimals);

/**
 * Difference of two amounts
 *
 * @param {Number} x - amount1
 * @param {Number} y - amount2
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {Number} Monetary value of amount1 - amount2
 *
 * @example
 *
 * subtract(1.01, 0.99) // 0.02
 * subtract(23.42, 19.13) // 4.29
 */

const subtract = (x, y, decimals = 2) => arithmetic.sum(x, -y, { decimals });

/**
 * add two amounts
 *
 * @param {Number} x - amount1
 * @param {Number} y - amount2
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {Number} Monetary value of amount1 + amount2
 *
 * @example
 *
 * add(0.1, 0.2) // 0.3
 */

const add = (x, y, decimals = 2) => arithmetic.sum(x, y, { decimals });

/**
 * Multiply an amount by a factor
 *
 * @param {(Number|String)} amount numeric value
 * @param {Number=} factor integer
 * @param {Number=} decimals integer
 * @returns {Number} Monetary value of amount*factor
 *
 * @example
 * fx(100, 1.55235) // 155.24
 * fx('100', 0.01) // 1
 * fx(100, 0.0000155235) // 0.01
 * fx(100, 0.0000155235,4) // 0.0016
 *
 */
const multiply = (amount, factor = 1, decimals = 2) =>
  arithmetic.multiply(amount, factor, decimals);

/**
 * Divide an amount by a divisor
 *
 * @param {(Number|String)} amount numeric value
 * @param {Number=} divisor integer
 * @param {Number=} decimals integer
 * @returns {Number} Monetary value of amount/factor
 *
 * @throws Will throw an error if the divisor is zero.
 * @throws {ArgumentError} cant divide by zero
 *
 * @example
 * divide(123.451, 1) // 123.46
 * divide(123.45 , 2) // 61.73
 * divide(123.451 , 2) // 61.73
 * divide('123.451' , 2) // 61.73
 * divide(10 , 0) // ArgumentError: cant divide by zero
 * divide('abcd' , 2) // NaN
 * divide(null|undefined|any[]|object , 1) // NaN
 */
const divide = (amount, divisor = 1, decimals = 2) =>
  arithmetic.divide(amount, divisor, decimals);

/**
 * Compare two monetary amounts
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {-1|0|1} -1 if lh < rh, 0 if equal, 1 if lh > rh
 *
 * @example
 * compare(1, 2)    // -1
 * compare(2, 1)    // 1
 * compare(1, 1)    // 0
 * compare(NaN, 1)  // NaN
 */
const compare = (lh, rh, decimals = 2) => arithmetic.compare(lh, rh, decimals);

/**
 * Check if a value is a valid numeric monetary amount
 * @public
 * @param {*} amount any value
 * @returns {boolean}
 *
 * @example
 * isValid(1)         // true
 * isValid('10.5')    // true
 * isValid(0)         // true
 * isValid(NaN)       // false
 * isValid(null)      // false
 * isValid(undefined) // false
 * isValid('abc')     // false
 * isValid([])        // false
 * isValid({})        // false
 */
const isValid = (amount) => arithmetic.isValid(amount);

/**
 * Check if monetary value rounds to exactly 0
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {boolean}
 *
 * @example
 * isZero(0)     // true
 * isZero(1)     // false
 * isZero(0.001) // false (rounds up to 0.01)
 */
const isZero = (amount, decimals = 2) => arithmetic.isZero(amount, decimals);

/**
 * Check if monetary value is greater than 0
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {boolean}
 *
 * @example
 * isPositive(1)  // true
 * isPositive(0)  // false
 * isPositive(-1) // false
 */
const isPositive = (amount, decimals = 2) =>
  arithmetic.isPositive(amount, decimals);

/**
 * Check if monetary value is less than 0
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} [decimals] decimal places (default 2)
 * @returns {boolean}
 *
 * @example
 * isNegative(-1) // true
 * isNegative(0)  // false
 * isNegative(1)  // false
 */
const isNegative = (amount, decimals = 2) =>
  arithmetic.isNegative(amount, decimals);

/**
 * Returns the absolute (non-negative) monetary value
 * @public
 * @param {(Number|String)} amount numeric value
 * @param {Number} [decimals] integer
 * @returns {Number}
 *
 * @example
 * abs(-10.50) // 10.50
 * abs(10.50)  // 10.50
 * abs(0)      // 0
 */
const abs = (amount, decimals = 2) => arithmetic.abs(amount, decimals);

/**
 * Returns the smallest monetary value from a list of amounts
 * @public
 * @param {(number | string | number[] | string[])} amounts numeric values
 * @returns {Number}
 *
 * @example
 * min(10, 20, 5)    // 5
 * min([10, 20, 5])  // 5
 */
const min = (...amounts) => arithmetic.min(...amounts);

/**
 * Returns the largest monetary value from a list of amounts
 * @public
 * @param {(number | string | number[] | string[])} amounts numeric values
 * @returns {Number}
 *
 * @example
 * max(10, 20, 5)    // 20
 * max([10, 20, 5])  // 20
 */
const max = (...amounts) => arithmetic.max(...amounts);

/**
 * Check if two monetary amounts are equal after rounding
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {boolean}
 *
 * @example
 * equal(1, 1)       // true
 * equal(0.1, 0.10)  // true
 * equal(1, 2)       // false
 */
const equal = (lh, rh, decimals = 2) => arithmetic.equal(lh, rh, decimals);

/**
 * Check if lh is strictly greater than rh
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {boolean}
 */
const greaterThan = (lh, rh, decimals = 2) =>
  arithmetic.greaterThan(lh, rh, decimals);

/**
 * Check if lh is greater than or equal to rh
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {boolean}
 */
const greaterThanOrEqual = (lh, rh, decimals = 2) =>
  arithmetic.greaterThanOrEqual(lh, rh, decimals);

/**
 * Check if lh is strictly less than rh
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {boolean}
 */
const lessThan = (lh, rh, decimals = 2) =>
  arithmetic.lessThan(lh, rh, decimals);

/**
 * Check if lh is less than or equal to rh
 * @public
 * @param {(Number|String)} lh left-hand amount
 * @param {(Number|String)} rh right-hand amount
 * @param {Number} [decimals] integer
 * @returns {boolean}
 */
const lessThanOrEqual = (lh, rh, decimals = 2) =>
  arithmetic.lessThanOrEqual(lh, rh, decimals);

/**
 * Format a monetary amount as a currency string.
 * Uses Intl.NumberFormat for standard currencies; handles BTC, ETH, SAT manually.
 *
 * @param {(Number|String)} amount numeric value
 * @param {String} [currencyCode='USD'] ISO 4217 currency code or 'BTC'/'ETH'/'SAT'
 * @param {String} [locale] BCP 47 locale (e.g. 'en-US', 'de-DE')
 * @param {Object} [options] extra Intl.NumberFormat options
 * @returns {String} formatted string
 *
 * @throws {ArgumentError} if amount is not numeric or currency code is unsupported
 *
 * @example
 * format(1234.56, 'USD', 'en-US')  // '$1,234.56'
 * format(1234.56, 'EUR', 'de-DE')  // '1.234,56 €'
 * format(0.12345678, 'BTC')        // '₿0.12345678'
 */
const format = (amount, currencyCode, locale, options) =>
  formatCurrency(amount, currencyCode, locale, options);

/**
 * Convert an amount from one currency to another using a rates table.
 * The rates object maps currency codes to their value relative to a common base.
 *
 * @param {(Number|String)} amount numeric value in `from` currency
 * @param {String} from source currency code (e.g. 'USD')
 * @param {String} to target currency code (e.g. 'EUR')
 * @param {Object} rates map of currency codes to rates (same base)
 * @param {Number} [decimals=2] decimal precision for the result
 * @returns {Number} converted amount
 *
 * @throws {ArgumentError} if a currency code is missing from rates or rate is zero
 *
 * @example
 * const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };
 * convert(100, 'USD', 'EUR', rates)       // 92
 * convert(100, 'EUR', 'USD', rates)       // 108.7
 * convert(100, 'USD', 'BTC', rates, 8)    // crypto-precision result
 */
const convert = (amount, from, to, rates, decimals) =>
  convertCurrency(amount, from, to, rates, decimals);

/**
 * @summary Recipes
 * @namespace recipes
 * @public
 */
const recipes = {
  /**
   * Compute an amount partition
   *
   * @param {(Number|String)} amount numeric value
   * @param {(Number|Number[])} parts integer or percent partition (array of percent parts)
   * @returns {Number}
   *
   * @throws Will throw an error if parts arguments is not a positive integer or is not a partition of 100
   * @throws {ArgumentError} parts must be a positive integer or an array with a partition of 100
   *
   * @example
   * partition(1,2) // [0.5,0.5]
   * partition(1,3) // [0.34, 0.33, 0.33]
   * partition(1,11) // [0.1,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09]
   * partition(1,[50,50]) // [0.5,0.5]
   * partition(1,...[50,50]) // [0.5,0.5]
   * partition(1,50,50) // [0.5,0.5]
   * partition(0.01,[41,33,15,9,2]) //[0.01,0,0,0,0]
   * partition(10,[41,33,15,9,2]) //[4.1,3.3,1.5,0.9,0.2]
   * partition(100,"qwert") // ArgumentError: parts must be a positive integer or an array with a partition of 100
   * partition(100,0) // ArgumentError: parts must be a positive integer or an array with a partition of 100
   * partition(100,[50,49]) // ArgumentError: parts must be a positive integer or an array with a partition of 100
   *
   */
  partition: (amount, ...parts) => partition(amount, ...parts),
  /**
   * Compute tax to base amount, follow max policy from percent value and fee value
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p porcentual value
   * @param {Number} fee numeric value
   * @returns {Number}
   *
   *
   */
  maxTax: (amount, p, fee) => maxTax(amount, p, fee),
  /**
   * Apply a percent discount to base amount
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p porcentual value
   * @returns {Number}
   */
  applyDiscount: (amount, p) => applyDiscount(amount, p),
  /**
   * Apply a percent tax to base amount
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p porcentual value
   * @returns {Number}
   */
  applyTax: (amount, p) => applyTax(amount, p),
  /**
   * Apply tax to base amount, follow max policy from percent value and fee value
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p porcentual value
   * @param {Number} fee numeric value
   * @returns {Number}
   */
  applyMaxTax: (amount, p, fee) => applyMaxTax(amount, p, fee),
  /**
   * Apply tax to base amount, follow sum policy from percent value and fee value
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p porcentual value
   * @param {Number} fee numeric value
   * @returns {Number}
   */
  applySumTax: (amount, p, fee) => applySumTax(amount, p, fee),
  /**
   * Apply discount using max policy (larger of: p% of amount vs fixed fee)
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p percent value
   * @param {Number} fee fixed fee
   * @returns {Number}
   *
   * @example
   * applyMaxDiscount(100, 10, 20) // 80
   * applyMaxDiscount(100, 25, 20) // 75
   */
  applyMaxDiscount: (amount, p, fee) => applyMaxDiscount(amount, p, fee),
  /**
   * Apply discount using sum policy (percent discount then subtract fixed fee)
   *
   * @param {(Number|String)} amount numeric value
   * @param {Number} p percent value
   * @param {Number} fee fixed fee
   * @returns {Number}
   *
   * @example
   * applySumDiscount(100, 10, 20) // 70
   * applySumDiscount(100, 0, 10)  // 90
   */
  applySumDiscount: (amount, p, fee) => applySumDiscount(amount, p, fee),
};

module.exports = {
  value,
  cents,
  cents2Amount,
  fx,
  sum,
  percent,
  add,
  subtract,
  multiply,
  divide,
  compare,
  isValid,
  isZero,
  isPositive,
  isNegative,
  abs,
  min,
  max,
  equal,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  format,
  convert,
  ArgumentError,
  recipes,
  ...recipes,
};
