/**
 * @type {import('jest').Config}
 */
const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  moduleDirectories: ['src', 'node_modules'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@t/(.*)$': '<rootDir>/types/$1',
  },
};

module.exports = config;
