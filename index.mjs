// ESM entry point — wraps the CommonJS module for native import support
import money from "./index.js";

export const {
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
  // recipe top-level re-exports
  maxTax,
  applyDiscount,
  applyTax,
  applyMaxTax,
  applySumTax,
  applyMaxDiscount,
  applySumDiscount,
  partition,
} = money;

export default money;
