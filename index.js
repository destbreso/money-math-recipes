/* eslint-disable max-len */
const arithmetic = require('./lib/arithmetic');
const {
  partition,
  applyDiscount,
  applyMaxTax,
  applySumTax,
  applyTax,
  maxTax,
} = require('./lib/recipes');

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
const fx = (amount, fxRate, decimals = 2) => arithmetic.fx(amount, fxRate, decimals);

/**
   * Aggregate amounts
   * @public
   * @param {(...Number|...String|Number[]|String[])} amounts numeric values
   * @returns {Number} Monetary value of total amount
   * @example
   *
   * sum(0.1,0.2) // 0.3
   * sum(0.1,0.2,'-0.3') // 0
   * sum([0.1,0.2,-0.3]) // 0
   * sum(...['0.1','0.2','-0.3']) // 0
   * sum('abcd','{a: 1}') // NaN
   */
const sum = (...amounts) => arithmetic.sum(...amounts);

/**
   * Compute an amount fraction from a percent value
   * @public
   * @param {Number} amount base amount value
   * @param {Number} p percent value
   * @returns {Number} Monetary value of amount*p/100
   *
   */
const percent = (amount, p) => arithmetic.percent(amount, p);

/**
 * Difference of two amounts
 *
 * @param {Number} x - amount1
 * @param {Number} y - amount2
 * @returns {Number} Monetary value of amount1 - amount2
 *
 * @example
 *
 * subtract(1.01, 0.99) // 0.02
 * subtract(23.42, 19.13) // 4.29
 */

const subtract = (x, y) => arithmetic.sum(x, -y);

/**
 * add two amounts
 *
 * @param {Number} x - amount1
 * @param {Number} y - amount2
 * @returns {Number} Monetary value of amount1 + amount2
 *
 * @example
 *
 * add(0.1, 0.2) // 0.03
 */

const add = (x, y) => arithmetic.sum(x, y);

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
const multiply = (amount, factor = 1, decimals = 2) => arithmetic.multiply(amount, factor, decimals);

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
const divide = (amount, divisor = 1, decimals = 2) => arithmetic.divide(amount, divisor, decimals);

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
 * @param {(Number |Number[])} parts integer or percent partition (array of percent parts)
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
 * partition(0.01,[41,33,15,9,2]) //[0.01,0,0,0,0]
 * partition(10,[41,33,15,9,2]) //[4.1,3.3,1.5,0.9,0.2]
 * partition(100,"qwert") // ArgumentError: parts must be a positive integer or an array with a partition of 100
 * partition(100,0) // ArgumentError: parts must be a positive integer or an array with a partition of 100
 * partition(100,[50,49]) // ArgumentError: parts must be a positive integer or an array with a partition of 100
 *
 */
  partition: (amount, parts = 1) => partition(amount, parts),
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
  recipes,
  // TODO: DEPRECATE THIS
  ...recipes,
};
