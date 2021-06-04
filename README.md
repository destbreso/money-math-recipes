# Description

A simple and tiny library with no dependencies for monetary arithmetic. Solves javascript rounding problems and guarantees proper rounding to cents.

Recipes for useful operations included.

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
<dt><a href="#add">add(...amounts)</a> ⇒ <code>Number</code></dt>
<dd><p>Aggregate amounts</p>
</dd>
<dt><del><a href="#sum">sum(...amounts)</a> ⇒ <code>Number</code></del></dt>
<dd><p>Aggregate amounts</p>
</dd>
<dt><a href="#percent">percent(amount, p)</a> ⇒ <code>Number</code></dt>
<dd><p>Compute an amount fraction from a percent value</p>
</dd>
</dl>

<a name="recipes"></a>

## recipes : <code>object</code>

**Kind**: global namespace  
**Summary**: Recipes  
**Access**: public  

* [recipes](#recipes) : <code>object</code>
  * ~~[.subtract(x, y)](#recipes.subtract) ⇒ <code>Number</code>~~
  * ~~[.multiply(amount, [factor], [decimals])](#recipes.multiply) ⇒ <code>Number</code>~~
  * ~~[.divide(amount, [divisor], [decimals])](#recipes.divide) ⇒ <code>Number</code>~~
  * [.partition(amount, parts)](#recipes.partition) ⇒ <code>Number</code>
  * [.maxTax(amount, p, fee)](#recipes.maxTax) ⇒ <code>Number</code>
  * [.applyDiscount(amount, p)](#recipes.applyDiscount) ⇒ <code>Number</code>
  * [.applyTax(amount, p)](#recipes.applyTax) ⇒ <code>Number</code>
  * [.applyMaxTax(amount, p, fee)](#recipes.applyMaxTax) ⇒ <code>Number</code>
  * [.applySumTax(amount, p, fee)](#recipes.applySumTax) ⇒ <code>Number</code>

<a name="recipes.subtract"></a>

### ~~recipes.subtract(x, y) ⇒ <code>Number</code>~~

***Deprecated***

difference of two amounts

**Kind**: static method of [<code>recipes</code>](#recipes)  
**Returns**: <code>Number</code> - difference of amount1 and amount2  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>Number</code> | amount1 |
| y | <code>Number</code> | amount2 |

**Example**  

```js
subtract(1.01, 0.99) // 0.02
subtract(23.42, 19.13) // 4.29
```

<a name="recipes.multiply"></a>

### ~~recipes.multiply(amount, [factor], [decimals]) ⇒ <code>Number</code>~~

***Deprecated***

Multiply an amount by a factor

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| [factor] | <code>Number</code> | integer |
| [decimals] | <code>Number</code> | integer |

**Example**  

```js
fx(100, 1.55235) // 155.24
fx('100', 0.01) // 1
fx(100, 0.0000155235) // 0.01
fx(100, 0.0000155235,4) // 0.0016
```

<a name="recipes.divide"></a>

### ~~recipes.divide(amount, [divisor], [decimals]) ⇒ <code>Number</code>~~

***Deprecated***

Divide an amount by a divisor

**Kind**: static method of [<code>recipes</code>](#recipes)  
**Throws**:

* Will throw an error if the divisor is zero.
* <code>ArgumentError</code> cant divide by zero

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| [divisor] | <code>Number</code> | integer |
| [decimals] | <code>Number</code> | integer |

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

<a name="recipes.partition"></a>

### recipes.partition(amount, parts) ⇒ <code>Number</code>

Compute an amount partition

**Kind**: static method of [<code>recipes</code>](#recipes)  
**Throws**:

* Will throw an error if parts arguments is not a positive integer or is not a partition of 100
* <code>ArgumentError</code> parts must be a positive integer or an array with a partition of 100

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| parts | <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | integer or percent partition (array of percent parts) |

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

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| p | <code>Number</code> | porcentual value |
| fee | <code>Number</code> | numeric value |

<a name="recipes.applyDiscount"></a>

### recipes.applyDiscount(amount, p) ⇒ <code>Number</code>

Apply a percent discount to base amount

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| p | <code>Number</code> | porcentual value |

<a name="recipes.applyTax"></a>

### recipes.applyTax(amount, p) ⇒ <code>Number</code>

Apply a percent tax to base amount

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| p | <code>Number</code> | porcentual value |

<a name="recipes.applyMaxTax"></a>

### recipes.applyMaxTax(amount, p, fee) ⇒ <code>Number</code>

Apply tax to base amount, follow max policy from percent value and fee value

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| p | <code>Number</code> | porcentual value |
| fee | <code>Number</code> | numeric value |

<a name="recipes.applySumTax"></a>

### recipes.applySumTax(amount, p, fee) ⇒ <code>Number</code>

Apply tax to base amount, follow sum policy from percent value and fee value

**Kind**: static method of [<code>recipes</code>](#recipes)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> | numeric value |
| p | <code>Number</code> | porcentual value |
| fee | <code>Number</code> | numeric value |

<a name="value"></a>

## value(amount, [decimals]) ⇒ <code>Number</code>

Compute currency value from Number

**Kind**: global function  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> |  | numeric value |
| [decimals] | <code>Number</code> | <code>2</code> | integer |

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
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
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
**Throws**:

* Will throw an error if the argument is negative or not integer.
* <code>ArgumentError</code> cents must be positive integer

**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
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
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| amount | <code>Number</code> \| <code>String</code> |  | numeric value |
| fxRate | <code>Number</code> |  | number |
| [decimals] | <code>Number</code> | <code>2</code> | integer |

**Example**  

```js
fx(100, 1.55235) // 155.24
fx('100', 0.01) // 1
fx(100, 0.0000155235) // 0.01
fx(100, 0.0000155235,4) // 0.0016
```

<a name="add"></a>

## add(...amounts) ⇒ <code>Number</code>

Aggregate amounts

**Kind**: global function  
**Returns**: <code>Number</code> - total amount  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...amounts | <code>Number</code> \| <code>String</code> \| <code>Array.&lt;Number&gt;</code> \| <code>Array.&lt;String&gt;</code> | numeric values |

**Example**  

```js
add(0.1,0.2) // 0.3
add(0.1,0.2,'-0.3') // 0
add([0.1,0.2,-0.3]) // 0
add(...['0.1','0.2','-0.3']) // 0
add('abcd','{a: 1}') // NaN
```

<a name="sum"></a>

## ~~sum(...amounts) ⇒ <code>Number</code>~~

***Deprecated***

Aggregate amounts

**Kind**: global function  
**Returns**: <code>Number</code> - total amount  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...amounts | <code>Number</code> \| <code>String</code> \| <code>Array.&lt;Number&gt;</code> \| <code>Array.&lt;String&gt;</code> | numeric values |

**Example**  

```js
add(0.1,0.2) // 0.3
add(0.1,0.2,'-0.3') // 0
add([0.1,0.2,-0.3]) // 0
add(...['0.1','0.2','-0.3']) // 0
add('abcd','{a: 1}') // NaN
```

<a name="percent"></a>

## percent(amount, p) ⇒ <code>Number</code>

Compute an amount fraction from a percent value

**Kind**: global function  
**Returns**: <code>Number</code> - amount fraction  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Number</code> | base amount value |
| p | <code>Number</code> | percent value |

## Tests

```bash
npm run test
```
