// @ts-check

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const isCI = !!process.env.CI;

/**
 * ESM-only packages that have to be transformed to CommonJS before Jest can load them.
 *
 * `ora` and its dependencies come in through `@angular-devkit/schematics/testing`, which the
 * migration specs use — the spinner is never started, but the import is evaluated.
 */
const esmDependencies = [
    'marked',
    'ora',
    'ansi-regex',
    'chalk',
    'cli-cursor',
    'cli-spinners',
    'get-east-asian-width',
    'is-interactive',
    'is-unicode-supported',
    'log-symbols',
    'mimic-function',
    'onetime',
    'restore-cursor',
    'stdin-discarder',
    'string-width',
    'strip-ansi',
    'yoctocolors'
];

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
    transformIgnorePatterns: [`node_modules/(?!(${esmDependencies.join('|')}|.*\\.mjs$))`],
    testMatch: ['<rootDir>/**/*.spec.ts'],
    testTimeout: 2000
};

module.exports = config;
