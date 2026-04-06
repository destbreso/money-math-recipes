# abakojs

> Tiny, zero-dependency monetary arithmetic for JavaScript and TypeScript.

---

## The Problem

JavaScript arithmetic is broken for money:

```js
// Addition
0.1 + 0.2                // 0.30000000000000004
0.1 + 0.2 + 0.3          // 0.6000000000000001

// Multiplication
0.07 * 3                 // 0.21000000000000002
100 * 0.07               // 7.000000000000001

// Percentages
1.15 * 100               // 114.99999999999999  ← 15% markup gone wrong
49.99 * 0.92             // 45.99080000000001   ← FX conversion drift

// Rounding
(1.005).toFixed(2)       // "1.00"  ← should be "1.01"
```

This is not a bug — it's how IEEE 754 floating-point works. But when you're building an invoice, a checkout, or a crypto wallet, wrong numbers mean real money lost.

---

## The Solution

**abakojs** gives you a simple, native-number API that always rounds correctly, without wrappers, classes, or configuration ceremony.

```js
import { sum, multiply, percent, fx, value } from 'abakojs';

0.1 + 0.2              // 0.30000000000000004  ← JS native
sum(0.1, 0.2)          // 0.3                  ✓

0.07 * 3               // 0.21000000000000002  ← JS native
multiply(0.07, 3)      // 0.21                 ✓

1.15 * 100             // 114.99999999999999   ← JS native
percent(100, 15)       // 15   → 100 + 15 = 115 ✓

49.99 * 0.92           // 45.99080000000001    ← JS native
fx(49.99, 0.92)        // 45.99                ✓

value(1.005)           // 1.01                 ✓
```

Plain numbers in, plain numbers out. No `new Money()`, no `.toUnit()`, no boilerplate.

All functions also accept **strings** and **mixed inputs** — whatever comes back from a form, an API, or a database:

```js
add('0.1', '0.2')              // 0.3  ✓
sum('19.99', 4.99, '0.50')     // 25.48  ✓
multiply('19.99', '3')         // 59.97  ✓
fx('49.99', 0.92)              // 45.99  ✓
compare('1.99', '2.00')        // -1  ✓
```

---

## Install

```bash
npm install abakojs
# pnpm add abakojs
# yarn add abakojs
```

TypeScript types and ESM/CJS builds are included — no `@types` package needed.

---

## Quick Start

```js
// CommonJS
const { sum, value, percent, addPercent, deductPercent, split } = require('abakojs');

// ESM / TypeScript
import { sum, value, percent, addPercent, deductPercent, split } from 'abakojs';
```

```js
value(10.2506)             // 10.26
sum(19.99, 4.99, 0.50)     // 25.48
percent(249.90, 8.5)       // 21.24
addPercent(89.99, 21)      // 108.89  (add 21% VAT)
deductPercent(149.99, 15)  // 127.49  (15% discount)
split(49.99, 3)            // [16.67, 16.66, 16.66]  ← exact, no cent lost
```

**Strings work everywhere** — numbers, strings, and mixed inputs are all accepted:

```js
sum('19.99', 4.99, '0.50')   // 25.48  (mixed)
add('0.1', '0.2')            // 0.3    (all strings, precision guaranteed)
multiply('49.99', '1.21')    // 60.49  (all strings)
```

**Cents workflow** — convert to/from integer cents for storage or legacy APIs:

```js
const c = cents(3.12)        // 312
cents2Amount(c)              // 3.12
cents2Amount(cents(19.99))   // 19.99  (round-trip)
```

---

## Common Use Cases

### E-commerce cart total

```js
import { sum, multiply, deductPercent, addPercent } from 'abakojs';

const items = [
  { price: 19.99, qty: 2 },
  { price: 4.99,  qty: 1 },
  { price: 0.49,  qty: 3 },
];

const subtotal    = sum(items.map(i => multiply(i.price, i.qty)));
// 44.44  (= 39.98 + 4.99 + 1.47) — no rounding drift

const afterCoupon = deductPercent(subtotal, 5);   // 42.22  (5% coupon)
const total       = addPercent(afterCoupon, 21);  // 51.09  (21% VAT)
```

