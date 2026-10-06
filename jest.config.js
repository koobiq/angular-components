// @ts-check

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const isCI = !!process.env.CI;

/**
 * ESM-only packages of the unified (remark) ecosystem that `tools/docs-pages` parses MDX with. Jest
 * loads `require(esm)` only under `--experimental-vm-modules`, so they are compiled to CommonJS instead.
 */
const UNIFIED_ESM_PACKAGES = [
    'bail',
    'ccount',
    'character-entities[^/]*',
    'character-reference-invalid',
    'decode-named-character-reference',
    'devlop',
    'escape-string-regexp',
    'estree-util-[^/]+',
    'is-(?:alphabetical|alphanumerical|decimal|hexadecimal|plain-obj)',
    'longest-streak',
    'markdown-table',
    'mdast-util-[^/]+',
    'micromark[^/]*',
    'parse-entities',
    'remark-[^/]+',
    'stringify-entities',
    'trough',
    'unified',
    'unist-util-[^/]+',
    'vfile[^/]*',
    'zwitch'
];

/**
 * ESM-only packages that `@angular-devkit/schematics/testing` loads through `ora`: the migration specs
 * never start its spinner, but the import is evaluated.
 */
const SCHEMATICS_ESM_PACKAGES = [
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
    'ora',
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
    modulePathIgnorePatterns: ['/dist/', '/node_modules/'],
    transformIgnorePatterns: [
        `node_modules/(?!(marked|(?:${[...UNIFIED_ESM_PACKAGES, ...SCHEMATICS_ESM_PACKAGES].join('|')})/|.*\\.mjs$))`
    ],
    testMatch: ['<rootDir>/**/*.spec.ts'],
    testTimeout: 2000
};

module.exports = config;
