// Type definitions for money-math-recipes
// Zero-dependency monetary arithmetic · ESM + CJS · TypeScript ready

export declare class ArgumentError extends Error {
  constructor(message: string);
  name: "ArgumentError";
}

// ─── Core arithmetic ────────────────────────────────────────────────────────

/**
 * Rounds `amount` up to `decimals` places (default 2).
 * Returns NaN for non-numeric inputs.
 */
export declare function value(
  amount: number | string,
  decimals?: number,
): number;

/** Converts a monetary amount to integer cents. */
export declare function cents(amount: number | string): number;

/**
 * Converts integer cents back to a monetary amount.
 * @throws {ArgumentError} if value is negative or not an integer
 */
export declare function cents2Amount(cents: number | string): number;

/**
 * Applies a foreign-exchange rate to an amount.
 */
export declare function fx(
  amount: number | string,
  fxRate: number,
  decimals?: number,
): number;

/**
 * Adds monetary amounts safely. Accepts spread args or a single array.
 * Pass `{ decimals }` as the last argument for custom precision.
 */
export declare function sum(
  amounts: Array<number | string>,
  options?: { decimals?: number },
): number;
export declare function sum(
  ...amounts: Array<number | string | { decimals?: number }>
): number;

/** Computes `p`% of `amount`. */
export declare function percent(
  amount: number | string,
  p: number,
  decimals?: number,
): number;

/** Adds two monetary amounts. */
export declare function add(
  x: number | string,
  y: number | string,
  decimals?: number,
): number;

/** Subtracts `y` from `x`. */
export declare function subtract(
  x: number | string,
  y: number | string,
  decimals?: number,
): number;

/** Multiplies `amount` by `factor`. */
export declare function multiply(
  amount: number | string,
  factor?: number,
  decimals?: number,
): number;

/**
 * Divides `amount` by `divisor`.
 * @throws {ArgumentError} if divisor is zero
 */
export declare function divide(
  amount: number | string,
  divisor?: number,
  decimals?: number,
): number;

/**
 * Compares two monetary values.
 * @returns -1 if lh < rh, 0 if equal, 1 if lh > rh. NaN for invalid inputs.
 */
export declare function compare(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): -1 | 0 | 1;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if `amount` is a valid numeric value (not NaN, null, undefined, array, object, or boolean). */
export declare function isValid(amount: unknown): boolean;

/** Returns true if the monetary value of `amount` rounds to exactly 0. */
export declare function isZero(
  amount: number | string,
  decimals?: number,
): boolean;

/** Returns true if the monetary value of `amount` is greater than 0. */
export declare function isPositive(
  amount: number | string,
  decimals?: number,
): boolean;

/** Returns true if the monetary value of `amount` is less than 0. */
export declare function isNegative(
  amount: number | string,
  decimals?: number,
): boolean;

/** Returns the absolute (non-negative) monetary value of `amount`. */
export declare function abs(amount: number | string, decimals?: number): number;

/** Returns the smallest monetary value from a list of amounts. Returns NaN if any value is invalid. */
export declare function min(
  ...amounts: Array<number | string | { decimals?: number }>
): number;
export declare function min(
  amounts: Array<number | string>,
  options?: { decimals?: number },
): number;

/** Returns the largest monetary value from a list of amounts. Returns NaN if any value is invalid. */
export declare function max(
  ...amounts: Array<number | string | { decimals?: number }>
): number;
export declare function max(
  amounts: Array<number | string>,
  options?: { decimals?: number },
): number;

/** Returns true if two monetary amounts are equal after rounding. */
export declare function equal(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): boolean;

/** Returns true if lh is strictly greater than rh. */
export declare function greaterThan(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): boolean;

/** Returns true if lh is greater than or equal to rh. */
export declare function greaterThanOrEqual(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): boolean;

/** Returns true if lh is strictly less than rh. */
export declare function lessThan(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): boolean;

/** Returns true if lh is less than or equal to rh. */
export declare function lessThanOrEqual(
  lh: number | string,
  rh: number | string,
  decimals?: number,
): boolean;

// ─── Currency formatting & conversion ───────────────────────────────────────

/**
 * Format a monetary amount as a currency string.
 * Uses `Intl.NumberFormat` for ISO 4217 currencies. Handles BTC, ETH, SAT manually.
 * @throws {ArgumentError} if amount is not numeric or currency code is unsupported
 */
