const {
  add,
  value,
  fx,
  percent,
  toCents,
  cents2Amount,
} = require('./arithmetic');

const { ArgumentError } = require('./errors');

module.exports = {
  partition: (amount, parts = 1) => {
    // console.log(`================[PARTITION]==================`)
    const cents = toCents(amount);
    // console.log(` -> (INPUT) amount: ${amount} [${cents} cents], parts: ${parts}`)

    let sliceCount;
    let percentPartition = [];
    if (parts % 1 === 0) {
      if (parts === 0) throw new ArgumentError('parts must be a positive integer or an array with a partition of 100');
      sliceCount = parts;
      percentPartition.length = parts;
      percentPartition.fill(100 / parts);
    } else if (Array.isArray(parts)) {
      sliceCount = parts.length;
      percentPartition = parts;
    } else throw new ArgumentError('parts must be a positive integer or an array with a partition of 100');
    // percentPartition = percentPartition.sort((a,b) => b-a)
    const totalPercent = Math.round(percentPartition.reduce((a, b) => a + b));
    // console.log(` -> sliceCount: ${sliceCount}, percentPartition: ${percentPartition} [totalPercent: ${totalPercent}]`)

    if (totalPercent !== 100) throw new ArgumentError('parts must be a positive integer or an array with a partition of 100');

    let partition = [];
    percentPartition.map((p) => {
      const v = Math.floor(cents * p / 100);
      partition.push(v);
      // console.log(` ${p}% of ${cents} => ${v}`)
    });

    const distributedCents = add(partition);
    let residuo = cents - distributedCents;
    // const warn = `=> [${partition}] distributedCents: ${distributedCents}, residuo: ${residuo} cents`
    // if(residuo) console.log(`-> !!! REDISTRIBUTE ${warn}`)

    if (residuo > 0) {
      partition = partition.map((x) => {
        if (residuo - 1 >= 0) {
          residuo -= 1;
          return add(x, 1);
        }
        return x;
      });
    }
    const finalPartition = partition.map((x) => cents2Amount(x));
    // console.log(` -> finalPartition: [${finalPartition}]`)

    return finalPartition;
  },
  /**
     * @deprecated
     * */
  subtract: (amount1, amount2) => add(amount1, -amount2),
  /**
     * @deprecated
     * */
  multiply: (amount, factor = 1, decimals = 2) => fx(amount, factor, decimals),
  /**
     * @deprecated
     * */
  divide: (amount, factor = 1, decimals = 2) => {
    if (factor === 0) throw new ArgumentError('cant divide by zero');
    if (factor === 1) return value(amount, decimals);
    return fx(amount, 1 / factor, decimals);
  },
  applyDiscount: (amount, p) => fx(amount, 1 - p / 100),
  maxTax: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  applyTax: (amount, p) => fx(amount, 1 + p / 100), // sum(amount, percent(amount, p)),
  applyMaxTax: (amount, p, fee) => add(amount, module.exports.maxTax(amount, p, fee)),
  applySumTax: (amount, p, fee) => add(module.exports.applyTax(amount, p), fee),
  // /** apply discount to base amount, follow max policy from percent value and fee value */
  // maxDiscount: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  /** apply discount to base amount, follow max policy from percent value and fee value */
  // applyMaxDiscount: (amount, p, fee) => subtract(amount, maxDiscount(amount, p, fee)),
  /** apply discount to base amount, follow sum policy from percent value and fee value */
  // applySumDiscount: (amount, p, fee) => subtract(applyDiscount(amount, p), fee),
};
