// @ts-check

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const isCI = !!process.env.CI;

/** @type {import('jest').Config} */
const config = {
    rootDir: __dirname,
    bail: 1,
    verbose: !isCI,
    silent: isCI,
    resetModules: true,
    clearMocks: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest',
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/tools/jest/setup.ts'],
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
    },
    transformIgnorePatterns: ['node_modules/(?!(marked|.*\\.mjs$))'],
    testMatch: ['<rootDir>/**/*.spec.ts'],
    testTimeout: 2000
};

module.exports = config;
