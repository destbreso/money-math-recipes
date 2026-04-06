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

## License

MIT


## Instalation

```bash
npm -i @one-broker-services/money
```

## How to use

```js
const money = require(`@one-broker-services/money`)

const result = money. ... // for arithmetic
const result = money.recipes. ... // for recipes
```

## Objects

<dl>
<dt><a href="#recipes">recipes</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#value">value(amount, [decimals])</a> ⇒ <code>Number</code></dt>
<dd><p>Compute currency value from Number</p>
</dd>
<dt><a href="#cents">cents(amount)</a> ⇒ <code>Number</code></dt>
<dd><p>Compute cents value from Number</p>
</dd>
<dt><a href="#cents2Amount">cents2Amount(cents)</a> ⇒ <code>Number</code></dt>
<dd><p>Compute currency amount from cents</p>
</dd>
<dt><a href="#fx">fx(amount, fxRate, [decimals])</a> ⇒ <code>Number</code></dt>
<dd><p>Apply fx rate to currency amount</p>
</dd>
<dt><a href="#sum">sum(...amounts)</a> ⇒ <code>Number</code></dt>
<dd><p>Aggregate amounts</p>
</dd>
<dt><a href="#percent">percent(amount, p)</a> ⇒ <code>Number</code></dt>
<dd><p>Compute an amount fraction from a percent value</p>
</dd>
<dt><a href="#subtract">subtract(x, y)</a> ⇒ <code>Number</code></dt>
<dd><p>Difference of two amounts</p>
</dd>
<dt><a href="#add">add(x, y)</a> ⇒ <code>Number</code></dt>
<dd><p>add two amounts</p>
</dd>
<dt><a href="#multiply">multiply(amount, [factor], [decimals])</a> ⇒ <code>Number</code></dt>
<dd><p>Multiply an amount by a factor</p>
</dd>
<dt><a href="#divide">divide(amount, [divisor], [decimals])</a> ⇒ <code>Number</code></dt>
<dd><p>Divide an amount by a divisor</p>
</dd>
</dl>

<a name="recipes"></a>

## recipes : <code>object</code>

**Kind**: global namespace  
**Summary**: Recipes  
**Access**: public  

