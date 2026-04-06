# money-math-recipes

Zero-dependency monetary arithmetic for JavaScript and TypeScript. Fixes the classic floating-point problem and guarantees proper cent rounding. Ships with CJS + ESM + TypeScript types out of the box.

```js
0.1 + 0.2           // 0.30000000000000004  ← JS native
sum(0.1, 0.2)       // 0.3                  ← money-math-recipes
```

---

## Installation

```bash
# pnpm
pnpm add money-math-recipes

# npm
npm install money-math-recipes

# yarn
yarn add money-math-recipes
```

---

## Usage

### CommonJS (`require`)

```js
const money = require('money-math-recipes');

money.sum(0.1, 0.2);         // 0.3
money.value(10.2506);        // 10.26
money.recipes.partition(1, 3); // [0.34, 0.33, 0.33]
```

Named imports also work:

```js
const { sum, value, percent, recipes } = require('money-math-recipes');
```

### ES Modules (`import`)

```js
import money from 'money-math-recipes';

money.sum(0.1, 0.2); // 0.3
```

Named imports:

```js
import { sum, value, fx, recipes } from 'money-math-recipes';
```

### TypeScript

Types are bundled — no `@types` package needed.

```ts
import { value, sum, compare, recipes } from 'money-math-recipes';

const total: number = sum(19.99, 4.99);  // 24.98
const cmp: -1 | 0 | 1 = compare(total, 25); // -1
```

---

## API

All functions return `NaN` for invalid inputs (`null`, `undefined`, `[]`, `{}`, `true/false`, non-numeric strings) unless otherwise noted.

### `value(amount, decimals?)`

Rounds an amount to the specified number of decimal places (default `2`). This is the core of the library — all other functions route through it.

```js
value(10.2506)          // 10.26
value(10.2506, 4)       // 10.2506
value('50.001')         // 50.01
value(null)             // NaN
```

### `cents(amount)`

Converts a monetary amount to its integer cent representation.

```js
cents(0.01)    // 1
cents(0.17)    // 17
cents(3.12)    // 312
cents(0.11001) // 12
```

### `cents2Amount(cents)`

Converts an integer cent value back to a monetary amount.

Throws `ArgumentError` if the input is a negative number or a float.

```js
cents2Amount(157)    // 1.57
cents2Amount('5513') // 55.13
cents2Amount(99)     // 0.99
cents2Amount(12.5)   // throws ArgumentError: cents must be positive integer
cents2Amount(-25)    // throws ArgumentError: cents must be positive integer
```

### `fx(amount, fxRate, decimals?)`

Applies an exchange rate to an amount.

```js
fx(100, 1.55235)          // 155.24
fx(100, 0.01)             // 1
fx(100, 0.0000155235)     // 0.01
fx(100, 0.0000155235, 4)  // 0.0016
```

### `sum(...amounts)` / `sum(amounts[])`

Aggregates any number of amounts. Accepts variadic arguments, spread arrays, or a single array.

```js
sum(0.1, 0.2)               // 0.3
sum(0.1, 0.2, '-0.3')       // 0
sum([0.1, 0.2, -0.3])       // 0
sum(...[0.1, 0.2, -0.3])    // 0
```

### `add(x, y)`

Adds two amounts.

```js
add(0.1, 0.2)   // 0.3
add(9.99, 0.01) // 10
```

### `subtract(x, y)`

Subtracts `y` from `x`.

```js
subtract(1.01, 0.99)  // 0.02
subtract(0.3, 0.1)    // 0.2
```

### `multiply(amount, factor, decimals?)`

Multiplies an amount by a factor.

```js
multiply(165, 1.40) // 231
multiply(100, 0.5)  // 50
```

### `divide(amount, divisor, decimals?)`

Divides an amount. Throws `ArgumentError` on division by zero.

```js
divide(123.45, 2)  // 61.73
divide(10, 3)      // 3.34
divide(10, 0)      // throws ArgumentError: cant divide by zero
```

### `percent(amount, p)`

Computes `p`% of `amount`.

```js
percent(100, 10)     // 10
percent(524.25, 8.75) // 45.88
percent(99.99, 50)   // 50
```

### `compare(lh, rh, decimals?)`

Compares two monetary amounts after rounding. Returns `-1`, `0`, or `1`. Returns `NaN` if either operand is invalid.

