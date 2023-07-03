import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/'],
  moduleNameMapper: {
    '@app/common/(.*)': '<rootDir>/libs/common/src/$1',
    '@app/common': '<rootDir>/libs/common/src',
    '@app/command/(.*)': '<rootDir>/libs/command/src/$1',
    '@app/command': '<rootDir>/libs/command/src',
    '@app/blacklisted/(.*)': '<rootDir>/libs/blacklisted/src/$1',
    '@app/blacklisted': '<rootDir>/libs/blacklisted/src',
    '@app/health/(.*)': '<rootDir>/libs/health/src/$1',
    '@app/health': '<rootDir>/libs/health/src',
    '@app/redis/(.*)': '<rootDir>/libs/redis/src/$1',
    '@app/redis': '<rootDir>/libs/redis/src',
  },
};

export default config;
