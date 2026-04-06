const {
  sum,
  value,
  fx,
  percent,
  toCents,
  cents2Amount,
} = require("./arithmetic");

const { ArgumentError } = require("./errors");

module.exports = {
  partition(amount, ...partsArgs) {
    const amountArg = amount;
    let partsArg;
    if (partsArgs.length === 0) {
      partsArg = 1;
    } else if (partsArgs.length === 1) {
      partsArg = partsArgs[0];
    } else {
      partsArg = partsArgs;
    }

    const cents = toCents(amountArg);
    // console.log(` -> (INPUT) amountArg: ${amountArg} [${cents} cents], partsArg: ${partsArg}`)
    let sliceCount;
    let percentPartition = [];
    if (!Array.isArray(partsArg) && partsArg % 1 === 0) {
      if (partsArg === 0)
        throw new ArgumentError(
          "partsArg must be a positive integer or an array with a partition of 100",
        );
      sliceCount = partsArg;
      percentPartition.length = partsArg;
      percentPartition.fill(100 / partsArg);
    } else if (Array.isArray(partsArg)) {
      sliceCount = partsArg.length;
      percentPartition = partsArg;
    } else
      throw new ArgumentError(
        "partsArg must be a positive integer or an array with a partition of 100",
      );
    // percentPartition = percentPartition.sort((a,b) => b-a)
    const totalPercent = Math.round(percentPartition.reduce((a, b) => a + b));
    // console.log(` -> sliceCount: ${sliceCount}, percentPartition: ${percentPartition} [totalPercent: ${totalPercent}]`)

    if (totalPercent !== 100)
      throw new ArgumentError(
        "partsArg must be a positive integer or an array with a partition of 100",
      );

    let partition = [];
    percentPartition.map((p) => {
      const v = Math.floor((cents * p) / 100);
      partition.push(v);
      // console.log(` ${p}% of ${cents} => ${v}`)
    });

    const distributedCents = sum(partition);
    let residuo = cents - distributedCents;
    // const warn = `=> [${partition}] distributedCents: ${distributedCents}, residuo: ${residuo} cents`
    // if(residuo) console.log(`-> !!! REDISTRIBUTE ${warn}`)

    if (residuo > 0) {
      partition = partition.map((x) => {
        if (residuo - 1 >= 0) {
          residuo -= 1;
          return sum(x, 1);
        }
        return x;
      });
    }
    const finalPartition = partition.map((x) => cents2Amount(x));
    // console.log(` -> finalPartition: [${finalPartition}]`)

    return finalPartition;
  },
  applyDiscount: (amount, p) => fx(amount, 1 - p / 100),
  maxTax: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  applyTax: (amount, p) => fx(amount, 1 + p / 100),
  applyMaxTax: (amount, p, fee) =>
    sum(amount, module.exports.maxTax(amount, p, fee)),
  applySumTax: (amount, p, fee) => sum(module.exports.applyTax(amount, p), fee),
  maxDiscount: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  applyMaxDiscount: (amount, p, fee) => {
    const discount = Math.max(percent(amount, p), value(fee));
    return sum(amount, -discount);
  },
  applySumDiscount: (amount, p, fee) =>
    sum(fx(amount, 1 - p / 100), -value(fee)),

  // ─── New names (preferred) ──────────────────────────────────────────────
  addPercent: (amount, p) => fx(amount, 1 + p / 100),
  deductPercent: (amount, p) => fx(amount, 1 - p / 100),
  maxFee: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  addMaxFee: (amount, p, fee) =>
    sum(amount, Math.max(percent(amount, p), value(fee))),
  addFees: (amount, p, fee) => sum(fx(amount, 1 + p / 100), fee),
  deductMaxFee: (amount, p, fee) => {
    const d = Math.max(percent(amount, p), value(fee));
    return sum(amount, -d);
  },
  deductFees: (amount, p, fee) => sum(fx(amount, 1 - p / 100), -value(fee)),
};
