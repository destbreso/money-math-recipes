const {
  add,
  value,
  fx,
  percent,
  toCents,
  cents2Amount,
} = require('./arithmetic');


module.exports = {
  partition: (amount, parts = 1) => {
    // console.log(`================[PARTITION]==================`)
    const cents = toCents(amount)
    // console.log(` -> (INPUT) amount: ${amount} [${cents} cents], parts: ${parts}`) 
  
    let sliceCount
    let percentPartition = []
    if(parts % 1 === 0) {
      sliceCount = parts
      percentPartition.length = parts
      percentPartition.fill(100/parts)
    }else if(Array.isArray(parts)){
      sliceCount = parts.length
      percentPartition = parts
    }
    // percentPartition = percentPartition.sort((a,b) => b-a)
    const totalPercent = Math.round(percentPartition.reduce((a,b) => a+b))
    // console.log(` -> sliceCount: ${sliceCount}, percentPartition: ${percentPartition} [totalPercent: ${totalPercent}]`) 
  
    if(totalPercent!==100) throw new Error('invalid parts. expect a number or a  % partition')
    
    let partition = []
    percentPartition.map(p => {
      const v = Math.floor(cents*p/100)
      partition.push(v)
      // console.log(` ${p}% of ${cents} => ${v}`)
    })
  
    const distributedCents = add(partition)
    let residuo = cents-distributedCents
    // const warn = `=> [${partition}] distributedCents: ${distributedCents}, residuo: ${residuo} cents`
    // if(residuo) console.log(`-> !!! REDISTRIBUTE ${warn}`)
  
    if(residuo > 0){
      partition = partition.map(x => {
        if(residuo - 1 >= 0) {
          residuo -= 1
          return add(x,1)
        }
        return x
      })
    }
    const finalPartition = partition.map(x => cents2Amount(x))
    // console.log(` -> finalPartition: [${finalPartition}]`)
  
    return finalPartition
  },
  /** difference of two amounts */
  subtract: (amount1, amount2) => add(amount1, -amount2),
  /** multiply an amount by a factor */
  multiply:  (amount, factor, decimals = 2) =>  fx(amount, factor, decimals),
  /** divide an amount by a factor */
  divide: (amount, factor) => {
    if (factor === 0) throw new Error('cant divide by zero');
    if (factor === 1) return value(amount);
    return fx(amount, 1 / factor);
  },
  /** apply a percent discount to base amount */
  applyDiscount: (amount, p) => fx(amount,1-p/100),
  /** compute tax to base amount, follow max policy from percent value and fee value */
  maxTax: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  // /** apply discount to base amount, follow max policy from percent value and fee value */
  // maxDiscount: (amount, p, fee) => Math.max(percent(amount, p), value(fee)),
  /** apply a percent tax to base amount */
  applyTax: (amount, p) => fx(amount,1+p/100), //sum(amount, percent(amount, p)),
  /** apply tax to base amount, follow max policy from percent value and fee value */
  applyMaxTax: (amount, p, fee) => add(amount, module.exports.maxTax(amount, p, fee)),
  /** apply tax to base amount, follow sum policy from percent value and fee value */
  applySumTax: (amount, p, fee) => add(module.exports.applyTax(amount, p), fee),
  /** apply discount to base amount, follow max policy from percent value and fee value */
  // applyMaxDiscount: (amount, p, fee) => subtract(amount, maxDiscount(amount, p, fee)),
  /** apply discount to base amount, follow sum policy from percent value and fee value */
  // applySumDiscount: (amount, p, fee) => subtract(applyDiscount(amount, p), fee),
};