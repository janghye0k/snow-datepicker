/**
 * @type {import('jest').Config}
 */
const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  moduleDirectories: ['src', 'node_modules'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};

export default config;
