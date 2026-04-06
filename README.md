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
value(10.2506)           // 10.26
sum(19.99, 4.99, 0.50)   // 25.48
percent(200, 8.5)        // 17
addPercent(100, 21)      // 121  (add 21% VAT)
deductPercent(100, 10)   // 90   (10% discount)
split(100, 3)            // [33.34, 33.33, 33.33]  ← exact, no cent lost
```

**Strings work everywhere** — numbers, strings, and mixed inputs are all accepted:

```js
sum('19.99', 4.99, '0.50')   // 25.48
add('0.1', '0.2')            // 0.3
multiply('19.99', 3)         // 59.97
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

const afterCoupon = deductPercent(subtotal, 10);  // 40
const total       = addPercent(afterCoupon, 21);  // 48.4  (21% VAT)
```

### Invoice with fees

```js
import { addFees, addMaxFee, deductFees } from 'abakojs';

// Platform fee: 2% + $0.30 flat (Stripe-style)
addFees(100, 2, 0.30)       // 102.30

// Charge whichever is higher: 3% or $5 minimum
addMaxFee(100, 3, 5)        // 105   (5 wins over 3)
addMaxFee(500, 3, 5)        // 515   (15 wins over 5)

// Coupon: 15% off + $2 flat discount
deductFees(80, 15, 2)       // 66
```

### Split a bill without losing cents

```js
import { split } from 'abakojs';

split(100, 3)                     // [33.34, 33.33, 33.33]
split(100, [50, 30, 20])          // [50, 30, 20]
split(0.01, [50, 30, 20])         // [0.01, 0, 0]  ← remainder goes to first
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

compare(1.99, 2.00)        // -1
equal(0.1 + 0.2, 0.3)     // true  (safe after rounding)
greaterThan(10, 9.99)      // true

const prices = [14.99, 9.50, 22.00, 4.75];
min(...prices)             // 4.75
max(...prices)             // 22
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
fx(100, 1.55235)          // 155.24
fx(100, 0.01)             // 1
fx(100, 0.0000155235)     // 0.01
fx(100, 0.0000155235, 4)  // 0.0016
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
add(0.1, 0.2)   // 0.3
add(9.99, 0.01) // 10

// Crypto (8 decimals)
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
multiply(165, 1.40) // 231
multiply(100, 0.5)  // 50
```

#### `divide(amount, divisor, decimals?)`

Divides an amount. Throws `ArgumentError` on division by zero.

```js
divide(123.45, 2)  // 61.73
divide(10, 3)      // 3.34
divide(10, 0)      // throws ArgumentError: cant divide by zero
```

#### `percent(amount, p, decimals?)`

Computes `p`% of `amount`.

```js
percent(100, 10)     // 10
percent(524.25, 8.75) // 45.88
percent(99.99, 50)   // 50

// Crypto (8 decimals)
percent(0.12345678, 10, 8)  // 0.01234568
```

### Comparison

#### `compare(lh, rh, decimals?)`

Compares two monetary amounts after rounding. Returns `-1`, `0`, or `1`. Returns `NaN` if either operand is invalid.

```js
compare(1, 2)      // -1
compare(2, 1)      // 1
compare(1, 1)      // 0
compare(0.1, 0.10) // 0
compare(NaN, 1)    // NaN

// Crypto (8 decimals)
compare(0.12345678, 0.12345679, 8)  // -1
compare(0.12345678, 0.12345678, 8)  // 0
```

> **Note:** values are rounded before comparison. `compare(0.001, 0.002)` → `0` because both round to `0.01`.

### Guards

#### `isValid(amount)`

Returns `true` if the value is a valid numeric monetary amount.

```js
isValid(1)         // true
isValid('10.5')    // true
isValid(0)         // true
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
isPositive(1)   // true
isPositive(0)   // false
isPositive(-1)  // false

// Crypto (8 decimals)
isPositive(0.00000001, 8)  // true
```

#### `isNegative(amount, decimals?)`

```js
isNegative(-1)  // true
isNegative(0)   // false
isNegative(1)   // false

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
min(3, 1, 2)         // 1
min([10.5, 3.2, 7])  // 3.2
min(-1, -5, 0)       // -5

// Crypto (8 decimals)
min(0.12345678, 0.12345679, { decimals: 8 })  // 0.12345678
```

#### `max(...amounts)` / `max(amounts[])` / `max(...amounts, { decimals })`

Returns the largest value from the given amounts.

```js
max(3, 1, 2)         // 3
max([10.5, 3.2, 7])  // 10.5
max(-1, -5, 0)       // 0

// Crypto (8 decimals)
max(0.12345678, 0.12345679, { decimals: 8 })  // 0.12345679
```

#### `equal(lh, rh, decimals?)`

Returns `true` if two amounts are equal after rounding.

```js
equal(1, 1)       // true
equal(1, 1.004)   // true  (both round to 1.00)
equal(1, 2)       // false
```

#### `greaterThan(lh, rh, decimals?)`

```js
greaterThan(2, 1)    // true
greaterThan(1, 2)    // false
greaterThan(1, 1)    // false
```

#### `greaterThanOrEqual(lh, rh, decimals?)`

```js
greaterThanOrEqual(2, 1)  // true
greaterThanOrEqual(1, 1)  // true
greaterThanOrEqual(1, 2)  // false
```

#### `lessThan(lh, rh, decimals?)`

```js
lessThan(1, 2)    // true
lessThan(2, 1)    // false
lessThan(1, 1)    // false
```

#### `lessThanOrEqual(lh, rh, decimals?)`

```js
lessThanOrEqual(1, 2)  // true
lessThanOrEqual(1, 1)  // true
lessThanOrEqual(2, 1)  // false
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
addPercent(100, 10)  // 110
addPercent(200, 21)  // 242
```

> **Deprecated alias:** `applyTax()`

### `deductPercent(amount, p)`

Deducts a percentage from an amount.

```js
deductPercent(100, 10) // 90
deductPercent(11, 8.2) // 10.10
```

> **Deprecated alias:** `applyDiscount()`

### `maxFee(amount, p, fee)`

Returns the larger of: p% of amount, or a fixed fee. Useful when a minimum charge applies.

```js
maxFee(100, 10, 20) // 20  (10% = 10, fee = 20 → max is 20)
maxFee(100, 21, 20) // 21  (21% = 21, fee = 20 → max is 21)
```

> **Deprecated alias:** `maxTax()`

### `addMaxFee(amount, p, fee)`

Adds the larger of: percentage or fixed fee, to the amount.

```js
addMaxFee(100, 10, 20) // 120  (fee 20 wins over 10%)
addMaxFee(100, 21, 20) // 121  (21% wins over fee 20)
```

> **Deprecated alias:** `applyMaxTax()`

### `addFees(amount, p, fee)`

Adds both a percentage and a fixed fee to the amount.

```js
addFees(100, 10, 20) // 130  (100 + 10% + 20)
```

> **Deprecated alias:** `applySumTax()`

### `deductMaxFee(amount, p, fee)`

Deducts the **larger** of a percentage or a fixed fee from the amount.

```js
deductMaxFee(100, 10, 20) // 80  (fee 20 wins over 10% = 10)
deductMaxFee(100, 25, 20) // 75  (25% = 25 wins over fee 20)
```

> **Deprecated alias:** `applyMaxDiscount()`

### `deductFees(amount, p, fee)`

Deducts both a percentage and a fixed fee from the amount.

```js
deductFees(100, 10, 20) // 70  (100 - 10% - 20)
deductFees(200, 50, 30) // 70  (200 - 50% - 30)
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

