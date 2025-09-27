module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/services/**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    '!server.js',
    '!**/node_modules/**',
    '!config/**/*.js',
    '!migrations/**/*.js',
    '!seeders/**/*.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
