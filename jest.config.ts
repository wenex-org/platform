import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from 'jest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
  coveragePathIgnorePatterns: ['index.ts', '.test.ts', '.dto.ts', '.schema.ts', '.metadata.ts', '.serializer.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
