// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
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
        'file-progress/activate': process.env.GITHUB_ACTION ? 0 : 1,
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
            rules: {
                // plugin:eslint
                'no-self-assign': 0,
                'no-prototype-builtins': 0,
                'no-console': [
                    1,
                    {
                        allow: ['info', 'warn', 'error']
                    }
                ],
                // plugin:promise
                'promise/catch-or-return': 0,
                'promise/always-return': 0
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
                'rxjs/no-topromise': 1,
                'rxjs/throw-error': 2
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
                '@angular-eslint/template/prefer-self-closing-tags': 2
            }
        },
        {
            files: ['*.js', '*.ts', '*.html'],
            extends: [
                // should be last
                'plugin:prettier/recommended'
            ]
        }
    ]
};

module.exports = config;
