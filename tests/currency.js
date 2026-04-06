"use strict";

const {
  value,
  cents,
  cents2Amount,
  sum,
  fx,
  add,
  subtract,
  multiply,
  divide,
  percent,
  compare,
  isValid,
  isZero,
  isPositive,
  isNegative,
  maxTax,
  applyTax,
  applyMaxTax,
  applySumTax,
  applyDiscount,
  applyMaxDiscount,
  applySumDiscount,
  abs,
  min,
  max,
  equal,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  recipes,
} = require("../index");

const testValue = (amount, expected, decimals = 2) => {
  it(`$${amount} with ${decimals} decimals is ${expected}`, () => {
    expect(value(amount, decimals)).toEqual(expected);
  });
  if (amount !== 0)
    it(`$${-amount} with ${decimals} decimals is ${-expected}`, () => {
      expect(value(-amount, decimals)).toEqual(-expected);
    });
};

describe("#money", () => {
  describe("#value: borderline values", () => {
    it("NaN amount is NaN", () => {
      expect(value(NaN)).toEqual(NaN);
    });
    it("string (not numeric) amount is NaN", () => {
      expect(value("a123b")).toEqual(NaN);
    });
    it("string (numeric) amount is valid", () => {
      expect(value("50.001")).toEqual(50.01);
    });
    it("undefined amount is NaN", () => {
      expect(value(undefined)).toEqual(NaN);
    });
    it("null amount is NaN", () => {
      expect(value(null)).toEqual(NaN);
    });
    it("false amount is NaN", () => {
      expect(value(false)).toEqual(NaN);
    });
    it("true amount is NaN", () => {
      expect(value(true)).toEqual(NaN);
    });
    it("array amount is NaN", () => {
      expect(value([1, 2, 3])).toEqual(NaN);
    });
    it("object amount is NaN", () => {
      expect(value({ a: 1, b: 2, c: 3 })).toEqual(NaN);
    });
  });

  // describe('arithmetic', () => {
  //   testValue(value(0.991),add(0.991,0))
  //   testValue(value(-0.991),add(-0.991,0))
  // })

  describe("#value", () => {
    testValue(0, 0);
    testValue(1, 1);
    testValue(0.99, 0.99);
    testValue(0.99, 0.99);
    testValue(0.991, 1);
    testValue(0.999, 1);
    testValue(0.0000001, 0.01);
    testValue(0.0000001, 0.001, 3);
    testValue(0.0000005, 0.01);
    testValue(0.0000009, 0.00001, 5);
    testValue(0.10010509, 1, 0);
    testValue(0.10010509, 0.2, 1);
    testValue(0.10010509, 0.11);
    testValue(0.10010509, 0.101, 3);
    testValue(0.10010509, 0.1002, 4);
    testValue(0.10010509, 0.10011, 5);
    testValue(0.10010509, 0.100106, 6);
    testValue(0.10010509, 0.1001051, 7);
    testValue(0.10010509, 0.10010509, 8);
    testValue(0.10010509, 0.10010509, 9);
    testValue(0.011, 0.02);
    testValue(0.011, 0.011, 3);
    testValue(0.015, 0.02);
    testValue(0.101, 0.11);
    testValue(0.101, 0.101, 3);
    testValue(0.105, 0.11);
    testValue(0.105, 0.105, 3);
    testValue(0.0101, 0.02);
    testValue(0.0101, 0.011, 3);
    testValue(0.0101, 0.0101, 4);
    testValue(0.0105, 0.02);
    testValue(0.0105, 0.011, 3);
    testValue(0.0105, 0.0105, 4);
    testValue(0.1001, 0.11);
    testValue(0.1001, 0.101, 3);
    testValue(0.1001, 0.1001, 4);
    testValue(0.1005, 0.11);
    testValue(0.1005, 0.101, 3);
    testValue(0.1005, 0.1005, 4);

    testValue(10.990001, 11, 2);
  });
  describe("#cents", () => {
    it("0.01 is 1 cents", () => {
      expect(cents(0.01)).toEqual(1);
    });
    it("0.17 is 17 cents", () => {
      expect(cents(0.17)).toEqual(17);
    });
    it("3.12 is 312 cents", () => {
      expect(cents(3.12)).toEqual(312);
    });
    it("0.11001 is 12 cents", () => {
      expect(cents(0.11001)).toEqual(12);
    });
  });
  describe("#cents2Amount", () => {
    it("157 cents are 1.57", () => {
      expect(cents2Amount(157)).toEqual(1.57);
    });
    it("`5513` cents are 55.13", () => {
      expect(cents2Amount("5513")).toEqual(55.13);
    });
    it("undefined cents are NaN", () => {
      expect(cents2Amount(undefined)).toEqual(NaN);
    });
    it("null cents are NaN", () => {
      expect(cents2Amount(null)).toEqual(NaN);
    });
    it("[Object] cents are NaN", () => {
      expect(cents2Amount({ a: 1 })).toEqual(NaN);
    });
    it("array cents are NaN", () => {
      expect(cents2Amount([1, 2, 3, 4])).toEqual(NaN);
    });
    it("99 cents are 0.99", () => {
      expect(cents2Amount(99)).toEqual(0.99);
    });
    it("1 cents are 1", () => {
      expect(cents2Amount(1)).toEqual(0.01);
    });
    it("0 cents are 0", () => {
      expect(cents2Amount(0)).toEqual(0);
    });
    it("12.5 throws an ArgumentError", () => {
      expect(() => cents2Amount(12.5)).toThrow(
        "cents must be positive integer",
      );
    });
    it("-25 throws an ArgumentError", () => {
      expect(() => cents2Amount(-25)).toThrow("cents must be positive integer");
    });
  });
  describe("#fx", () => {
    it("0 * 0 = 0", () => {
      expect(fx(0, 0)).toEqual(0);
    });
    it("0 * 1 = 0", () => {
      expect(fx(0, 1)).toEqual(0);
    });
    it("1 * 0 = 0", () => {
      expect(fx(1, 0)).toEqual(0);
    });
    it("1 * 1 = 1", () => {
      expect(fx(1, 1)).toEqual(1);
    });
    it("12.2506 * 1 = 12.26", () => {
      expect(fx(12.2506, 1)).toEqual(12.26);
    });
    it("1 * 12.2506 = 12.26", () => {
      expect(fx(1, 12.2506)).toEqual(12.26);
    });
    it("5 * 3 = 15", () => {
      expect(fx(5, 3)).toEqual(15);
    });
    it("100 * 1.55235 = 155.24", () => {
      expect(fx(100, 1.55235)).toEqual(155.24);
    });
    it("100 * 0.01 = 1", () => {
      expect(fx(100, 0.01)).toEqual(1);
    });
    it("100 * 0.0000155235 = 0.01", () => {
      expect(fx("100", 0.0000155235)).toEqual(0.01);
    });
    it("100 * 0.0000155235 = 0.002 (3 decimals)", () => {
      expect(fx(100, 0.0000155235, 3)).toEqual(0.002);
    });
    it("100 * 0.0000155235 = 0.0016 (4 decimals)", () => {
      expect(fx(100, 0.0000155235, 4)).toEqual(0.0016);
    });
  });
  describe("#percent", () => {
    it("0% of 100 is 0", () => {
      expect(percent(100, 0)).toEqual(0);
    });
    it("100% of 100 is 100", () => {
      expect(percent(100, 100)).toEqual(100);
    });
    it("50.000001452% of 100 is 50.01", () => {
      expect(percent(100, 50.000001452)).toEqual(50.01);
    });
    it("50.568% of 100 is 50.57", () => {
      expect(percent(100, 50.568)).toEqual(50.57);
    });
    it("50% of 999.99 is 500", () => {
      expect(percent(999.99, 50)).toEqual(500);
    });
    it("8.75% of 524.25 is 45.92", () => {
      expect(percent(524.25, 8.75)).toEqual(45.88);
    });
    it("8.76% of 100 is 8.76", () => {
      expect(percent(100, 8.76)).toEqual(8.76);
    });
    it("8.76% of 99.99 is 8.76", () => {
      expect(percent(99.99, 8.76)).toEqual(8.76);
    });
    it("8.76% of 99 is 8.68", () => {
      expect(percent(99, 8.76)).toEqual(8.68);
    });
    it("8.76% of 200 is 17.52", () => {
      expect(percent(200, 8.76)).toEqual(17.52);
    });
    it("8.75% of 20 is 1.75", () => {
      expect(percent(20, 8.75)).toEqual(1.75);
    });
  });
  describe("#sum", () => {
    it("0.1 + 0.2 = 0.3", () => {
      expect(sum(0.1, 0.2)).toEqual(0.3);
    });
    it("0 + 0.001 = 0.01", () => {
      expect(sum(0.0, 0.001)).toEqual(0.01);
    });
    it("0 + 0.615 = 0.62", () => {
      expect(sum(0.0, 0.615)).toEqual(0.62);
    });
    it("9.99 + 0.01 = 10.00", () => {
      expect(sum(9.99, 0.01)).toEqual(10.0);
    });
    it("9.999 + 0.001 = 10.00", () => {
      expect(sum(9.999, 0.001)).toEqual(10.0);
    });
    it("9.999 + 0.01 = 10.01", () => {
      expect(sum(9.999, 0.01)).toEqual(10.01);
    });
    it("7.89 + 1.23 + 4.56 = 13.58 *composed way", () => {
      expect(sum(sum(7.89, 1.23), 4.56)).toEqual(13.68);
    });
    it("7.89 + `1.23`+ 4.56 = 13.58 *clear way", () => {
      expect(sum(7.89, "1.23", 4.56)).toEqual(13.68);
    });
    it("0.1 + 0.2 - 0.3 = 0", () => {
      expect(sum("0.1", "0.2", "-0.3")).toEqual(0);
    });
    it("0.1 + 0.2 - 0.3 = 0 *array way", () => {
      expect(sum([0.1, 0.2, -0.3])).toEqual(0);
    });
    it("0.1 + 0.2 - 0.3 = 0 *array spread way", () => {
      expect(sum(...[0.1, 0.2, -0.3])).toEqual(0);
    });
  });

  describe("#add", () => {
    it("0.1 + 0.2 = 0.3", () => {
      expect(add(0.1, 0.2)).toEqual(0.3);
    });
    it("0 + 0.001 = 0.01", () => {
      expect(add(0.0, 0.001)).toEqual(0.01);
    });
    it("0 + 0.615 = 0.62", () => {
      expect(add(0.0, 0.615)).toEqual(0.62);
    });
    it("9.99 + 0.01 = 10.00", () => {
      expect(add(9.99, 0.01)).toEqual(10.0);
    });
    it("9.999 + 0.001 = 10.00", () => {
      expect(add(9.999, 0.001)).toEqual(10.0);
    });
    it("9.999 + 0.01 = 10.01", () => {
      expect(add(9.999, 0.01)).toEqual(10.01);
    });
  });

  describe("#subtract", () => {
    it("1.01 - 0.99 = 0.02", () => {
      expect(subtract(1.01, 0.99)).toEqual(0.02);
    });
    it("23.42 - 19.13 = 4.29", () => {
      expect(subtract(23.42, 19.13)).toEqual(4.29);
    });
    it("0.3 - 0.1 = 0.2", () => {
      expect(subtract(0.3, 0.1)).toEqual(0.2);
    });
    it("10 - 10 = 0", () => {
      expect(subtract(10, 10)).toEqual(0);
    });
    it("0 - 0.01 = -0.01", () => {
      expect(subtract(0, 0.01)).toEqual(-0.01);
    });
  });
  describe("#multiply", () => {
    it("165 * 1.40 = 231", () => {
      expect(multiply(165, 1.4)).toEqual(231);
    });
    it("0 * 5 = 0", () => {
      expect(multiply(0, 5)).toEqual(0);
    });
    it("10 * 0 = 0", () => {
      expect(multiply(10, 0)).toEqual(0);
    });
    it("10.5 * 3 = 31.5", () => {
      expect(multiply(10.5, 3)).toEqual(31.5);
    });
    it("100 * 0.5 = 50", () => {
      expect(multiply(100, 0.5)).toEqual(50);
    });
    it('"abcd" * 2 is NaN', () => {
      expect(multiply("abcd", 2)).toEqual(NaN);
    });
    it("null * 2 is NaN", () => {
      expect(multiply(null, 2)).toEqual(NaN);
    });
  });
  describe("#divide", () => {
    it("123.45 / 1 = 123.45 ", () => {
      expect(divide(123.45, 1)).toEqual(123.45);
    });
    it("123.451 / 1 = 123.46 ", () => {
      expect(divide(123.451, 1)).toEqual(123.46);
    });
    it("123.45 / 2 = 61.73 ", () => {
      expect(divide(123.45, 2)).toEqual(61.73);
    });
    it("123.451 / 2 = 61.73 ", () => {
      expect(divide(123.451, 2)).toEqual(61.73);
    });
    it("0 / 2 = 0", () => {
      expect(divide(0, 2)).toEqual(0);
    });
    it("10 / 3 = 3.34", () => {
      expect(divide(10, 3)).toEqual(3.34);
    });
    it('"10" / 2 = 5', () => {
      expect(divide("10", 2)).toEqual(5);
    });
    it('"abcd" / 2 is NaN', () => {
      expect(divide("abcd", 2)).toEqual(NaN);
    });
    it("10 / 0 throws ArgumentError", () => {
      expect(() => divide(10, 0)).toThrow("cant divide by zero");
    });
  });

  describe("RECIPES", () => {
    describe("#partition", () => {
      it("1 in default parts is [1.00]", () => {
        expect(recipes.partition(1)).toEqual([1.0]);
      });
      it("1 in 1 parts is [1.00]", () => {
        expect(recipes.partition(1, 1)).toEqual([1.0]);
      });
      it("1 in 2 parts is [0.5, 0.5]", () => {
        expect(recipes.partition(1, 2)).toEqual([0.5, 0.5]);
      });
      it("1 in 3 parts is [0.34, 0.33, 0.33]", () => {
        expect(recipes.partition(1, 3)).toEqual([0.34, 0.33, 0.33]);
      });
      it("1 in 4 parts is [0.25, 0.25, 0.25, 0.25]", () => {
        expect(recipes.partition(1, 4)).toEqual([0.25, 0.25, 0.25, 0.25]);
      });
      it("1 in 5 parts is [0.2, 0.2, 0.2, 0.2, 0.2]", () => {
        expect(recipes.partition(1, 5)).toEqual([0.2, 0.2, 0.2, 0.2, 0.2]);
      });
      it("1 in 6 parts is [0.17, 0.17, 0.17, 0.17, 0.16, 0.16]", () => {
        expect(recipes.partition(1, 6)).toEqual([
          0.17, 0.17, 0.17, 0.17, 0.16, 0.16,
        ]);
      });
      it("1 in 7 parts is [0.15,0.15,0.14,0.14,0.14,0.14,0.14]", () => {
        expect(recipes.partition(1, 7)).toEqual([
          0.15, 0.15, 0.14, 0.14, 0.14, 0.14, 0.14,
        ]);
      });
      it("1 in 8 parts is [0.13,0.13,0.13,0.13,0.12,0.12,0.12,0.12]", () => {
        expect(recipes.partition(1, 8)).toEqual([
          0.13, 0.13, 0.13, 0.13, 0.12, 0.12, 0.12, 0.12,
        ]);
      });
      it("1 in 9 parts is [0.12,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11]", () => {
        expect(recipes.partition(1, 9)).toEqual([
          0.12, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11,
        ]);
      });
      it("1 in 10 parts is [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]", () => {
        expect(recipes.partition(1, 10)).toEqual([
          0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
        ]);
      });
      it("1 in 11 parts is [0.1,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09,0.09]", () => {
        expect(recipes.partition(1, 11)).toEqual([
          0.1, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09,
        ]);
      });

      it("0.11 in 5 parts is [0.03,0.02,0.02,0.02,0.02]", () => {
        expect(recipes.partition(0.11, 5)).toEqual([
          0.03, 0.02, 0.02, 0.02, 0.02,
        ]);
      });
      it("0.11 in 9 parts is [0.02,0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01]", () => {
        expect(recipes.partition(0.11, 9)).toEqual([
          0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
        ]);
      });
      it("0.11 in 10 parts is [0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]", () => {
        expect(recipes.partition(0.11, 10)).toEqual([
          0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
        ]);
      });
      it("0.11 in 11 parts is [0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01]", () => {
        expect(recipes.partition(0.11, 11)).toEqual([
          0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
        ]);
      });
      it("0.11 in 12 parts is [0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0]", () => {
        expect(recipes.partition(0.11, 12)).toEqual([
          0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0,
        ]);
      });

      it("0.01 in 1 parts is [0.01]", () => {
        expect(recipes.partition(0.01, 1)).toEqual([0.01]);
      });
      it("0.01 in 5 parts is [0.01,0,0,0,0]", () => {
        expect(recipes.partition(0.01, 5)).toEqual([0.01, 0, 0, 0, 0]);
      });

      it("0.01 as [100%] is [0.01]", () => {
        expect(recipes.partition(0.01, [100])).toEqual([0.01]);
      });

      it("0.01 as [50%,50%] is [0.01,0]", () => {
        expect(recipes.partition(0.01, [50, 50])).toEqual([0.01, 0]);
      });
      it("0.01 as [99%,1%] is [0.01,0]", () => {
        expect(recipes.partition(0.01, [99, 1])).toEqual([0.01, 0]);
      });
      it("0.01 as [41%,33%,15%,9%,2%] is [0.01,0,0,0,0]", () => {
        expect(recipes.partition(0.01, [41, 33, 15, 9, 2])).toEqual([
          0.01, 0, 0, 0, 0,
        ]);
      });

      it("0.1 as [50%,50%] is [0.05,0.05]", () => {
        expect(recipes.partition(0.1, [50, 50])).toEqual([0.05, 0.05]);
      });
      it("0.1 as [99%,1%] is [0.1,0]", () => {
        expect(recipes.partition(0.1, [99, 1])).toEqual([0.1, 0]);
      });
      it("0.1 as [41%,33%,15%,9%,2%] is [0.05,0.04,0.01,0,0]", () => {
        expect(recipes.partition(0.1, [41, 33, 15, 9, 2])).toEqual([
          0.05, 0.04, 0.01, 0, 0,
        ]);
      });

      it("1 as [50%,50%] is [0.5,0.5]", () => {
        expect(recipes.partition(1, [50, 50])).toEqual([0.5, 0.5]);
      });
      it("1 as [99%,1%] is [0.99,0.01]", () => {
        expect(recipes.partition(1, [99, 1])).toEqual([0.99, 0.01]);
      });
      it("1 as [41%,33%,15%,9%,2%] is [0.41,0.33,0.15,0.09,0.02]", () => {
        expect(recipes.partition(1, [41, 33, 15, 9, 2])).toEqual([
          0.41, 0.33, 0.15, 0.09, 0.02,
        ]);
      });

      it("10 as [50%,50%] is [5,5]", () => {
        expect(recipes.partition(10, [50, 50])).toEqual([5, 5]);
      });
      it("10 as [99%,1%] is [9.9,0.1]", () => {
        expect(recipes.partition(10, [99, 1])).toEqual([9.9, 0.1]);
      });
      it("10 as [41%,33%,15%,9%,2%] is [4.1,3.3,1.5,0.9,0.2]", () => {
        expect(recipes.partition(10, [41, 33, 15, 9, 2])).toEqual([
          4.1, 3.3, 1.5, 0.9, 0.2,
        ]);
      });

      it("100 as [50%,50%] is [50,50]", () => {
        expect(recipes.partition(100, [50, 50])).toEqual([50, 50]);
      });
      it("100 as [99%,1%] is [99,1]", () => {
        expect(recipes.partition(100, [99, 1])).toEqual([99, 1]);
      });
      it("100 as [41%,33%,15%,9%,2%] is [41,33,15,9,2]", () => {
        expect(recipes.partition(100, [41, 33, 15, 9, 2])).toEqual([
          41, 33, 15, 9, 2,
        ]);
      });
      it("100 as [33%,41%,9%,2%,15%] is [33,41,9,2,15]", () => {
        expect(recipes.partition(100, [33, 41, 9, 2, 15])).toEqual([
          33, 41, 9, 2, 15,
        ]);
      });

      it("100 as ...[50%,50%], is [50,50]", () => {
        expect(recipes.partition(100, ...[50, 50])).toEqual([50, 50]);
      });
      it("100 as ,50%,50% is [50,50]", () => {
        expect(recipes.partition(100, 50, 50)).toEqual([50, 50]);
      });

      it("100 in 0 parts throws an ArgumentError", () => {
        expect(() => recipes.partition(100, 0)).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
      it("100 in 1.25 parts throws an ArgumentError", () => {
        expect(() => recipes.partition(100, 1.25)).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
      it("100 as [50%,45%] throws an ArgumentError", () => {
        expect(() => recipes.partition(100, [50, 45])).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
      it("100 as ...[50%,45%] throws an ArgumentError", () => {
        expect(() => recipes.partition(100, ...[50, 45])).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
      it("100 as ,50%,45% throws an ArgumentError", () => {
        expect(() => recipes.partition(100, 50, 45)).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
      it("100 as [1%] throws an ArgumentError", () => {
        expect(() => recipes.partition(100, [1])).toThrow(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      });
    });
    describe("#maxTax", () => {
      it("100 maxTax 0% or 0.01 is 0.01 ", () => {
        expect(maxTax(100, 0, 0.01)).toEqual(0.01);
      });
      it("100 maxTax 100% or 99.99 is 99.99 ", () => {
        expect(maxTax(100, 100, 99.99)).toEqual(100);
      });
      it("100 maxTax 10% or 20 is 20 ", () => {
        expect(maxTax(100, 10, 20)).toEqual(20);
      });
      it("100 maxTax 10% or 20.0001 is 20.01 ", () => {
        expect(maxTax(100, 10, 20.0001)).toEqual(20.01);
      });
      it("100 maxTax 10% or 20.021 is 20.03 ", () => {
        expect(maxTax(100, 10, 20.021)).toEqual(20.03);
      });
      it("100 maxTax 21% or 20 is 21 ", () => {
        expect(maxTax(100, 21, 20)).toEqual(21);
      });
      it("100 maxTax 21.875% or 20 is 21 ", () => {
        expect(maxTax(100, 21.875, 20)).toEqual(21.88);
      });
      it("524.25 maxTax 8.75% or 45 is 50 ", () => {
        expect(maxTax(524.25, 8.75, 45)).toEqual(45.88);
      });
      it("524.25 maxTax 8.75% or 50 is 50 ", () => {
        expect(maxTax(524.25, 8.75, 50)).toEqual(50);
      });
    });
    describe("#applyDiscount", () => {
      it("100 apply discount 10% is 90", () => {
        expect(applyDiscount(100, 10)).toEqual(90);
      });
      it("11 apply discount 8.2% is 10.10", () => {
        expect(applyDiscount(11, 8.2)).toEqual(10.1);
      });
    });
    describe("#appyTax", () => {
      it("100 apply maxTax 10% is 110 ", () => {
        expect(applyTax(100, 10)).toEqual(110);
      });
    });
    describe("#applyMaxTax", () => {
      it("100 apply maxTax 10% or 20 is 120 ", () => {
        expect(applyMaxTax(100, 10, 20)).toEqual(120);
      });
    });
    describe("#appllySumTax", () => {
      it("100 apply sumTax 10% or 20 is 130 ", () => {
        expect(applySumTax(100, 10, 20)).toEqual(130);
      });
    });

    describe("#compare", () => {
      it("1 vs 2 returns -1", () => {
        expect(compare(1, 2)).toEqual(-1);
      });
      it("2 vs 1 returns 1", () => {
        expect(compare(2, 1)).toEqual(1);
      });
      it("1 vs 1 returns 0", () => {
        expect(compare(1, 1)).toEqual(0);
      });
      it("0.1 vs 0.10 returns 0", () => {
        expect(compare(0.1, 0.1)).toEqual(0);
      });
      it("0.001 vs 0.002 both round to 0.01, returns 0", () => {
        expect(compare(0.001, 0.002)).toEqual(0);
      });
      it("100 vs 99.99 returns 1", () => {
        expect(compare(100, 99.99)).toEqual(1);
      });
      it("NaN vs 1 returns NaN", () => {
        expect(compare(NaN, 1)).toEqual(NaN);
      });
      it("1 vs NaN returns NaN", () => {
        expect(compare(1, NaN)).toEqual(NaN);
      });
      it("-1 vs 0 returns -1", () => {
        expect(compare(-1, 0)).toEqual(-1);
      });
    });

    describe("#isValid", () => {
      it("1 is valid", () => {
        expect(isValid(1)).toEqual(true);
      });
      it("0 is valid", () => {
        expect(isValid(0)).toEqual(true);
      });
      it("-1 is valid", () => {
        expect(isValid(-1)).toEqual(true);
      });
      it('"10.5" is valid', () => {
        expect(isValid("10.5")).toEqual(true);
      });
      it('"0" is valid', () => {
        expect(isValid("0")).toEqual(true);
      });
      it("NaN is not valid", () => {
        expect(isValid(NaN)).toEqual(false);
      });
      it("null is not valid", () => {
        expect(isValid(null)).toEqual(false);
      });
      it("undefined is not valid", () => {
        expect(isValid(undefined)).toEqual(false);
      });
      it('"abc" is not valid', () => {
        expect(isValid("abc")).toEqual(false);
      });
      it("[] is not valid", () => {
        expect(isValid([])).toEqual(false);
      });
      it("{} is not valid", () => {
        expect(isValid({})).toEqual(false);
      });
      it("false is not valid", () => {
        expect(isValid(false)).toEqual(false);
      });
      it("true is not valid", () => {
        expect(isValid(true)).toEqual(false);
      });
    });

    describe("#isZero", () => {
      it("0 is zero", () => {
        expect(isZero(0)).toEqual(true);
      });
      it("1 is not zero", () => {
        expect(isZero(1)).toEqual(false);
      });
      it("-1 is not zero", () => {
        expect(isZero(-1)).toEqual(false);
      });
      it("0.001 rounds to 0.01, not zero", () => {
        expect(isZero(0.001)).toEqual(false);
      });
      it("0.0001 rounds to 0.01, not zero", () => {
        expect(isZero(0.0001)).toEqual(false);
      });
      it('"0" is zero', () => {
        expect(isZero("0")).toEqual(true);
      });
    });

    describe("#isPositive", () => {
      it("1 is positive", () => {
        expect(isPositive(1)).toEqual(true);
      });
      it("0.001 rounds to 0.01, is positive", () => {
        expect(isPositive(0.001)).toEqual(true);
      });
      it("100 is positive", () => {
        expect(isPositive(100)).toEqual(true);
      });
      it("0 is not positive", () => {
        expect(isPositive(0)).toEqual(false);
      });
      it("-1 is not positive", () => {
        expect(isPositive(-1)).toEqual(false);
      });
      it("-0.001 rounds to -0.01, is not positive", () => {
        expect(isPositive(-0.001)).toEqual(false);
      });
    });

    describe("#isNegative", () => {
      it("-1 is negative", () => {
        expect(isNegative(-1)).toEqual(true);
      });
      it("-0.001 rounds to -0.01, is negative", () => {
        expect(isNegative(-0.001)).toEqual(true);
      });
      it("-100 is negative", () => {
        expect(isNegative(-100)).toEqual(true);
      });
      it("0 is not negative", () => {
        expect(isNegative(0)).toEqual(false);
      });
      it("1 is not negative", () => {
        expect(isNegative(1)).toEqual(false);
      });
      it("0.001 rounds to 0.01, not negative", () => {
        expect(isNegative(0.001)).toEqual(false);
      });
    });

    describe("#applyMaxDiscount", () => {
      it("100 applyMaxDiscount 10% or 20 is 80", () => {
        expect(applyMaxDiscount(100, 10, 20)).toEqual(80);
      });
      it("100 applyMaxDiscount 20% or 10 is 80", () => {
        expect(applyMaxDiscount(100, 20, 10)).toEqual(80);
      });
      it("100 applyMaxDiscount 10% or 5 is 90", () => {
        expect(applyMaxDiscount(100, 10, 5)).toEqual(90);
      });
      it("100 applyMaxDiscount 0% or 10 is 90", () => {
        expect(applyMaxDiscount(100, 0, 10)).toEqual(90);
      });
      it("100 applyMaxDiscount 25% or 20 is 75", () => {
        expect(applyMaxDiscount(100, 25, 20)).toEqual(75);
      });
      it("50 applyMaxDiscount 10% or 10 is 40", () => {
        expect(applyMaxDiscount(50, 10, 10)).toEqual(40);
      });
    });

    describe("#applySumDiscount", () => {
      it("100 applySumDiscount 10% and 20 is 70", () => {
        expect(applySumDiscount(100, 10, 20)).toEqual(70);
      });
      it("100 applySumDiscount 0% and 10 is 90", () => {
        expect(applySumDiscount(100, 0, 10)).toEqual(90);
      });
      it("100 applySumDiscount 10% and 0 is 90", () => {
        expect(applySumDiscount(100, 10, 0)).toEqual(90);
      });
      it("200 applySumDiscount 50% and 30 is 70", () => {
        expect(applySumDiscount(200, 50, 30)).toEqual(70);
      });
      it("recipes.applyMaxDiscount matches top-level", () => {
        expect(recipes.applyMaxDiscount(100, 10, 20)).toEqual(
          applyMaxDiscount(100, 10, 20),
        );
      });
      it("recipes.applySumDiscount matches top-level", () => {
        expect(recipes.applySumDiscount(100, 10, 20)).toEqual(
          applySumDiscount(100, 10, 20),
        );
      });
    });

    describe("#abs", () => {
      it("abs(-10.50) is 10.5", () => {
        expect(abs(-10.5)).toEqual(10.5);
      });
      it("abs(10.50) is 10.5", () => {
        expect(abs(10.5)).toEqual(10.5);
      });
      it("abs(0) is 0", () => {
        expect(abs(0)).toEqual(0);
      });
      it("abs(-0.001) is 0.01", () => {
        expect(abs(-0.001)).toEqual(0.01);
      });
      it("abs(NaN) is NaN", () => {
        expect(abs(NaN)).toEqual(NaN);
      });
      it("abs('-5.25') is 5.25", () => {
        expect(abs("-5.25")).toEqual(5.25);
      });
      it("abs(-1.2345, 4) is 1.2345", () => {
        expect(abs(-1.2345, 4)).toEqual(1.2345);
      });
    });

    describe("#min", () => {
      it("min(10, 20, 5) is 5", () => {
        expect(min(10, 20, 5)).toEqual(5);
      });
      it("min([10, 20, 5]) is 5", () => {
        expect(min([10, 20, 5])).toEqual(5);
      });
      it("min(0.1, 0.2) is 0.1", () => {
        expect(min(0.1, 0.2)).toEqual(0.1);
      });
      it("min(-1, 0, 1) is -1", () => {
        expect(min(-1, 0, 1)).toEqual(-1);
      });
      it("min(NaN, 1) is NaN", () => {
        expect(min(NaN, 1)).toEqual(NaN);
      });
      it("min(5) is 5", () => {
        expect(min(5)).toEqual(5);
      });
      it("min('10', '3', '7') is 3", () => {
        expect(min("10", "3", "7")).toEqual(3);
      });
    });

    describe("#max", () => {
      it("max(10, 20, 5) is 20", () => {
        expect(max(10, 20, 5)).toEqual(20);
      });
      it("max([10, 20, 5]) is 20", () => {
        expect(max([10, 20, 5])).toEqual(20);
      });
      it("max(0.1, 0.2) is 0.2", () => {
        expect(max(0.1, 0.2)).toEqual(0.2);
      });
      it("max(-1, 0, 1) is 1", () => {
        expect(max(-1, 0, 1)).toEqual(1);
      });
      it("max(NaN, 1) is NaN", () => {
        expect(max(NaN, 1)).toEqual(NaN);
      });
      it("max(5) is 5", () => {
        expect(max(5)).toEqual(5);
      });
    });

    describe("#equal", () => {
      it("1 equals 1", () => {
        expect(equal(1, 1)).toEqual(true);
      });
      it("0.1 equals 0.10", () => {
        expect(equal(0.1, 0.1)).toEqual(true);
      });
      it("1 does not equal 2", () => {
        expect(equal(1, 2)).toEqual(false);
      });
      it("0.001 equals 0.002 (both round to 0.01)", () => {
        expect(equal(0.001, 0.002)).toEqual(true);
      });
      it("NaN does not equal NaN", () => {
        expect(equal(NaN, NaN)).toEqual(false);
      });
    });

    describe("#greaterThan", () => {
      it("2 > 1 is true", () => {
        expect(greaterThan(2, 1)).toEqual(true);
      });
      it("1 > 1 is false", () => {
        expect(greaterThan(1, 1)).toEqual(false);
      });
      it("1 > 2 is false", () => {
        expect(greaterThan(1, 2)).toEqual(false);
      });
      it("NaN > 1 is false", () => {
        expect(greaterThan(NaN, 1)).toEqual(false);
      });
    });

    describe("#greaterThanOrEqual", () => {
      it("2 >= 1 is true", () => {
        expect(greaterThanOrEqual(2, 1)).toEqual(true);
      });
      it("1 >= 1 is true", () => {
        expect(greaterThanOrEqual(1, 1)).toEqual(true);
      });
      it("1 >= 2 is false", () => {
        expect(greaterThanOrEqual(1, 2)).toEqual(false);
      });
      it("NaN >= 1 is false", () => {
        expect(greaterThanOrEqual(NaN, 1)).toEqual(false);
      });
    });

    describe("#lessThan", () => {
      it("1 < 2 is true", () => {
        expect(lessThan(1, 2)).toEqual(true);
      });
      it("1 < 1 is false", () => {
        expect(lessThan(1, 1)).toEqual(false);
      });
      it("2 < 1 is false", () => {
        expect(lessThan(2, 1)).toEqual(false);
      });
      it("NaN < 1 is false", () => {
        expect(lessThan(NaN, 1)).toEqual(false);
      });
    });

    describe("#lessThanOrEqual", () => {
      it("1 <= 2 is true", () => {
        expect(lessThanOrEqual(1, 2)).toEqual(true);
      });
      it("1 <= 1 is true", () => {
        expect(lessThanOrEqual(1, 1)).toEqual(true);
      });
      it("2 <= 1 is false", () => {
        expect(lessThanOrEqual(2, 1)).toEqual(false);
      });
      it("NaN <= 1 is false", () => {
        expect(lessThanOrEqual(NaN, 1)).toEqual(false);
      });
    });
  });
});