export declare function format(
  amount: number | string,
  currencyCode?: string,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): string;

/**
 * Convert an amount from one currency to another using a rates table.
 * The `rates` object maps currency codes to their exchange rate relative to a common base.
 * @throws {ArgumentError} if a currency code is missing from rates or rate is zero
 */
export declare function convert(
  amount: number | string,
  from: string,
  to: string,
  rates: Record<string, number>,
  decimals?: number,
): number;

// ─── Recipes (top-level re-exports for convenience) ─────────────────────────

/** Returns the larger of `p`% of `amount` or fixed `fee`. */
export declare function maxTax(
  amount: number | string,
  p: number,
  fee: number,
): number;

/** Decreases `amount` by `p`%. */
export declare function applyDiscount(
  amount: number | string,
  p: number,
): number;

/** Increases `amount` by `p`%. */
export declare function applyTax(amount: number | string, p: number): number;

/** Applies `maxTax(amount, p, fee)` on top of `amount`. */
export declare function applyMaxTax(
  amount: number | string,
  p: number,
  fee: number,
): number;

/** Applies `p`% tax then adds fixed `fee`. */
export declare function applySumTax(
  amount: number | string,
  p: number,
  fee: number,
): number;

/** Subtracts the larger of (`p`% of amount) or fixed `fee` from `amount`. */
export declare function applyMaxDiscount(
  amount: number | string,
  p: number,
  fee: number,
): number;

/** Applies `p`% discount then subtracts fixed `fee`. */
export declare function applySumDiscount(
  amount: number | string,
  p: number,
  fee: number,
): number;

/**
 * Splits `amount` into N equal parts, or by percentage weights.
 * Remainder cents are distributed to the first parts so the total is always exact.
 * @throws {ArgumentError} if parts are invalid or percentages don't sum to 100
 */
export declare function partition(
  amount: number | string,
  parts: number,
): number[];
export declare function partition(
  amount: number | string,
  percentParts: number[],
): number[];
export declare function partition(
  amount: number | string,
  first: number,
  ...rest: number[]
): number[];
export declare function partition(amount: number | string): number[];

// ─── Recipes namespace ───────────────────────────────────────────────────────

export declare namespace recipes {
  function maxTax(amount: number | string, p: number, fee: number): number;
  function applyDiscount(amount: number | string, p: number): number;
  function applyTax(amount: number | string, p: number): number;
  function applyMaxTax(amount: number | string, p: number, fee: number): number;
  function applySumTax(amount: number | string, p: number, fee: number): number;
  function applyMaxDiscount(
    amount: number | string,
    p: number,
    fee: number,
  ): number;
  function applySumDiscount(
    amount: number | string,
    p: number,
    fee: number,
  ): number;
  function partition(amount: number | string, parts: number): number[];
  function partition(amount: number | string, percentParts: number[]): number[];
  function partition(
    amount: number | string,
    first: number,
    ...rest: number[]
  ): number[];
  function partition(amount: number | string): number[];
}

// ─── Default export ──────────────────────────────────────────────────────────

declare const money: {
  value: typeof value;
  cents: typeof cents;
  cents2Amount: typeof cents2Amount;
  fx: typeof fx;
  sum: typeof sum;
  percent: typeof percent;
  add: typeof add;
  subtract: typeof subtract;
  multiply: typeof multiply;
  divide: typeof divide;
  compare: typeof compare;
  isValid: typeof isValid;
  isZero: typeof isZero;
  isPositive: typeof isPositive;
  isNegative: typeof isNegative;
  abs: typeof abs;
  min: typeof min;
  max: typeof max;
  equal: typeof equal;
  greaterThan: typeof greaterThan;
  greaterThanOrEqual: typeof greaterThanOrEqual;
  lessThan: typeof lessThan;
  lessThanOrEqual: typeof lessThanOrEqual;
  format: typeof format;
  convert: typeof convert;
  ArgumentError: typeof ArgumentError;
  recipes: typeof recipes;
  maxTax: typeof maxTax;
  applyDiscount: typeof applyDiscount;
  applyTax: typeof applyTax;
  applyMaxTax: typeof applyMaxTax;
  applySumTax: typeof applySumTax;
  applyMaxDiscount: typeof applyMaxDiscount;
  applySumDiscount: typeof applySumDiscount;
  partition: typeof partition;
};

export default money;
