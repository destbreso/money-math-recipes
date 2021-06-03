const arithmetic = require('./lib/arithmetic');
var recipes = require('./lib/recipes');

module.exports = {
  value: arithmetic.value,
  cents: arithmetic.toCents,
  cents2Amount: arithmetic.cents2Amount,
  fx: arithmetic.fx,
  add: arithmetic.add,
  sum: arithmetic.add,
  percent: arithmetic.percent,
  recipes,
  //TODO: DEPRECATE THIS
  ...recipes,
};