/**
 * @type {import('jest').Config}
 */
const config = {
  transform: {
    '^.+\\.(js)?$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleDirectories: ['src', 'node_modules'],
  coverageDirectory: 'coverage',
};

export default config;