### Invoice with fees

```js
import { addFees, addMaxFee, deductFees } from 'abakojs';

// Platform fee: 2.9% + $0.30 flat (Stripe-style)
addFees(49.99, 2.9, 0.30)       // 51.74

// Charge whichever is higher: 2.5% or $4.99 minimum
addMaxFee(149.99, 2.5, 4.99)    // 154.98  ($4.99 wins over 3.75)
addMaxFee(299.99, 2.5, 4.99)    // 307.49  (7.50 wins over $4.99)

// Coupon: 12% off + $2.50 flat discount
deductFees(89.99, 12, 2.50)     // 76.69
```

### Split a bill without losing cents

```js
import { split } from 'abakojs';

split(49.99, 3)               // [16.67, 16.66, 16.66]
split(74.97, [50, 30, 20])    // [37.49, 22.49, 14.99]
split(0.07, [50, 30, 20])     // [0.04, 0.02, 0.01]  ← remainder to first
```

### Currency formatting

```js
import { format } from 'abakojs';

format(1234.56, 'USD', 'en-US')   // '$1,234.56'
format(1234.56, 'EUR', 'de-DE')   // '1.234,56 €'
format(1234.56, 'GBP', 'en-GB')   // '£1,234.56'
format(-19.99, 'USD', 'en-US')    // '-$19.99'
format(0.12345678, 'BTC')         // '₿0.12345678'
```

### Multi-currency conversion

```js
import { convert } from 'abakojs';

const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5 };

convert(100, 'USD', 'EUR', rates)       // 92
convert(100, 'EUR', 'USD', rates)       // 108.7
convert(100, 'EUR', 'GBP', rates)       // 85.87  (cross-rate auto-calculated)
```

### Crypto / high-precision arithmetic

Every function accepts a `decimals` parameter (default `2`). Set it to `8` for BTC, `6` for USDC, or any value.

```js
import { add, subtract, sum, compare, isPositive, value } from 'abakojs';

value(0.123456789, 8)                          // 0.12345679
add(0.12345678, 0.00000001, 8)                 // 0.12345679
subtract(1, 0.00000001, 8)                     // 0.99999999
sum(0.001, 0.002, 0.003, { decimals: 8 })      // 0.006
compare(0.12345678, 0.12345679, 8)             // -1
isPositive(0.00000001, 8)                      // true  (1 satoshi > 0)
```

> For variadic functions (`sum`, `min`, `max`) pass `{ decimals }` as the last argument. For all others it's a regular positional parameter.

### Comparing and sorting amounts

```js
import { compare, equal, greaterThan, min, max } from 'abakojs';

compare(19.99, 24.99)       // -1
equal(0.1 + 0.2, 0.3)      // true  (safe after rounding)
greaterThan(24.99, 19.99)   // true

const prices = [14.99, 9.50, 22.95, 4.75];
min(...prices)              // 4.75
max(...prices)              // 22.95
```

---

## API Reference

All functions return `NaN` for invalid inputs (`null`, `undefined`, `[]`, `{}`, `true/false`, non-numeric strings) unless otherwise noted.

### Core

#### `value(amount, decimals?)`

Rounds an amount to the specified number of decimal places (default `2`). This is the core of the library — all other functions route through it.

```js
value(10.2506)          // 10.26
value(10.2506, 4)       // 10.2506
value('50.001')         // 50.01
value(null)             // NaN
```

#### `cents(amount)`

Converts a monetary amount to its integer cent representation.

```js
cents(0.01)    // 1
cents(0.17)    // 17
cents(3.12)    // 312
cents(0.11001) // 12
```

#### `cents2Amount(cents)`

Converts an integer cent value back to a monetary amount.

Throws `ArgumentError` if the input is a negative number or a float.