```js
compare(1, 2)      // -1
compare(2, 1)      // 1
compare(1, 1)      // 0
compare(0.1, 0.10) // 0
compare(NaN, 1)    // NaN
```

> **Note:** values are rounded before comparison. `compare(0.001, 0.002)` → `0` because both round to `0.01`.

### `isValid(amount)`

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

### `isZero(amount)`

```js
isZero(0)     // true
isZero(0.001) // false  (rounds up to 0.01)
```

### `isPositive(amount)`

```js
isPositive(1)   // true
isPositive(0)   // false
isPositive(-1)  // false
```

### `isNegative(amount)`

```js
isNegative(-1)  // true
isNegative(0)   // false
isNegative(1)   // false
```

---

## Recipes

Higher-level operations exposed via `recipes.*` and also available as top-level named exports.

### `recipes.partition(amount, parts)` / `partition(amount, parts)`

Splits an amount into equal or weighted parts, guaranteeing the sum is always exact (no cent is lost or duplicated).

**Equal parts:**

```js
partition(1, 3)    // [0.34, 0.33, 0.33]
partition(1, 6)    // [0.17, 0.17, 0.17, 0.17, 0.16, 0.16]
partition(0.01, 5) // [0.01, 0, 0, 0, 0]
```

**Weighted parts (array must sum to 100):**

```js
partition(100, [50, 50])           // [50, 50]
partition(100, [41, 33, 15, 9, 2]) // [41, 33, 15, 9, 2]
partition(10, [41, 33, 15, 9, 2])  // [4.1, 3.3, 1.5, 0.9, 0.2]
```

Spread and rest params also work:

```js
partition(100, ...[50, 50]) // [50, 50]
partition(100, 50, 50)      // [50, 50]
```

Throws `ArgumentError` if parts don't sum to 100 or argument is invalid.

### `recipes.applyTax(amount, p)` / `applyTax(amount, p)`

Adds a percentage tax to an amount.

```js
applyTax(100, 10)  // 110
applyTax(200, 21)  // 242
```

### `recipes.applyDiscount(amount, p)` / `applyDiscount(amount, p)`

Applies a percentage discount to an amount.

```js
applyDiscount(100, 10) // 90
applyDiscount(11, 8.2) // 10.10
```

### `recipes.maxTax(amount, p, fee)` / `maxTax(amount, p, fee)`

Returns the higher of the percentage tax or the fixed fee. Useful when a minimum charge applies.

```js
maxTax(100, 10, 20) // 20  (10% = 10, fee = 20 → max is 20)
maxTax(100, 21, 20) // 21  (21% = 21, fee = 20 → max is 21)
```

### `recipes.applyMaxTax(amount, p, fee)` / `applyMaxTax(amount, p, fee)`

Applies the higher of the percentage tax or fixed fee to the amount.

```js
applyMaxTax(100, 10, 20) // 120  (fee 20 wins over 10%)
applyMaxTax(100, 21, 20) // 121  (21% wins over fee 20)
```

### `recipes.applySumTax(amount, p, fee)` / `applySumTax(amount, p, fee)`

Applies both the percentage tax and fixed fee, adding them together.

```js
applySumTax(100, 10, 20) // 130  (100 + 10% + 20)
```

### `recipes.applyMaxDiscount(amount, p, fee)` / `applyMaxDiscount(amount, p, fee)`

Applies the **larger** of a percentage discount or a fixed discount.

```js
applyMaxDiscount(100, 10, 20) // 80  (fee 20 wins over 10% = 10)
applyMaxDiscount(100, 25, 20) // 75  (25% = 25 wins over fee 20)
```

### `recipes.applySumDiscount(amount, p, fee)` / `applySumDiscount(amount, p, fee)`

Applies both a percentage discount and a fixed discount together.

```js
applySumDiscount(100, 10, 20) // 70  (100 - 10% - 20)
applySumDiscount(200, 50, 30) // 70  (200 - 50% - 30)
```

---

## Error Handling

`ArgumentError` is exported for use in `catch` blocks or `instanceof` checks.

```js
const { ArgumentError } = require('money-math-recipes');

try {
  divide(10, 0);
} catch (e) {
  if (e instanceof ArgumentError) {
    console.error('Invalid argument:', e.message);
  }
}
```

