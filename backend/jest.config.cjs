module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 100,
      lines: 85,
      statements: 85
    }
  },
  collectCoverageFrom: [
    'tests/coverage-src/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  testMatch: ['**/tests/backend.test.js', '**/tests/coverage-real.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 10000,
  verbose: true,
  silent: false
};