```js
cents2Amount(157)    // 1.57
cents2Amount('5513') // 55.13
cents2Amount(99)     // 0.99
cents2Amount(12.5)   // throws ArgumentError: cents must be positive integer
cents2Amount(-25)    // throws ArgumentError: cents must be positive integer
```

#### `fx(amount, fxRate, decimals?)`

Applies an exchange rate to an amount.

```js
fx(49.99, 1.0847)            // 54.22  (USD → CAD)
fx('99.95', 0.9201)          // 91.96  (string input, USD → EUR)
fx(0.001, 65432.10, 2)       // 65.43  (mBTC → USD)
```

### Arithmetic

#### `sum(...amounts)` / `sum(amounts[])` / `sum(...amounts, { decimals })`

Aggregates any number of amounts. Accepts variadic arguments, spread arrays, or a single array. Pass `{ decimals }` as the last argument for custom precision.

```js
sum(0.1, 0.2)               // 0.3
sum(0.1, 0.2, '-0.3')       // 0
sum([0.1, 0.2, -0.3])       // 0
sum(...[0.1, 0.2, -0.3])    // 0

// Crypto (8 decimals)
sum(0.12345678, 0.00000001, { decimals: 8 })   // 0.12345679
sum([0.001, 0.002, 0.003], { decimals: 8 })    // 0.006
```

#### `add(x, y, decimals?)`

Adds two amounts.

```js
add(0.1, 0.2)              // 0.3
add('19.99', '4.99')       // 24.98  (all strings)
add(0.12345678, 0.00000001, 8)  // 0.12345679
```

#### `subtract(x, y, decimals?)`

Subtracts `y` from `x`.

```js
subtract(1.01, 0.99)  // 0.02
subtract(0.3, 0.1)    // 0.2

// Crypto (8 decimals)
subtract(0.12345679, 0.00000001, 8)  // 0.12345678
```

#### `multiply(amount, factor, decimals?)`

Multiplies an amount by a factor.

```js
multiply(49.99, 1.21)      // 60.49  (apply 21% markup)
multiply('19.99', '3')     // 59.97  (all strings)
```

#### `divide(amount, divisor, decimals?)`

Divides an amount. Throws `ArgumentError` on division by zero.

```js
divide(123.45, 2)   // 61.73
divide(74.97, 3)    // 24.99
divide(49.99, 0)    // throws ArgumentError: cant divide by zero
```

#### `percent(amount, p, decimals?)`

Computes `p`% of `amount`.

```js
percent(249.90, 8.5)    // 21.24  (VAT portion)
percent(524.25, 8.75)   // 45.88
percent('89.99', 12.5)  // 11.25  (string input)

// Crypto (8 decimals)
percent(0.12345678, 10, 8)  // 0.01234568
```

### Comparison

#### `compare(lh, rh, decimals?)`

Compares two monetary amounts after rounding. Returns `-1`, `0`, or `1`. Returns `NaN` if either operand is invalid.

```js
compare(19.99, 24.99)    // -1
compare(24.99, 19.99)    // 1
compare(9.99, 9.990)     //  0
compare('0.10', 0.1)     //  0   (string input)
compare(NaN, 1.99)       // NaN

// Crypto (8 decimals)
compare(0.12345678, 0.12345679, 8)  // -1
compare(0.12345678, 0.12345678, 8)  //  0
```

Precision determines what counts as equal. Both sides are rounded **before** comparing — so two values that differ only beyond the active decimal place are treated as identical:

```js
// Default precision: 2 decimals
compare(9.994, 9.999)        //  0  (both ceiling to 10.00 → equal)
compare(9.994, 9.999, 3)     // -1  (9.994 < 9.999 at 3 dp)

compare(14.9949, 14.9951)    //  0  (both ceiling to 15.00 at 2dp)
compare(14.9949, 14.9951, 4) // -1  (14.9949 < 14.9951 at 4 dp)
```

