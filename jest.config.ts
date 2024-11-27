import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from 'jest';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const { compilerOptions } = require('./tsconfig');

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['.e2e-spec.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
