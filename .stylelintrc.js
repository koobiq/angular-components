// @ts-check

const KEBAB_CASE_PATTERN = '^(_?[a-z][a-z0-9]*)(-[a-z0-9]+)*$';

const ALLOWED_PREFIXES = [
    // Default
    'kbq-',
    // packages/docs-examples
    'example-',
    // packages/components-dev
    'dev-',
    // apps/docs
    'docs-',
    // Angular specific
    'cdk-',
    // Angular specific
    'ng-',
    // @docsearch/css
    'DocSearch-',
    // highlight.js
    'hljs-',
    // overlayscrollbars
    'os-'
];

/** @type {import('stylelint').Config} */
const config = {
    defaultSeverity: 'error',
    allowEmptyInput: true,
    extends: [
        'stylelint-config-recommended-scss',
        // should be last
        'stylelint-prettier/recommended'
    ],
    rules: {
        'rule-empty-line-before': [
            'always-multi-line',
            {
                except: ['first-nested'],
                ignore: ['after-comment']
            }
        ],
        'no-descending-specificity': null,
        'selector-type-no-unknown': [
            true,
            {
                ignore: ['custom-elements'],
                ignoreTypes: ['app']
            }
        ],
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['ng-deep'] }],
        'font-family-no-missing-generic-family-keyword': [
            true,
            {
                ignoreFontFamilies: [
                    'Inter',
                    'Koobiq Icons',
                    'JetBrains Mono'
                ]
            }
        ],
        'selector-class-pattern': [
            `^_?(${ALLOWED_PREFIXES.join('|')})`,
            {
                resolveNestedSelectors: true
            }
        ],

        // SCSS rules
        'scss/operator-no-newline-after': null,
        'scss/selector-no-union-class-name': true,
        'scss/at-mixin-pattern': [KEBAB_CASE_PATTERN, { message: 'Expected @mixin name to be kebab-case.' }],
        'scss/no-unused-private-members': true
    }
};

module.exports = config;
