module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true
};
