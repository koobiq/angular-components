// @ts-check

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('jest').Config} */
const config = {
    rootDir: __dirname,
    bail: 1,
    verbose: true,
    resetModules: true,
    clearMocks: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest',
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/tools/jest/setup.js'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    testMatch: ['<rootDir>/**/*.spec.ts']
};

module.exports = config;
