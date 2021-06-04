class ArgumentError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'ArgumentError'; // (2)
  }
}

module.exports = {
  ArgumentError,
};
