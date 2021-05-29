# Description

A simple and tiny library with no dependencies for monetary operations.
Solves javascript rounding problems and guarantees proper rounding to cents.

## Instalation

```bash
npm -i @one-broker-services/money
```

## Use

```js
const money = require(`@one-broker-services/money`)

const value = money.value(10.000001)
console.log(value) // prints 10.01
```

## Methods

* `value`: return currency value (cents rounding by default)
* `sum, add`: aggregate amounts (cents rounding)
* `fx`: convert currency (cents rounding by default)
* `percent`: compute a percent from an amount

* `subtract`: subtract two amounts,
* `multiply`: multiply an amount by a factor
* `divide`: divide an amount by a factor
* `applyDiscount`: apply a percent discount to base amount
* `maxTax`:compute tax from base amount, follow max policy from percent value and fee value
* `applyTax`:apply a percent tax to base amount
* `applyMaxTax`: apply tax to base amount, follow max policy from percent value and fee value
* `applySumTax`: apply tax to base amount, follow sum policy from percent value and fee value

# Quick Examples

```js
const money = require(`@one-broker-services/money`)

money.value(0.0000001) // 0.01
money.sum(9.999, 0.001) // 10
money.sum(9.999, 0.01) // 10.01
money.subtract(1.01, 0.99) // 0.02
money.multiply(165, 1.40) // 231
money.divide(123.45, 2) // 61.73
money.percent(100, 50.000001452) // 50.01
money.percent(999.99, 50) // 500
money.maxTax(100, 10, 20.021) // 20.03
money.applyDiscount(100, 10) // 90
money.applyTax(100, 10) // 110
money.applyMaxTax(100, 10, 20) // 120
money.applySumTax(100, 10, 20) // 130
```

# Tests

```bash
npm run test
```
