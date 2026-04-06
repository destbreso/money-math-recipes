/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.js"],
  collectCoverageFrom: ["index.js", "lib/**/*.js"],
  coverageReporters: ["text", "lcov", "cobertura"],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
