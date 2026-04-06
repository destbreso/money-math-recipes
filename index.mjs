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