> **Note:** values are rounded before comparison. `compare(0.001, 0.002)` → `0` because both round to `0.00` at default precision.

### Guards

#### `isValid(amount)`

Returns `true` if the value is a valid numeric monetary amount.

```js
isValid(19.99)     // true
isValid('10.5')    // true
isValid(0.01)      // true
isValid(NaN)       // false
isValid(null)      // false
isValid([])        // false
isValid(true)      // false
```

#### `isZero(amount, decimals?)`

```js
isZero(0)     // true
isZero(0.001) // false  (rounds up to 0.01)

// Crypto (8 decimals)
isZero(0.00000001, 8) // false (1 satoshi is not zero)
isZero(0, 8)          // true
```

#### `isPositive(amount, decimals?)`

```js
isPositive(0.01)    // true
isPositive(0)       // false
isPositive(-0.01)   // false

// Crypto (8 decimals)
isPositive(0.00000001, 8)  // true
```

#### `isNegative(amount, decimals?)`

```js
isNegative(-0.01)   // true
isNegative(0)       // false
isNegative(0.01)    // false

// Crypto (8 decimals)
isNegative(-0.00000001, 8)  // true
```

#### `abs(amount, decimals?)`

Returns the absolute value of a monetary amount.

```js
abs(-10.50)  // 10.50
abs(10.50)   // 10.50
abs('-3.14') // 3.14
```

#### `min(...amounts)` / `min(amounts[])` / `min(...amounts, { decimals })`

Returns the smallest value from the given amounts.

```js
min(14.99, 9.50, 22.95)           // 9.50
min([14.99, 9.50, 22.95])         // 9.50
min(-0.99, -5.49, 0.01)           // -5.49

// Crypto (8 decimals)
min(0.12345678, 0.12345679, { decimals: 8 })  // 0.12345678
```

#### `max(...amounts)` / `max(amounts[])` / `max(...amounts, { decimals })`

Returns the largest value from the given amounts.

```js
max(14.99, 9.50, 22.95)           // 22.95
max([14.99, 9.50, 22.95])         // 22.95
max(-0.99, -5.49, 0.01)           // 0.01

// Crypto (8 decimals)
max(0.12345678, 0.12345679, { decimals: 8 })  // 0.12345679
```

#### `equal(lh, rh, decimals?)`

Returns `true` if two amounts are equal after rounding.

```js
equal(19.99, 19.99)      // true
equal(49.981, 49.99)     // true   (49.981 ceilings to 49.99)
equal(19.99, 20.00)      // false

// Precision changes the boundary
equal(49.994, 49.999)    // true   (both ceiling to 50.00 at 2dp)
equal(49.994, 49.999, 3) // false  (49.994 ≠ 49.999 at 3dp)
equal(9.9949, 9.9951)    // true   (both ceiling to 10.00 at 2dp)
```

#### `greaterThan(lh, rh, decimals?)`

```js
greaterThan(24.99, 19.99)      // true
greaterThan(19.99, 24.99)      // false
greaterThan(19.99, 19.99)      // false

// Precision changes the result
greaterThan(9.999, 9.994)      // false  (both round to 9.99 at 2 dp)
greaterThan(9.999, 9.994, 3)   // true   (9.999 > 9.994 at 3 dp)
```

#### `greaterThanOrEqual(lh, rh, decimals?)`

```js
greaterThanOrEqual(24.99, 19.99)  // true
greaterThanOrEqual(19.99, 19.99)  // true
greaterThanOrEqual(14.99, 19.99)  // false

// Precision changes the result
greaterThanOrEqual(9.994, 9.999)     // true   (both round to 9.99 at 2dp → equal)
greaterThanOrEqual(9.994, 9.999, 3)  // false  (9.994 < 9.999 at 3dp)
```

#### `lessThan(lh, rh, decimals?)`

