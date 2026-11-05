import { join } from 'node:path';
import { defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

/**
 * Imports and exports of every JavaScript and TypeScript file: their order, which is up to ESLint rather than prettier,
 * and the module graph, where a cycle leaves a class `undefined` at runtime once a module reads it on load or a bundler
 * splits the cycle across chunks. In TypeScript, unused imports are removed by the fix of
 * `@typescript-eslint/no-unused-vars`.
 */
export const importsConfig = defineConfig(
    {
        name: 'koobiq/imports',
        files: ['**/*.{js,cjs,mjs}', '**/*.{ts,cts,mts}'],
        extends: [importX.flatConfigs.recommended, importX.flatConfigs.typescript],
        plugins: {
            'simple-import-sort': simpleImportSort
        },
        settings: {
            // the tsconfig the parser reads, so that `@koobiq/components/<name>` resolves to the sources there too
            'import-x/resolver-next': [
                createTypeScriptImportResolver({ project: join(import.meta.dirname, '../../tsconfig.eslint.json') })
            ]
        },
        rules: {
            // plugin:simple-import-sort: one block without blank lines, as the code is written. Side effects first, in
            // their own order, then `node:`, `@angular/*`, the other packages, `@koobiq/*`, the code of this repository
            // (paths from its root and the `src/` alias of the docs app), other aliases and relative paths. An import
            // goes to the pattern with the longest match, so these leave `^@?\w`, which a bare path matches too
            'simple-import-sort/imports': [
                1,
                {
                    groups: [
                        [
                            '^\\u0000',
                            '^node:',
                            '^@angular/',
                            '^@?\\w',
                            '^@koobiq/',
                            '^(apps|packages|src|tools)/',
                            '^',
                            '^\\.'
                        ]
                    ]
                }
            ],
            'simple-import-sort/exports': 1,

            // plugin:import-x
            'import-x/first': 1,
            'import-x/newline-after-import': 1,
            'import-x/no-duplicates': 1,
            'import-x/no-cycle': [2, { ignoreExternal: true }],
            // the TypeScript config below turns it off, while nothing else checks the names a JavaScript file imports
            'import-x/named': 2,
            // takes `ts.isIdentifier()` and `express.static()` for mistakes, while both packages document them that way
            'import-x/no-named-as-default-member': 0
        }
    },
    {
        name: 'koobiq/imports/typescript',
        files: ['**/*.{ts,cts,mts}'],
        plugins: {
            '@typescript-eslint': tseslint.plugin
        },
        rules: {
            // TypeScript checks the same, while these parse every imported module once more: `namespace` alone took a
            // quarter of the lint time of a component.
            // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
            'import-x/named': 0,
            'import-x/namespace': 0,
            'import-x/default': 0,
            'import-x/no-unresolved': 0,

            // plugin:@typescript-eslint: an import used for types only says `type`, so a reader sees what loads at
            // runtime and `import-x/no-cycle` skips it. `import type` when every name is a type, an inline `type`
            // next to values. The rule reads usage, not the declaration: a class needed as a type gets `type`,
            // an enum read as a value does not
            '@typescript-eslint/consistent-type-imports': [
                1,
                { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
            ],
            '@typescript-eslint/no-import-type-side-effects': 1
        }
    },
    {
        name: 'koobiq/imports/no-cycle-in-tests',
        // nothing imports a spec, so it cannot close a cycle, while the rule would walk its whole dependency graph
        files: ['**/*.spec.ts', '**/*.spec-helper.ts', '**/*.playwright-spec.ts'],
        rules: {
            'import-x/no-cycle': 0
        }
    },
    {
        name: 'koobiq/imports/empty-entry-points',
        // the root entry points export nothing on purpose: a consumer imports `@koobiq/components/<name>`
        files: ['packages/{components,components-experimental,angular-luxon-adapter,angular-moment-adapter}/index.ts'],
        rules: {
            'import-x/export': 0
        }
    }
);
