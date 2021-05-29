/* eslint-disable no-underscore-dangle */
const { expect } = require('chai');
const {
  value,
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
});