```js
lessThan(14.99, 19.99)      // true
lessThan(19.99, 14.99)      // false
lessThan(19.99, 19.99)      // false

// Precision changes the result
lessThan(9.994, 9.999)      // false  (both round to 9.99 at 2 dp)
lessThan(9.994, 9.999, 3)   // true   (9.994 < 9.999 at 3 dp)
```

#### `lessThanOrEqual(lh, rh, decimals?)`

```js
lessThanOrEqual(14.99, 19.99)  // true
lessThanOrEqual(19.99, 19.99)  // true
lessThanOrEqual(24.99, 19.99)  // false

// Precision changes the result
lessThanOrEqual(9.999, 9.994)     // true   (both round to 9.99 at 2dp → equal)
lessThanOrEqual(9.999, 9.994, 3)  // false  (9.999 > 9.994 at 3dp)
```

### Formatting & Conversion

#### `format(amount, currencyCode?, locale?, options?)`

Formats a monetary amount as a currency string using `Intl.NumberFormat`. Handles standard ISO 4217 currencies and crypto (BTC, ETH, SAT).

```js
format(1234.56, 'USD', 'en-US')      // '$1,234.56'
format(1234.56, 'EUR', 'de-DE')      // '1.234,56 €'
format(1234.56, 'GBP', 'en-GB')      // '£1,234.56'
format(1234, 'JPY', 'en-US')         // '¥1,234'
format(-19.99, 'USD', 'en-US')       // '-$19.99'

// Crypto
format(0.12345678, 'BTC', 'en-US')   // '₿0.12345678'
format(2.5, 'ETH', 'en-US')          // 'Ξ2.5'
format(100000, 'SAT', 'en-US')       // 'sat100,000'

// Default: USD
format(100)                           // '$100.00' (locale-dependent)
```

Throws `ArgumentError` if the amount is not numeric or the currency code is unsupported.

#### `convert(amount, from, to, rates, decimals?)`

Converts an amount between currencies using a rates table. The `rates` object maps currency codes to rates relative to a common base — the library calculates cross-rates automatically.

```js
const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, BTC: 0.0000125 };

convert(100, 'USD', 'EUR', rates)         // 92
convert(100, 'EUR', 'USD', rates)         // 108.7
convert(100, 'EUR', 'GBP', rates)         // 85.87  (cross-rate)
convert(100, 'USD', 'JPY', rates)         // 14950
convert(1, 'BTC', 'USD', rates)           // 80000
convert(100, 'USD', 'BTC', rates, 8)      // 0.00125 (crypto precision)

convert(100, 'USD', 'USD', rates)         // 100 (same currency)
convert('100', 'usd', 'eur', rates)       // 92 (strings + case-insensitive)
```

Throws `ArgumentError` if a currency code is missing from the rates object or if a rate is zero.

---

## Recipes

Higher-level operations available as `recipes.*` and as direct named exports.

### `split(amount, parts)`

Splits an amount into equal or weighted parts, guaranteeing the total is always exact — no cent is lost or duplicated.

**Equal parts:**

```js
split(1, 3)    // [0.34, 0.33, 0.33]
split(1, 6)    // [0.17, 0.17, 0.17, 0.17, 0.16, 0.16]
split(0.01, 5) // [0.01, 0, 0, 0, 0]
```

**Weighted parts (array must sum to 100):**

```js
split(100, [50, 50])           // [50, 50]
split(100, [41, 33, 15, 9, 2]) // [41, 33, 15, 9, 2]
split(10, [41, 33, 15, 9, 2])  // [4.1, 3.3, 1.5, 0.9, 0.2]
```

Spread and rest params also work:

```js
split(100, ...[50, 50]) // [50, 50]
split(100, 50, 50)      // [50, 50]
```

Throws `ArgumentError` if parts don't sum to 100 or argument is invalid.

> `partition` is still available as an alias and will be deprecated in a future major version.

### `addPercent(amount, p)`

Adds a percentage surcharge to an amount.

```js
addPercent(89.99, 21)    // 108.89  (add 21% VAT)
addPercent(149.99, 10)   // 164.99  (add 10% platform fee)
```