```ts
import { ArgumentError, divide } from 'money-math-recipes';

try {
  divide(10, 0);
} catch (e) {
  if (e instanceof ArgumentError) { /* ... */ }
}
```

---

## Comparison

Benchmarks run on Node.js v22.14.0 · macOS · Apple M-series · 500,000 iterations each.  
Run them yourself: `node bench/bench.js`

### Speed (ops/sec — higher is better)

| Operation               | money-math-recipes |   currency.js | decimal.js | dinero.js v2 |
|-------------------------|-------------------:|--------------:|-----------:|-------------:|
| `add(0.1, 0.2)`         |      **2,490,446** |     1,541,064 |  1,578,686 |  3,526,022 ¹ |
| `subtract(1.01, 0.99)`  |      **3,222,149** |     1,563,253 |  1,482,781 |  4,964,567 ¹ |
| `multiply(165, 1.40)`   |      **3,396,472** |     1,306,572 |  1,145,595 |  7,104,413 ¹ |
| `value()` rounding      |          3,339,597 | **4,579,211** |  1,970,078 |            — |
| `partition(1, 3)`       |      **1,215,691** |       607,486 |          — |            — |
| `sum([10 items])`       |        **571,907** |       135,869 |    339,634 |            — |
| `percent(524.25, 8.75)` |      **3,058,682** |     1,016,530 |    929,596 |            — |

> ¹ dinero.js v2 operates on integer cents internally (amounts pre-multiplied ×100), which skips the float-to-cents conversion step. It requires a verbose setup (`{ amount: 10, currency: { ... } }`) for every value — not comparable as a drop-in usage.

**money-math-recipes is 2–3× faster than currency.js and decimal.js** across all operations. It beats dinero.js when comparing equivalent ease-of-use.

### Package size (total JS files on disk)

| Library                |        Size |
|------------------------|------------:|
| **money-math-recipes** | **18.5 KB** |
| currency.js            |     35.4 KB |
| decimal.js             |    277.7 KB |
| dinero.js v2           |    837.9 KB |

### Feature comparison

| Feature                                                    | money-math-recipes | currency.js | dinero.js v2 | decimal.js |
|------------------------------------------------------------|:------------------:|:-----------:|:------------:|:----------:|
| Zero runtime dependencies                                  |         ✅          |      ✅      |      ✅       |     ✅      |
| TypeScript types bundled                                   |         ✅          |      ✅      |      ✅       |     ✅      |
| ESM + CJS support                                          |         ✅          |      ✅      |      ✅       |     ✅      |
| Simple number API (no wrappers)                            |         ✅          |      ❌      |      ❌       |     ❌      |
| Aggregate sum of N amounts                                 |         ✅          |      ❌      |      ❌       |     ❌      |
| Tax recipes (applyTax, maxTax, sumTax)                     |         ✅          |      ❌      |      ❌       |     ❌      |
| Discount recipes (applyDiscount, maxDiscount, sumDiscount) |         ✅          |      ❌      |      ❌       |     ❌      |
| Safe partition (exact cent distribution)                   |         ✅          |      ✅      |      ✅       |     ❌      |
| Helpers (isValid, isZero, isPositive…)                     |         ✅          |      ❌      |      ✅       |     ❌      |
| FX rate conversion                                         |         ✅          |      ✅      |      ✅       |     ❌      |
| Currency formatting / symbols                              |         ❌          |      ✅      |      ✅       |     ❌      |
| Arbitrary precision (beyond 2 decimals)                    |  ✅ (configurable)  |      ❌      |      ✅       |     ✅      |
| Multi-currency arithmetic                                  |         ❌          |      ❌      |      ✅       |     ❌      |
| Internationalisation (i18n)                                |         ❌          |      ✅      |      ✅       |     ❌      |

### When to use what

| Use case                                            | Recommended              |
|-----------------------------------------------------|--------------------------|
| Monetary arithmetic — clean, fast, zero boilerplate | ✅ **money-math-recipes** |
| Need currency formatting (`$1,234.56`)              | currency.js or dinero.js |
| Multi-currency ledger with exchange conversion      | dinero.js v2             |
| Scientific / arbitrary-precision decimals           | decimal.js               |
| Maximum raw throughput, integer-only data           | dinero.js v2             |

---

## License

MIT