* [recipes](#recipes) : <code>object</code>
  * [.partition(amount, parts)](#recipes.partition) ⇒ <code>Number</code>
  * [.maxTax(amount, p, fee)](#recipes.maxTax) ⇒ <code>Number</code>
  * [.applyDiscount(amount, p)](#recipes.applyDiscount) ⇒ <code>Number</code>
  * [.applyTax(amount, p)](#recipes.applyTax) ⇒ <code>Number</code>
  * [.applyMaxTax(amount, p, fee)](#recipes.applyMaxTax) ⇒ <code>Number</code>
  * [.applySumTax(amount, p, fee)](#recipes.applySumTax) ⇒ <code>Number</code>

<a name="recipes.partition"></a>

### recipes.partition(amount, parts) ⇒ <code>Number</code>

Compute an amount partition

**Kind**: static method of [<code>recipes</code>](#recipes)  
**Throws**:

* Will throw an error if parts arguments is not a positive integer or is not a partition of 100
* <code>ArgumentError</code> parts must be a positive integer or an array with a partition of 100

| Param  | Type                                                     | Description                                           |
|--------|----------------------------------------------------------|-------------------------------------------------------|
| amount | <code>Number</code> \| <code>String</code>               | numeric value                                         |
| parts  | <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | integer or percent partition (array of percent parts) |

**Example**  

```js
partition(1,2) // [0.5,0.5]
partition(1,3) // [0.34, 0.33, 0.33]
partition(1,11) // [0.1,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09]
partition(1,[50,50]) // [0.5,0.5]
partition(0.01,[41,33,15,9,2]) //[0.01,0,0,0,0]
partition(10,[41,33,15,9,2]) //[4.1,3.3,1.5,0.9,0.2]
partition(100,"qwert") // ArgumentError: parts must be a positive integer or an array with a partition of 100
partition(100,0) // ArgumentError: parts must be a positive integer or an array with a partition of 100
partition(100,[50,49]) // ArgumentError: parts must be a positive integer or an array with a partition of 100
```

<a name="recipes.maxTax"></a>

### recipes.maxTax(amount, p, fee) ⇒ <code>Number</code>

Compute tax to base amount, follow max policy from percent value and fee value

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param  | Type                                       | Description      |
|--------|--------------------------------------------|------------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value    |
| p      | <code>Number</code>                        | porcentual value |
| fee    | <code>Number</code>                        | numeric value    |

<a name="recipes.applyDiscount"></a>

### recipes.applyDiscount(amount, p) ⇒ <code>Number</code>

Apply a percent discount to base amount

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param  | Type                                       | Description      |
|--------|--------------------------------------------|------------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value    |
| p      | <code>Number</code>                        | porcentual value |

<a name="recipes.applyTax"></a>

### recipes.applyTax(amount, p) ⇒ <code>Number</code>

Apply a percent tax to base amount

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param  | Type                                       | Description      |
|--------|--------------------------------------------|------------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value    |
| p      | <code>Number</code>                        | porcentual value |

<a name="recipes.applyMaxTax"></a>

### recipes.applyMaxTax(amount, p, fee) ⇒ <code>Number</code>

Apply tax to base amount, follow max policy from percent value and fee value

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param  | Type                                       | Description      |
|--------|--------------------------------------------|------------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value    |
| p      | <code>Number</code>                        | porcentual value |
| fee    | <code>Number</code>                        | numeric value    |

<a name="recipes.applySumTax"></a>

### recipes.applySumTax(amount, p, fee) ⇒ <code>Number</code>

Apply tax to base amount, follow sum policy from percent value and fee value

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param  | Type                                       | Description      |
|--------|--------------------------------------------|------------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value    |
| p      | <code>Number</code>                        | porcentual value |
| fee    | <code>Number</code>                        | numeric value    |

<a name="value"></a>

## value(amount, [decimals]) ⇒ <code>Number</code>

Compute currency value from Number

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount  
**Access**: public  

| Param      | Type                                       | Default        | Description   |
|------------|--------------------------------------------|----------------|---------------|
| amount     | <code>Number</code> \| <code>String</code> |                | numeric value |
| [decimals] | <code>Number</code>                        | <code>2</code> | integer       |

**Example**  

```js
value(10.253) // 10.26
value('10.990001',4) // 10.9901
value('10.990001') // 11.00
value('abcd') // NaN
value(null|undefined|any[]|object) // NaN
```

<a name="cents"></a>

## cents(amount) ⇒ <code>Number</code>

Compute cents value from Number

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value in cents of amount  
**Access**: public  

| Param  | Type                                       | Description   |
|--------|--------------------------------------------|---------------|
| amount | <code>Number</code> \| <code>String</code> | numeric value |

**Example**  

```js
cents(0.01) // 1
cents(0.17) // 17
cents('3.12') // 312
cents(0.11001) // 12
cents('abcd') // NaN
cents(null|undefined|any[]|object) // NaN
```

<a name="cents2Amount"></a>

## cents2Amount(cents) ⇒ <code>Number</code>

Compute currency amount from cents

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of cents  
**Throws**:

* Will throw an error if the argument is negative or not integer.
* <code>ArgumentError</code> cents must be positive integer

**Access**: public  

| Param | Type                                       | Description                      |
|-------|--------------------------------------------|----------------------------------|
| cents | <code>Number</code> \| <code>String</code> | numeric value (positive integer) |

**Example**  

```js
cents2Amount(157) // 1.57
cents2Amount('5513') // 55.13
cents2Amount(157) // 1.57
cents2Amount('abcd') // NaN
cents2Amount(null|undefined|any[]|object) // NaN
cents2Amount(12.5) // ArgumentError: cents must be positive integer
cents2Amount(-25) // ArgumentError: cents must be positive integer
```

<a name="fx"></a>

## fx(amount, fxRate, [decimals]) ⇒ <code>Number</code>

Apply fx rate to currency amount

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount*fxRate  
**Access**: public  

| Param      | Type                                       | Default        | Description   |
|------------|--------------------------------------------|----------------|---------------|
| amount     | <code>Number</code> \| <code>String</code> |                | numeric value |
| fxRate     | <code>Number</code>                        |                | number        |
| [decimals] | <code>Number</code>                        | <code>2</code> | integer       |

**Example**  

```js
fx(100, 1.55235) // 155.24
fx('100', 0.01) // 1
fx(100, 0.0000155235) // 0.01
fx(100, 0.0000155235,4) // 0.0016
```

<a name="sum"></a>

## sum(...amounts) ⇒ <code>Number</code>

Aggregate amounts

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of total amount  
**Access**: public  

| Param      | Type                                                                                                                 | Description    |
|------------|----------------------------------------------------------------------------------------------------------------------|----------------|
| ...amounts | <code>Number</code> \| <code>String</code> \| <code>Array.&lt;Number&gt;</code> \| <code>Array.&lt;String&gt;</code> | numeric values |

**Example**  

```js
sum(0.1,0.2) // 0.3
sum(0.1,0.2,'-0.3') // 0
sum([0.1,0.2,-0.3]) // 0
sum(...['0.1','0.2','-0.3']) // 0
sum('abcd','{a: 1}') // NaN
```

<a name="percent"></a>

## percent(amount, p) ⇒ <code>Number</code>

Compute an amount fraction from a percent value

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount*p/100  
**Access**: public  

| Param  | Type                | Description       |
|--------|---------------------|-------------------|
| amount | <code>Number</code> | base amount value |
| p      | <code>Number</code> | percent value     |

<a name="subtract"></a>

## subtract(x, y) ⇒ <code>Number</code>

Difference of two amounts

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount1 - amount2  

| Param | Type                | Description |
|-------|---------------------|-------------|
| x     | <code>Number</code> | amount1     |
| y     | <code>Number</code> | amount2     |

**Example**  

```js
subtract(1.01, 0.99) // 0.02
subtract(23.42, 19.13) // 4.29
```

<a name="add"></a>

## add(x, y) ⇒ <code>Number</code>

add two amounts

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount1 + amount2  

| Param | Type                | Description |
|-------|---------------------|-------------|
| x     | <code>Number</code> | amount1     |
| y     | <code>Number</code> | amount2     |

**Example**  

```js
add(0.1, 0.2) // 0.03
```

<a name="multiply"></a>

## multiply(amount, [factor], [decimals]) ⇒ <code>Number</code>

Multiply an amount by a factor

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount*factor  

| Param      | Type                                       | Default        | Description   |
|------------|--------------------------------------------|----------------|---------------|
| amount     | <code>Number</code> \| <code>String</code> |                | numeric value |
| [factor]   | <code>Number</code>                        | <code>1</code> | integer       |
| [decimals] | <code>Number</code>                        | <code>2</code> | integer       |

**Example**  

```js
fx(100, 1.55235) // 155.24
fx('100', 0.01) // 1
fx(100, 0.0000155235) // 0.01
fx(100, 0.0000155235,4) // 0.0016
```

<a name="divide"></a>

## divide(amount, [divisor], [decimals]) ⇒ <code>Number</code>

Divide an amount by a divisor

**Kind**: global function  
**Returns**: <code>Number</code> - Monetary value of amount/factor  
**Throws**:

* Will throw an error if the divisor is zero.
* <code>ArgumentError</code> cant divide by zero

| Param      | Type                                       | Default        | Description   |
|------------|--------------------------------------------|----------------|---------------|
| amount     | <code>Number</code> \| <code>String</code> |                | numeric value |
| [divisor]  | <code>Number</code>                        | <code>1</code> | integer       |
| [decimals] | <code>Number</code>                        | <code>2</code> | integer       |

**Example**  

```js
divide(123.451, 1) // 123.46
divide(123.45 , 2) // 61.73
divide(123.451 , 2) // 61.73
divide('123.451' , 2) // 61.73
divide(10 , 0) // ArgumentError: cant divide by zero
divide('abcd' , 2) // NaN
divide(null|undefined|any[]|object , 1) // NaN
```

## Tests

```bash
npm run test
```