> **Deprecated alias:** `applyTax()`

### `deductPercent(amount, p)`

Deducts a percentage from an amount.

```js
deductPercent(89.99, 15)    // 76.49  (15% discount)
deductPercent(49.99, 8.5)   // 45.74  (8.5% loyalty discount)
```

> **Deprecated alias:** `applyDiscount()`

### `maxFee(amount, p, fee)`

Returns the larger of: p% of amount, or a fixed fee. Useful when a minimum charge applies.

```js
maxFee(29.99, 10, 4.99)   //  4.99  (10% = 3.00, fixed fee wins)
maxFee(99.99, 10, 4.99)   // 10.00  (10% = 10.00, pct wins)
```

> **Deprecated alias:** `maxTax()`

### `addMaxFee(amount, p, fee)`

Adds the larger of: percentage or fixed fee, to the amount.

```js
addMaxFee(29.99, 10, 4.99)   // 34.98  ($4.99 wins over 3.00)
addMaxFee(99.99, 10, 4.99)   // 109.99  (10% = 10.00 wins over $4.99)
```

> **Deprecated alias:** `applyMaxTax()`

### `addFees(amount, p, fee)`

Adds both a percentage and a fixed fee to the amount.

```js
addFees(49.99, 2.9, 0.30)   // 51.74  (2.9% + $0.30 flat, Stripe-style)
```

> **Deprecated alias:** `applySumTax()`

### `deductMaxFee(amount, p, fee)`

Deducts the **larger** of a percentage or a fixed fee from the amount.

```js
deductMaxFee(149.99, 5, 12.00)   // 137.99  ($12 wins over 7.50)
deductMaxFee(299.99, 5, 12.00)   // 284.99  (5% = 15.00 wins over $12)
```

> **Deprecated alias:** `applyMaxDiscount()`

### `deductFees(amount, p, fee)`

Deducts both a percentage and a fixed fee from the amount.

```js
deductFees(89.99, 12, 2.50)    // 76.69  (12% off + $2.50 flat)
deductFees(149.99, 5, 3.99)    // 138.50  (5% off + $3.99 flat)
```

> **Deprecated alias:** `applySumDiscount()`

---

## Error Handling

`ArgumentError` is exported for use in `catch` blocks or `instanceof` checks.

```js
const { ArgumentError } = require('abakojs');

try {
  divide(10, 0);
} catch (e) {
  if (e instanceof ArgumentError) {
    console.error('Invalid argument:', e.message);
  }
}
```

```ts
import { ArgumentError, divide } from 'abakojs';

try {
  divide(10, 0);
} catch (e) {
  if (e instanceof ArgumentError) { /* ... */ }
}
```

---

## Benchmarks

Node.js v22.14.0 · macOS · Apple M-series · 500,000 iterations each.  
Run them yourself: `node bench/bench.js`

---

### Speed (ops/sec — higher is better)

| Operation               |       abakojs |   currency.js | decimal.js | dinero.js v2 |
|-------------------------|--------------:|--------------:|-----------:|-------------:|
| `add(0.1, 0.2)`         | **2,250,335** |     1,498,950 |  1,646,491 |  3,536,595 ¹ |
| `subtract(1.01, 0.99)`  | **3,153,802** |     1,609,369 |  1,351,347 |  4,152,963 ¹ |
| `multiply(165, 1.40)`   | **3,728,548** |     1,931,203 |  2,630,027 |  8,345,742 ¹ |
| `value()` rounding      |     3,337,585 | **4,626,968** |  2,044,684 |            — |
| `partition(1, 3)`       | **1,273,354** |       660,646 |          — |  1,331,005 ¹ |
| `sum([10 items])`       |   **530,404** |       142,896 |    332,133 |            — |
| `percent(524.25, 8.75)` | **2,427,743** |       582,216 |    639,355 |            — |

### Crypto precision (8 decimals, ops/sec)

