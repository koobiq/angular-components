// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const globals = require('globals');
const stylistic = require('@stylistic/eslint-plugin');
const promise = require('eslint-plugin-promise');
// eslint-plugin-rxjs-x ships as transpiled ESM (the plugin object lives under `.default`)
const rxjs = require('eslint-plugin-rxjs-x').default;
const comments = require('@eslint-community/eslint-plugin-eslint-comments/configs');
const progress = require('eslint-plugin-file-progress');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

const isCI = !!process.env.CI;

/**
 * @param {string} str
 * @returns {string}
 */
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @see https://typescript-eslint.io/rules/naming-convention/#options
 *
 * @param {string} prefix
 */
const makeNamingConventionOptions = (prefix) => {
    return [
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
        {
            selector: 'variable',
            modifiers: ['exported'],
            format: ['StrictPascalCase', 'UPPER_CASE'],
            prefix: [prefix, `${prefix.toUpperCase()}_`]
        },

        { selector: 'function', format: ['camelCase'] },
        { selector: 'function', modifiers: ['exported'], format: ['StrictPascalCase'], prefix: [prefix] },

        { selector: 'interface', format: ['PascalCase'] },
        {
            selector: 'interface',
            modifiers: ['exported'],
            format: ['StrictPascalCase'],
            prefix: [capitalizeFirst(prefix)]
        },

        { selector: 'typeLike', format: ['PascalCase'] },
        {
            selector: 'typeLike',
            modifiers: ['exported'],
            format: ['StrictPascalCase'],
            prefix: [capitalizeFirst(prefix)]
        },

        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enum', modifiers: ['exported'], format: ['StrictPascalCase'], prefix: [capitalizeFirst(prefix)] },
        { selector: 'enumMember', format: ['PascalCase'] },

        { selector: 'class', format: ['PascalCase'] },
        { selector: 'class', modifiers: ['exported'], format: ['PascalCase'], prefix: [capitalizeFirst(prefix)] },
        { selector: 'classMethod', format: ['camelCase'] },
        { selector: 'classProperty', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' }
    ];
};

/**
 * @see https://eslint.org/docs/latest/rules/no-restricted-globals
 */
const noRestrictedGlobalsOptionsForSSR = (() => {
    /** @type {Array<keyof Window>} */
    const restrictedWindowGlobals = [
        'window',
        'open',
        'close',
        'scroll',
        'scrollTo',
        'scrollBy',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'getComputedStyle',
        'matchMedia',
        'navigator',
        'location',
        'history',
        'screen',
        'localStorage',
        'sessionStorage',
        'crypto',
        'caches',
        'performance',
        'speechSynthesis'
    ];

    const restrictedOptions = restrictedWindowGlobals.map((name) => ({
        name,
        message: `Global property '${name}' is not available is SSR. Use 'KBQ_WINDOW' injection token from '@koobiq/components/core' instead.`
    }));

    restrictedOptions.push({
        name: 'document',
        message: `Global property 'document' is not available is SSR. Use 'DOCUMENT' injection token from '@angular/common' instead.`
    });

    return restrictedOptions;
})();

/**
 * @see https://eslint.org/docs/latest/rules/no-restricted-properties
 */
const noRestrictedPropertiesOptionsForSSR = [
    {
        property: 'getBoundingClientRect',
        message:
            'Direct DOM measurement is not SSR-safe. Use KbqGeometryService.kbqGetBoundingClientRect() from @koobiq/components/core instead.'
    },
    {
        property: 'getClientRects',
        message:
            'Direct DOM measurement is not SSR-safe. Use KbqGeometryService.kbqGetClientRects() from @koobiq/components/core instead.'
    }
];

module.exports = tseslint.config(
    // Global ignores (ported from .eslintignore)
    {
        ignores: [
            'dist',
            'node_modules',
            'coverage',
            // ignore Yarn's bundled release/plugin binaries (flat config lints .cjs by default,
            // unlike the previous `--ext=.js,.ts,.html`)
            '.yarn',
            // ignore build tokens
            'apps/docs/src/styles/koobiq/default-theme/',
            // ignore nunjuck templates
            'tools/api-gen/rendering/templates/**',
            // ignore index.html
            '**/index.html',
            // ignore mocks
            '**/mock.ts'
        ]
    },

    // plugin:file-progress
    {
        plugins: {
            'file-progress': progress
        },
        rules: {
            'file-progress/activate': isCI ? 0 : 1
        }
    },

    // plugin:@eslint-community/eslint-comments
    comments.recommended,
    {
        rules: {
            '@eslint-community/eslint-comments/no-unused-disable': 1,
            '@eslint-community/eslint-comments/disable-enable-pair': [1, { allowWholeFile: true }]
        }
    },

    // Rules for JavaScript and TypeScript files
    {
        files: ['**/*.js', '**/*.ts'],
        extends: [
            eslint.configs.recommended,
            promise.configs['flat/recommended']
        ],
        plugins: {
            '@stylistic': stylistic
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        },
        rules: {
            // plugin:eslint
            'no-useless-escape': 0,
            'no-self-assign': 0,
            'no-prototype-builtins': 0,
            'no-console': 1,

            // plugin:promise
            'promise/catch-or-return': 0,
            'promise/always-return': 0,

            // @stylistic
            '@stylistic/padding-line-between-statements': [
                1,
                { blankLine: 'always', next: 'block', prev: '*' },
                { blankLine: 'always', next: '*', prev: 'block' },
                { blankLine: 'always', next: 'block-like', prev: '*' },
                { blankLine: 'always', next: '*', prev: 'block-like' },
                { blankLine: 'always', next: 'return', prev: '*' },
                { blankLine: 'always', next: '*', prev: 'directive' },
                { blankLine: 'always', next: ['interface', 'type'], prev: '*' },
                { blankLine: 'always', next: '*', prev: ['const', 'let', 'var'] },
                { blankLine: 'always', next: 'class', prev: '*' },
                { blankLine: 'always', next: '*', prev: 'class' },
                {
                    blankLine: 'any',
                    next: ['const', 'let', 'var', 'export'],
                    prev: ['const', 'let', 'var', 'export']
                },
                { blankLine: 'any', next: ['case', 'default'], prev: '*' },
                { blankLine: 'any', next: '*', prev: ['case', 'default'] },
                { blankLine: 'any', next: 'directive', prev: 'directive' }
            ]
        }
    },

    // JavaScript files in this repo are CommonJS (require/module.exports)
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs'
        },
        rules: {
            // ESLint 9 changed the `no-unused-vars` `caughtErrors` default from 'none' to 'all'.
            // Restore the previous behavior so unused `catch` bindings are not newly reported.
            'no-unused-vars': ['error', { caughtErrors: 'none' }]
        }
    },

    // Rules for TypeScript files
    {
        files: ['**/*.ts'],
        extends: [
            /** @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended.ts */
            tseslint.configs.recommended,
            /** @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/ts-all.ts */
            angular.configs.tsAll,
            rxjs.configs.recommended
        ],
        processor: angular.processInlineTemplates,
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['tsconfig.eslint.json'],
                tsconfigRootDir: __dirname
            }
        },
        rules: {
            // plugin:@typescript-eslint
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-var-requires': 0,
            '@typescript-eslint/no-unused-vars': [
                1,
                {
                    argsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-duplicate-enum-values': 0,
            '@typescript-eslint/ban-tslint-comment': 1,

            // plugin:@angular-eslint
            '@angular-eslint/component-class-suffix': 0,
            '@angular-eslint/no-host-metadata-property': 0,
            '@angular-eslint/directive-class-suffix': 0,
            '@angular-eslint/no-output-rename': 0,
            '@angular-eslint/no-inputs-metadata-property': 0,
            '@angular-eslint/no-output-on-prefix': 0,
            '@angular-eslint/no-input-rename': 0,
            '@angular-eslint/no-outputs-metadata-property': 0,
            '@angular-eslint/no-output-native': 0,
            '@angular-eslint/prefer-on-push-component-change-detection': 0,
            '@angular-eslint/relative-url-prefix': 0,
            '@angular-eslint/component-max-inline-declarations': 0,
            '@angular-eslint/consistent-component-styles': 0,
            '@angular-eslint/use-component-view-encapsulation': 0,
            '@angular-eslint/use-injectable-provided-in': 0,
            '@angular-eslint/no-forward-ref': 0,
            '@angular-eslint/no-conflicting-lifecycle': 0,
            '@angular-eslint/no-attribute-decorator': 0,
            '@angular-eslint/no-pipe-impure': 0,
            '@angular-eslint/sort-ngmodule-metadata-arrays': 0,

            '@angular-eslint/prefer-signals': 0,
            '@angular-eslint/prefer-output-emitter-ref': 0,
            '@angular-eslint/prefer-inject': 0,

            // plugin:rxjs-x
            'rxjs-x/no-implicit-any-catch': 0,
            'rxjs-x/no-sharereplay': 0,
            'rxjs-x/no-internal': 0,
            'rxjs-x/no-unbound-methods': 0,
            'rxjs-x/no-topromise': 1,
            'rxjs-x/throw-error': 1,
            // These rules are new in eslint-plugin-rxjs-x's `recommended` set (they were not enabled by
            // the previous eslint-plugin-rxjs). Disabled to preserve the prior lint behavior.
            'rxjs-x/prefer-root-operators': 0,
            'rxjs-x/prefer-observer': 0
        }
    },

    // Rules for Angular templates
    {
        files: ['**/*.html'],
        extends: [
            /** @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/template-all.ts */
            angular.configs.templateAll
        ],
        languageOptions: {
            parser: angular.templateParser
        },
        rules: {
            // plugin:@angular-eslint/template
            '@angular-eslint/template/no-autofocus': 0,
            '@angular-eslint/template/elements-content': 0,
            '@angular-eslint/template/click-events-have-key-events': 0,
            '@angular-eslint/template/interactive-supports-focus': 0,
            '@angular-eslint/template/label-has-associated-control': 0,
            '@angular-eslint/template/i18n': 0,
            '@angular-eslint/template/no-call-expression': 0,
            '@angular-eslint/template/prefer-ngsrc': 0,
            '@angular-eslint/template/no-inline-styles': 0,
            '@angular-eslint/template/button-has-type': 0,
            '@angular-eslint/template/no-interpolation-in-attributes': 0,
            '@angular-eslint/template/no-any': 0,
            '@angular-eslint/template/prefer-static-string-properties': 0,
            '@angular-eslint/template/cyclomatic-complexity': 0,
            // Allow combining a static `class`/`style` attribute with its `[class]`/`[style]` binding.
            // Angular merges them via styling precedence, so this is a valid pattern (e.g. after the
            // NgClass -> [class] migration). Genuine duplicates (two static `class`, two `[class]`) are
            // still reported.
            '@angular-eslint/template/no-duplicate-attributes': [
                2,
                {
                    allowStylePrecedenceDuplicates: true
                }
            ]
        }
    },

    // Override rules for apps/docs
    {
        files: ['apps/docs/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-console': [1, { allow: ['warn', 'error'] }],
            'no-restricted-globals': [
                1,
                ...noRestrictedGlobalsOptionsForSSR
            ],

            // plugin:@angular-eslint
            '@angular-eslint/directive-selector': [
                1,
                {
                    type: 'attribute',
                    prefix: 'docs',
                    style: 'camelCase'
                }
            ],
            '@angular-eslint/component-selector': [
                1,
                {
                    type: 'element',
                    prefix: 'docs',
                    style: 'kebab-case'
                }
            ],
            '@angular-eslint/use-component-selector': 1,

            // plugin:@typescript-eslint
            '@typescript-eslint/naming-convention': [
                1,
                ...makeNamingConventionOptions('docs')
            ]
        }
    },

    // Override rules for packages/components-dev
    {
        files: ['packages/components-dev/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-restricted-globals': [
                1,
                ...noRestrictedGlobalsOptionsForSSR
            ],
            'no-console': 0,

            // plugin:@angular-eslint
            '@angular-eslint/directive-selector': [
                1,
                {
                    type: 'attribute',
                    prefix: 'dev',
                    style: 'camelCase'
                }
            ],
            '@angular-eslint/component-selector': [
                1,
                {
                    type: 'element',
                    prefix: 'dev',
                    style: 'kebab-case'
                }
            ],
            '@angular-eslint/use-component-selector': 1,
            '@angular-eslint/prefer-on-push-component-change-detection': 1,

            // plugin:@typescript-eslint
            '@typescript-eslint/naming-convention': [
                1,
                ...makeNamingConventionOptions('dev')
            ]
        }
    },

    // Override rules for packages/docs-examples
    {
        files: ['packages/docs-examples/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-restricted-globals': [
                1,
                ...noRestrictedGlobalsOptionsForSSR
            ],
            'no-console': 0,

            // plugin:@angular-eslint
            '@angular-eslint/use-component-selector': 1,
            '@angular-eslint/prefer-on-push-component-change-detection': 1
        }
    },

    // Override rules for packages/components
    {
        files: ['packages/components/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-restricted-globals': [
                1,
                ...noRestrictedGlobalsOptionsForSSR
            ],
            'no-restricted-properties': [
                1,
                ...noRestrictedPropertiesOptionsForSSR
            ]
        }
    },

    // Override rules for specs
    {
        files: ['**/*.spec.ts'],
        rules: {
            // plugin:eslint
            // ignore SSR restrictions in specs, because they are not executed in SSR context
            'no-restricted-globals': 0,
            'no-restricted-properties': 0,

            // plugin:@angular-eslint
            '@angular-eslint/use-component-selector': 0,
            '@angular-eslint/prefer-on-push-component-change-detection': 0
        }
    },

    // Override rules for e2e
    {
        files: ['**/*.playwright-spec.ts', '**/e2e.ts', 'packages/e2e/**/*.ts'],
        rules: {
            // plugin:eslint
            // ignore `noRestrictedGlobalsOptionsForSSR` in e2e tests, because they are not executed in SSR context
            'no-restricted-globals': 0,

            // plugin:@angular-eslint
            '@angular-eslint/directive-selector': [
                1,
                {
                    type: 'attribute',
                    prefix: 'e2e',
                    style: 'camelCase'
                }
            ],
            '@angular-eslint/component-selector': [
                1,
                {
                    type: 'element',
                    prefix: 'e2e',
                    style: 'kebab-case'
                }
            ],
            '@angular-eslint/use-component-selector': 1,
            '@angular-eslint/prefer-on-push-component-change-detection': 1,

            // plugin:@typescript-eslint
            '@typescript-eslint/naming-convention': [
                1,
                ...makeNamingConventionOptions('e2e')
            ]
        }
    },

    // Override rules for /tools
    {
        files: ['tools/**/*.ts', 'tools/**/*.js'],
        rules: {
            // plugin:eslint
            'no-console': 0,

            // plugin:@typescript-eslint
            // node-only build scripts may use require() for legacy CommonJS modules
            '@typescript-eslint/no-require-imports': 0
        }
    },

    // Override rules for /packages/schematics/
    {
        files: ['packages/schematics/**/*.ts', 'packages/schematics/**/*.js'],
        rules: {
            // plugin:eslint
            'no-console': 0
        }
    },

    // Override rules for /packages/cli/
    {
        files: ['packages/cli/**/*.ts', 'packages/cli/**/*.js'],
        rules: {
            // plugin:eslint
            'no-console': 0,

            // plugin:@typescript-eslint
            // node-only CLI scripts may use require() for legacy CommonJS modules
            '@typescript-eslint/no-require-imports': 0
        }
    },

    // plugin:prettier — must be last so it can turn off conflicting formatting rules
    {
        files: ['**/*.js', '**/*.ts', '**/*.html'],
        extends: [prettierRecommended]
    }
);
