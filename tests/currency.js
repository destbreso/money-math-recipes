/* eslint-disable no-underscore-dangle */
const { expect } = require('chai');
const {
  value,
  cents,
  cents2Amount,
  sum,
  subtract,
  multiply,
  divide,
  percent,
  maxTax,
  applyTax,
  applyMaxTax,
  applySumTax,
  applyDiscount,
  recipes
} = require('../index');

const testValue = (amount, expected,decimals=2) => {
  it(`$${amount} with ${decimals} decimals is ${expected}`, () => { expect(value(amount,decimals)).to.eql(expected); });
  if(amount !== 0) it(`$${-amount} with ${decimals} decimals is ${-expected}`, () => { expect(value(-amount,decimals)).to.eql(-expected); });
}

describe('#money', () => {
  describe('#value: borderline values', () => {
    it('NaN amount is NaN', () => { expect(value(NaN)).to.eql(NaN); });
    it('string (not numeric) amount is NaN', () => { expect(value('a123b')).to.eql(NaN); });
    it('string (numeric) amount is valid', () => { expect(value('50.001')).to.eql(50.01); });
    it('undefined amount is NaN', () => { expect(value(undefined)).to.eql(NaN); });
    it('null amount is NaN', () => { expect(value(null)).to.eql(NaN); });
    it('false amount is NaN', () => { expect(value(false)).to.eql(NaN); });
    it('true amount is NaN', () => { expect(value(true)).to.eql(NaN); });
    it('array amount is NaN', () => { expect(value([1,2,3])).to.eql(NaN); });
    it('object amount is NaN', () => { expect(value({a:1,b:2,c:3})).to.eql(NaN); });
  });

  // describe('arithmetic', () => {
  //   testValue(value(0.991),sum(0.991,0))
  //   testValue(value(-0.991),sum(-0.991,0))
  // })

  describe('#value', () => {
    testValue(0,0)
    testValue(1,1)
    testValue(0.99,0.99)
    testValue(0.990,0.99)
    testValue(0.991,1)
    testValue(0.999,1)
    testValue(0.0000001,0.01)
    testValue(0.0000001,0.001,3)
    testValue(0.0000005,0.01)
    testValue(0.0000009,0.00001,5)
    testValue(0.10010509,1,0)
    testValue(0.10010509,0.2,1)
    testValue(0.10010509,0.11)
    testValue(0.10010509,0.101,3)
    testValue(0.10010509,0.1002,4)
    testValue(0.10010509,0.10011,5)
    testValue(0.10010509,0.100106,6)
    testValue(0.10010509,0.1001051,7)
    testValue(0.10010509,0.10010509,8)
    testValue(0.10010509,0.10010509,9)
    testValue(0.011,0.02)
    testValue(0.011,0.011,3)
    testValue(0.015,0.02)
    testValue(0.101,0.11)
    testValue(0.101,0.101,3)
    testValue(0.105,0.11)
    testValue(0.105,0.105,3)
    testValue(0.0101,0.02)
    testValue(0.0101,0.011,3)
    testValue(0.0101,0.0101,4)
    testValue(0.0105,0.02)
    testValue(0.0105,0.011,3)
    testValue(0.0105,0.0105,4)
    testValue(0.1001,0.11)
    testValue(0.1001,0.101,3)
    testValue(0.1001,0.1001,4)
    testValue(0.1005,0.11)
    testValue(0.1005,0.101,3)
    testValue(0.1005,0.1005,4)

    testValue(10.990001,11,2)
  });
  describe('#cents', () => {
    it('0.01 is 1 cents', () => { expect(cents(0.01)).to.eql(1); });
    it('0.17 is 17 cents', () => { expect(cents(0.17)).to.eql(17); });
    it('3.12 is 312 cents', () => { expect(cents(3.12)).to.eql(312); });
    it('0.11001 is 12 cents', () => { expect(cents(0.11001)).to.eql(12); });
  });
  describe('#cents2Amount', () => {
    it('157 cents are 1.57', () => { expect(cents2Amount(157)).to.eql(1.57); });
  });
  describe('#sum', () => {
    it('0.1 + 0.2 = 0.3', () => { expect(sum(0.1, 0.2)).to.eql(0.3); });
    it('0 + 0.001 = 0.01', () => { expect(sum(0.00, 0.001)).to.eql(0.01); });
    it('0 + 0.615 = 0.62', () => { expect(sum(0.00, 0.615)).to.eql(0.62); });
    it('9.99 + 0.01 = 10.00', () => { expect(sum(9.99, 0.01)).to.eql(10.00); });
    it('9.999 + 0.001 = 10.00', () => { expect(sum(9.999, 0.001)).to.eql(10.00); });
    it('9.999 + 0.01 = 10.01', () => { expect(sum(9.999, 0.01)).to.eql(10.01); });
    it('7.89 + 1.23 + 4.56 = 13.58 *composed way', () => { expect(sum(sum(7.89, 1.23), 4.56)).to.eql(13.68); });
    it('7.89 + 1.23 + 4.56 = 13.58 *clear way', () => { expect(sum(7.89, 1.23,4.56)).to.eql(13.68); });
    it('0.1 + 0.2 - 0.3 = 0', () => { expect(sum(0.1, 0.2, -0.3)).to.eql(0); });
    it('0.1 + 0.2 - 0.3 = 0 *array way', () => { expect(sum([0.1, 0.2, -0.3])).to.eql(0); });
    it('0.1 + 0.2 - 0.3 = 0 *array spread way', () => { expect(sum(...[0.1, 0.2, -0.3])).to.eql(0); });
  });
  describe('RECIPES',()=>{
    describe('#partition', () => {
      it('1 in 1 parts is [1.00]', () => { expect(recipes.partition(1,1)).to.eql([1.00]); });
      it('1 in 2 parts is [0.5, 0.5]', () => { expect(recipes.partition(1,2)).to.eql([0.5, 0.5]); });
      it('1 in 3 parts is [0.34, 0.33, 0.33]', () => { expect(recipes.partition(1,3)).to.eql([0.34, 0.33, 0.33]); });
      it('1 in 4 parts is [0.25, 0.25, 0.25, 0.25]', () => { expect(recipes.partition(1,4)).to.eql([0.25, 0.25, 0.25, 0.25]); });
      it('1 in 5 parts is [0.2, 0.2, 0.2, 0.2, 0.2]', () => { expect(recipes.partition(1,5)).to.eql([0.2, 0.2, 0.2, 0.2, 0.2]); });
      it('1 in 6 parts is [0.17, 0.17, 0.17, 0.17, 0.16, 0.16]', () => { expect(recipes.partition(1,6)).to.eql([0.17, 0.17, 0.17, 0.17, 0.16, 0.16]); });
      it('1 in 7 parts is [0.15,0.15,0.14,0.14,0.14,0.14,0.14]', () => { expect(recipes.partition(1,7)).to.eql([0.15,0.15,0.14,0.14,0.14,0.14,0.14]); });
      it('1 in 8 parts is [0.13,0.13,0.13,0.13,0.12,0.12,0.12,0.12]', () => { expect(recipes.partition(1,8)).to.eql([0.13,0.13,0.13,0.13,0.12,0.12,0.12,0.12]); });
      it('1 in 9 parts is [0.12,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11]', () => { expect(recipes.partition(1,9)).to.eql([0.12,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11]); });
      it('1 in 10 parts is [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]', () => { expect(recipes.partition(1,10)).to.eql([0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]); });
      it('1 in 11 parts is [0.1,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09]', () => { expect(recipes.partition(1,11)).to.eql([0.1,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09]); });

      it('0.11 in 5 parts is [0.03,0.02,0.02,0.02,0.02]', () => { expect(recipes.partition(0.11,5)).to.eql([0.03,0.02,0.02,0.02,0.02]); });
      it('0.11 in 9 parts is [0.02,0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01]', () => { expect(recipes.partition(0.11,9)).to.eql([0.02,0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01]); });
      it('0.11 in 10 parts is [0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]', () => { expect(recipes.partition(0.11,10)).to.eql([0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]); });
      it('0.11 in 11 parts is [0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]', () => { expect(recipes.partition(0.11,11)).to.eql([0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]); });
      it('0.11 in 12 parts is [0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0]', () => { expect(recipes.partition(0.11,12)).to.eql([0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0]); });

      it('0.01 in 1 parts is [0.01]', () => { expect(recipes.partition(0.01,1)).to.eql([0.01]); });
      it('0.01 in 5 parts is [0.01,0,0,0,0]', () => { expect(recipes.partition(0.01,5)).to.eql([0.01,0,0,0,0]); });

      it('0.01 as [50%,50%] is [0.01,0]', () => { expect(recipes.partition(0.01,[50,50])).to.eql([0.01,0]); });
      it('0.01 as [99%,1%] is [0.01,0]', () => { expect(recipes.partition(0.01,[99,1])).to.eql([0.01,0]); });
      it('0.01 as [41%,33%,15%,9%,2%] is [0.01,0,0,0,0]', () => { expect(recipes.partition(0.01,[41,33,15,9,2])).to.eql([0.01,0,0,0,0]); });

      it('0.1 as [50%,50%] is [0.05,0.05]', () => { expect(recipes.partition(0.1,[50,50])).to.eql([0.05,0.05]); });
      it('0.1 as [99%,1%] is [0.1,0]', () => { expect(recipes.partition(0.1,[99,1])).to.eql([0.1,0]); });
      it('0.1 as [41%,33%,15%,9%,2%] is [0.05,0.04,0.01,0,0]', () => { expect(recipes.partition(0.1,[41,33,15,9,2])).to.eql([0.05,0.04,0.01,0,0]); });

      it('1 as [50%,50%] is [0.5,0.5]', () => { expect(recipes.partition(1,[50,50])).to.eql([0.5,0.5]); });
      it('1 as [99%,1%] is [0.99,0.01]', () => { expect(recipes.partition(1,[99,1])).to.eql([0.99,0.01]); });
      it('1 as [41%,33%,15%,9%,2%] is [0.41,0.33,0.15,0.09,0.02]', () => { expect(recipes.partition(1,[41,33,15,9,2])).to.eql([0.41,0.33,0.15,0.09,0.02]); });

      it('10 as [50%,50%] is [5,5]', () => { expect(recipes.partition(10,[50,50])).to.eql([5,5]); });
      it('10 as [99%,1%] is [9.9,0.1]', () => { expect(recipes.partition(10,[99,1])).to.eql([9.9,0.1]); });
      it('10 as [41%,33%,15%,9%,2%] is [4.1,3.3,1.5,0.9,0.2]', () => { expect(recipes.partition(10,[41,33,15,9,2])).to.eql([4.1,3.3,1.5,0.9,0.2]); });

      it('100 as [50%,50%] is [50,50]', () => { expect(recipes.partition(100,[50,50])).to.eql([50,50]); });
      it('100 as [99%,1%] is [99,1]', () => { expect(recipes.partition(100,[99,1])).to.eql([99,1]); });
      it('100 as [41%,33%,15%,9%,2%] is [41,33,15,9,2]', () => { expect(recipes.partition(100,[41,33,15,9,2])).to.eql([41,33,15,9,2]); });


      it('100 as [33%,41%,9%,2%,15%] is [33,41,9,2,15]', () => { expect(recipes.partition(100,[33,41,9,2,15])).to.eql([33,41,9,2,15]); });
    });
    describe('#subtract', () => {
      it('1.01 - 0.99 = 0.02', () => { expect(subtract(1.01, 0.99)).to.eql(0.02); });
      it('23.42 - 19.13 = 4.29', () => { expect(subtract(23.42, 19.13)).to.eql(4.29); });
    });
    describe('#multiply', () => {
      it('165 * 1.40 = 231', () => { expect(multiply(165, 1.40)).to.eql(231); });
    });
    describe('#divide', () => {
      it('123.45 / 1 = 123.45 ', () => { expect(divide(123.45, 1)).to.eql(123.45); });
      it('123.451 / 1 = 123.46 ', () => { expect(divide(123.451, 1)).to.eql(123.46); });
      it('123.45 / 2 = 61.73 ', () => { expect(divide(123.45, 2)).to.eql(61.73); });
      it('123.451 / 2 = 61.73 ', () => { expect(divide(123.451, 2)).to.eql(61.73); });
    });
    describe('#percent', () => {
      it('0% of 100 is 0', () => { expect(percent(100, 0)).to.eql(0); });
      it('100% of 100 is 100', () => { expect(percent(100, 100)).to.eql(100); });
      it('50.000001452% of 100 is 50.01', () => { expect(percent(100, 50.000001452)).to.eql(50.01); });
      it('50.568% of 100 is 50.57', () => { expect(percent(100, 50.568)).to.eql(50.57); });
      it('50% of 999.99 is 500', () => { expect(percent(999.99, 50)).to.eql(500); });
      it('8.75% of 524.25 is 45.92', () => { expect(percent(524.25, 8.75)).to.eql(45.88); });
      it('8.76% of 100 is 8.76', () => { expect(percent(100, 8.76)).to.eql(8.76); });
      it('8.76% of 99.99 is 8.76', () => { expect(percent(99.99, 8.76)).to.eql(8.76); });
      it('8.76% of 99 is 8.68', () => { expect(percent(99, 8.76)).to.eql(8.68); });
      it('8.76% of 200 is 17.52', () => { expect(percent(200, 8.76)).to.eql(17.52); });
      it('8.75% of 20 is 1.75', () => { expect(percent(20, 8.75)).to.eql(1.75); });
    });
    describe('#maxTax', () => {
      it('100 maxTax 0% or 0.01 is 0.01 ', () => { expect(maxTax(100, 0, 0.01)).to.eql(0.01); });
      it('100 maxTax 100% or 99.99 is 99.99 ', () => { expect(maxTax(100, 100, 99.99)).to.eql(100); });
      it('100 maxTax 10% or 20 is 20 ', () => { expect(maxTax(100, 10, 20)).to.eql(20); });
      it('100 maxTax 10% or 20.0001 is 20.01 ', () => { expect(maxTax(100, 10, 20.0001)).to.eql(20.01); });
      it('100 maxTax 10% or 20.021 is 20.03 ', () => { expect(maxTax(100, 10, 20.021)).to.eql(20.03); });
      it('100 maxTax 21% or 20 is 21 ', () => { expect(maxTax(100, 21, 20)).to.eql(21); });
      it('100 maxTax 21.875% or 20 is 21 ', () => { expect(maxTax(100, 21.875, 20)).to.eql(21.88); });
      it('524.25 maxTax 8.75% or 45 is 50 ', () => { expect(maxTax(524.25, 8.75, 45)).to.eql(45.88); });
      it('524.25 maxTax 8.75% or 50 is 50 ', () => { expect(maxTax(524.25, 8.75, 50)).to.eql(50); });
    });
    describe('#applyDiscount', () => {
      it('100 apply discount 10% is 90', () => { expect(applyDiscount(100, 10)).to.eql(90); });
      it('11 apply discount 8.2% is 10.10', () => { expect(applyDiscount(11, 8.2)).to.eql(10.10); });
  
    });
    describe('#appyTax', () => {
      it('100 apply maxTax 10% is 110 ', () => { expect(applyTax(100, 10)).to.eql(110); });
    });
    describe('#applyMaxTax', () => {
      it('100 apply maxTax 10% or 20 is 120 ', () => { expect(applyMaxTax(100, 10, 20)).to.eql(120); });
    });
    describe('#appllySumTax', () => {
      it('100 apply sumTax 10% or 20 is 130 ', () => { expect(applySumTax(100, 10, 20)).to.eql(130); });
    });
  })
  
});