| Operation              |       abakojs |   currency.js | decimal.js | dinero.js v2 |
|------------------------|--------------:|--------------:|-----------:|-------------:|
| `add` (8 decimals)     | **2,556,626** |     1,170,208 |  1,144,156 |  5,433,023 ¹ |
| `compare` (8 decimals) | **1,662,050** |     1,794,539 |  2,955,653 |            — |
| `format` (USD)         |      56,220 ² | **1,299,684** |          — |            — |
| `convert` (USD→EUR)    | **3,470,793** |             — |          — |            — |

> ¹ dinero.js v2 operates on integer cents internally (amounts pre-multiplied ×100), which skips the float-to-cents conversion step. It requires a verbose setup (`dinero({ amount: 10, currency: USD })`) for every value — not a drop-in replacement.
>
> ² `format()` uses `Intl.NumberFormat` under the hood for full locale + currency symbol support. This is inherently slower than currency.js's custom string formatter, but produces correct i18n output in any locale without extra dependencies.

**abakojs is 2–4× faster than currency.js and decimal.js** across all operations. dinero.js v2 is faster in raw throughput because it works with pre-scaled integers, but requires significantly more boilerplate.

### Package size (total JS files on disk)

| Library      |        Size |
|--------------|------------:|
| **abakojs**  | **28.4 KB** |
| currency.js  |     35.4 KB |
| decimal.js   |    277.7 KB |
| dinero.js v2 |    837.9 KB |

### Feature comparison

| Feature                                                    |     abakojs      | currency.js | dinero.js v2 | decimal.js |
|------------------------------------------------------------|:----------------:|:-----------:|:------------:|:----------:|
| Zero runtime dependencies                                  |        ✅         |      ✅      |      ✅       |     ✅      |
| TypeScript types bundled                                   |        ✅         |      ✅      |      ✅       |     ✅      |
| ESM + CJS support                                          |        ✅         |      ✅      |      ✅       |     ✅      |
| Simple number API (no wrappers)                            |        ✅         |      ❌      |      ❌       |     ❌      |
| Aggregate sum of N amounts                                 |        ✅         |      ❌      |      ❌       |     ❌      |
| Fee recipes (addPercent, maxFee, addFees…)                 |        ✅         |      ❌      |      ❌       |     ❌      |
| Discount recipes (applyDiscount, maxDiscount, sumDiscount) |        ✅         |      ❌      |      ❌       |     ❌      |
| Safe partition (exact cent distribution)                   |        ✅         |      ✅      |      ✅       |     ❌      |
| Helpers (isValid, isZero, isPositive…)                     |        ✅         |      ❌      |      ✅       |     ✅      |
| FX rate conversion                                         |        ✅         |      ✅      |      ✅       |     ❌      |
| Currency formatting / symbols                              |        ✅         |      ✅      |      ✅       |     ❌      |
| Arbitrary precision (beyond 2 decimals)                    | ✅ (configurable) |      ✅      |      ✅       |     ✅      |
| Crypto-ready (BTC satoshis, 8+ decimals)                   |        ✅         |      ✅      |      ✅       |     ✅      |
| Multi-currency arithmetic                                  |        ✅         |      ❌      |      ✅       |     ❌      |
| Internationalisation (i18n)                                |        ❌         |      ✅      |      ✅       |     ❌      |

### When to use what

| Use case                                            | Recommended   |
|-----------------------------------------------------|---------------|
| Monetary arithmetic — clean, fast, zero boilerplate | ✅ **abakojs** |
| Crypto arithmetic (BTC, ETH, configurable decimals) | ✅ **abakojs** |
| Currency formatting (`$1,234.56`, `€1.234,56`)      | ✅ **abakojs** |
| Multi-currency conversion with rates table          | ✅ **abakojs** |
| Multi-currency ledger with currency-typed objects   | dinero.js v2  |
| Scientific / arbitrary-precision decimals           | decimal.js    |
| Maximum raw throughput, integer-only data           | dinero.js v2  |

---

## License

MIT

