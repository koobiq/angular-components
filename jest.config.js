// @ts-check

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const isCI = !!process.env.CI;

/** @type {import('jest').Config} */
const config = {
    rootDir: __dirname,
    verbose: !isCI,
    silent: isCI,
    clearMocks: true,
    resetModules: true,
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/tools/jest/setup.ts'],
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
    },
    modulePathIgnorePatterns: ['dist', 'node_modules'],
    transformIgnorePatterns: ['node_modules/(?!(marked|.*\\.mjs$))'],
    testMatch: ['<rootDir>/**/*.spec.ts'],
    testTimeout: 2000
};

module.exports = config;
