const {
  sum,
  value,
  fx,
  percent,
  toCents,
  cents2Amount,
} = require('./arithmetic');

const { ArgumentError } = require('./errors');

module.exports = {
  partition(amount, ...parts) { // not an arrow function because needs access to `arguments`
    // console.log(`================[PARTITION]==================`)
    // console.log('arguments', arguments);

    const argList = [...arguments];
    // console.log('argList', ...argList);
    // console.log(parts);

    const amountArg = amount;
    let partsArg;
    if (argList.length < 1) throw new ArgumentError('function expects an argument');
    else if (argList.length === 1) {
      partsArg = 1;
    } else if (argList.length === 2) {
      partsArg = argList[1];
    } else {
      partsArg = argList.slice(1);
    }
    // console.log(' - amountArg', amountArg);
    // console.log(' - partsArg', partsArg);

    const cents = toCents(amountArg);
    // console.log(` -> (INPUT) amountArg: ${amountArg} [${cents} cents], partsArg: ${partsArg}`)
    let sliceCount;
    let percentPartition = [];
    if (!Array.isArray(partsArg) && partsArg % 1 === 0) {
      if (partsArg === 0) throw new ArgumentError('partsArg must be a positive integer or an array with a partition of 100');
      sliceCount = partsArg;
      percentPartition.length = partsArg;
      percentPartition.fill(100 / partsArg);
    } else if (Array.isArray(partsArg)) {
      sliceCount = partsArg.length;
      percentPartition = partsArg;
    } else throw new ArgumentError('partsArg must be a positive integer or an array with a partition of 100');
    // percentPartition = percentPartition.sort((a,b) => b-a)
    const totalPercent = Math.round(percentPartition.reduce((a, b) => a + b));
    // console.log(` -> sliceCount: ${sliceCount}, percentPartition: ${percentPartition} [totalPercent: ${totalPercent}]`)

    if (totalPercent !== 100) throw new ArgumentError('partsArg must be a positive integer or an array with a partition of 100');

    let partition = [];
    percentPartition.map((p) => {
      const v = Math.floor(cents * p / 100);
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
  applyTax: (amount, p) => fx(amount, 1 + p / 100), // sum(amount, percent(amount, p)),
  applyMaxTax: (amount, p, fee) => sum(amount, module.exports.maxTax(amount, p, fee)),
  applySumTax: (amount, p, fee) => sum(module.exports.applyTax(amount, p), fee),
  // /** apply discount to base amount, follow max policy from percent value and fee value */
  // maxDiscount: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  /** apply discount to base amount, follow max policy from percent value and fee value */
  // applyMaxDiscount: (amount, p, fee) => subtract(amount, maxDiscount(amount, p, fee)),
  /** apply discount to base amount, follow sum policy from percent value and fee value */
  // applySumDiscount: (amount, p, fee) => subtract(applyDiscount(amount, p), fee),
};
