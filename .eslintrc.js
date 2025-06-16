// @ts-check

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
 * Rules for JavaScript and TypeScript files
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const javascriptAndTypescriptRules = {
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
};

/**
 * Rules for TypeScript files
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const typescriptRules = {
    files: ['*.ts'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname
    },
    extends: [
        /** @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/all.ts */
        'plugin:@typescript-eslint/recommended',
        /** @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/ts-all.ts */
        'plugin:@angular-eslint/all',
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
        '@angular-eslint/prefer-on-push-component-change-detection': 0,
        '@angular-eslint/relative-url-prefix': 0,
        '@angular-eslint/component-max-inline-declarations': 0,
        '@angular-eslint/consistent-component-styles': 0,
        '@angular-eslint/use-component-view-encapsulation': 0,
        '@angular-eslint/use-injectable-provided-in': 0,
        '@angular-eslint/no-forward-ref': 0,
        '@angular-eslint/prefer-standalone-component': 0,
        '@angular-eslint/prefer-standalone': 0,
        '@angular-eslint/sort-lifecycle-methods': 0,
        '@angular-eslint/prefer-output-readonly': 0,
        '@angular-eslint/no-conflicting-lifecycle': 0,
        '@angular-eslint/no-attribute-decorator': 0,
        '@angular-eslint/no-pipe-impure': 0,
        '@angular-eslint/sort-ngmodule-metadata-arrays': 0,

        // plugin:rxjs
        'rxjs/no-implicit-any-catch': 0,
        'rxjs/no-sharereplay': 0,
        'rxjs/no-internal': 0,
        'rxjs/no-unbound-methods': 0,
        'rxjs/no-topromise': 1,
        'rxjs/throw-error': 1
    }
};

/**
 * Rules for Angular templates
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const templateRules = {
    files: ['*.html'],
    extends: [
        /** @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/template-all.ts */
        'plugin:@angular-eslint/template/all'
    ],
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
        '@angular-eslint/template/attributes-order': 0,
        '@angular-eslint/template/no-any': 0
    }
};

/**
 * Override rules for dev components
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const componentsDevRules = {
    files: ['packages/components-dev/**/*.ts'],
    rules: {
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
        '@angular-eslint/prefer-standalone': 1,
        '@angular-eslint/use-component-selector': 1,
        '@angular-eslint/prefer-on-push-component-change-detection': 1,

        // plugin:@typescript-eslint
        '@typescript-eslint/naming-convention': [
            1,
            ...makeNamingConventionOptions('dev')]
    }
};

/**
 * Override rules for components examples
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const componentsExamplesRules = {
    files: ['packages/docs-examples/**/*.ts'],
    rules: {
        '@angular-eslint/prefer-standalone': 1,
        '@angular-eslint/use-component-selector': 1,
        '@angular-eslint/prefer-on-push-component-change-detection': 1
    }
};

/**
 * Override rules for docs
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const appDocsRules = {
    files: ['apps/docs/**/*.ts'],
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
        '@angular-eslint/prefer-standalone': 1,
        '@angular-eslint/use-component-selector': 1,

        // plugin:@typescript-eslint
        '@typescript-eslint/naming-convention': [
            1,
            ...makeNamingConventionOptions('docs')]
    }
};

/**
 * Override rules for specs
 *
 * @type {import('eslint').Linter.ConfigOverride}
 */
const specRules = {
    files: ['*.spec.ts', '*.karma-spec.ts'],
    rules: {
        '@angular-eslint/use-component-selector': 0,
        '@angular-eslint/prefer-on-push-component-change-detection': 0
    }
};

/** @type {import('eslint').Linter.ConfigOverride} */
const prettierRules = {
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
        'plugin:@eslint-community/eslint-comments/recommended'
    ],
    rules: {
        // plugin:file-progress
        'file-progress/activate': isCI ? 0 : 1,

        // plugin:@eslint-community/eslint-comments
        '@eslint-community/eslint-comments/no-unused-disable': 1,
        '@eslint-community/eslint-comments/disable-enable-pair': [1, { allowWholeFile: true }]
    },
    overrides: [
        javascriptAndTypescriptRules,
        typescriptRules,
        templateRules,
        appDocsRules,
        componentsDevRules,
        componentsExamplesRules,
        specRules,
        // should be last
        prettierRules
    ]
};

module.exports = config;
