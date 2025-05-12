// @ts-check

const isCI = !!process.env.CI;

/** @type {import('eslint').Linter.ConfigOverride} */
const PRETTIER = {
    files: ['*.js', '*.ts', '*.html'],
    extends: ['plugin:prettier/recommended']
};

/** @type {import('eslint').Linter.Config} */
const config = {
    root: true,
    env: {
        es2022: true,
        commonjs: true,
        node: true
    },
    plugins: [
        'file-progress'
    ],
    extends: [
        'plugin:eslint-comments/recommended'
    ],
    rules: {
        // plugin:file-progress
        'file-progress/activate': isCI ? 0 : 1,

        // plugin:eslint-comments
        'eslint-comments/no-unused-disable': 1
    },
    overrides: [
        {
            files: ['*.js', '*.ts'],
            extends: [
                'eslint:recommended',
                'plugin:promise/recommended'
            ],
            plugins: [
                '@stylistic'
            ],
            rules: {
                // plugin:eslint
                'no-useless-escape': 0,
                'no-self-assign': 0,
                'no-prototype-builtins': 0,

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
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: __dirname
            },
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@angular-eslint/recommended',
                'plugin:@angular-eslint/template/process-inline-templates',
                'plugin:rxjs/recommended'
            ],
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
                '@angular-eslint/no-async-lifecycle-method': 1,
                '@angular-eslint/contextual-decorator': 1,

                // plugin:rxjs
                'rxjs/no-implicit-any-catch': 0,
                'rxjs/no-sharereplay': 0,
                'rxjs/no-internal': 0,
                'rxjs/no-unbound-methods': 0,
                'rxjs/no-topromise': 1,
                'rxjs/throw-error': 1
            }
        },
        {
            // Override rules for docs app
            files: ['./apps/docs/**/*.ts'],
            rules: {
                // plugin:eslint
                'no-console': [1, { allow: ['warn', 'error'] }],

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
                '@angular-eslint/prefer-standalone-component': 1,
                '@angular-eslint/use-component-selector': 1
            }
        },
        {
            // Override rules for test files
            files: ['*.spec.ts', '*.karma-spec.ts'],
            rules: {
                '@angular-eslint/use-component-selector': 0
            }
        },
        {
            files: ['*.html'],
            extends: [
                'plugin:@angular-eslint/template/recommended',
                'plugin:@angular-eslint/template/accessibility'
            ],
            rules: {
                // plugin:@angular-eslint/template
                '@angular-eslint/template/no-autofocus': 0,
                '@angular-eslint/template/elements-content': 0,
                '@angular-eslint/template/click-events-have-key-events': 0,
                '@angular-eslint/template/interactive-supports-focus': 0,
                '@angular-eslint/template/label-has-associated-control': 0,
                '@angular-eslint/template/prefer-self-closing-tags': 1,
                '@angular-eslint/template/prefer-control-flow': 1
            }
        },
        // should be last
        PRETTIER
    ]
};

module.exports = config;
