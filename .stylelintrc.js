// @ts-check

const kebabCasePattern = '^(_?[a-z][a-z0-9]*)(-[a-z0-9]+)*$';

/**
 * @see https://stylelint.io/user-guide/rules/selector-class-pattern
 *
 * @param {string[]} prefixes
 */
const makeSelectorClassPatternOptions = (prefixes = []) => {
    const allowedPrefixes = [
        // Default
        'kbq-',
        // Angular specific
        'cdk-',
        // Angular specific
        'ng-'
    ];

    return [
        `^_?(${allowedPrefixes.concat(prefixes).join('|')})`,
        {
            resolveNestedSelectors: true
        }
    ];
};

/**
 * Override rules for packages/components
 *
 * @type {import('stylelint').Config['overrides']}
 */
const componentsRules = [
    {
        files: ['packages/components/**/*.scss', 'packages/components/**/*.css'],
        rules: {
            'selector-class-pattern': makeSelectorClassPatternOptions([
                // highlight.js
                'hljs-',
                // overlayscrollbars
                'os-'
            ])
        }
    }
];

/**
 * Override rules for packages/components-dev
 *
 * @type {import('stylelint').Config['overrides']}
 */
const componentsDevRules = [
    {
        files: ['packages/components-dev/**/*.scss', 'packages/components-dev/**/*.css'],
        rules: {
            'selector-class-pattern': makeSelectorClassPatternOptions(['dev-'])
        }
    }
];

/**
 * Override rules for packages/e2e
 *
 * @type {import('stylelint').Config['overrides']}
 */
const e2eRules = [
    {
        files: ['packages/e2e/**/*.scss', 'packages/e2e/**/*.css'],
        rules: {
            'selector-class-pattern': makeSelectorClassPatternOptions(['e2e-'])
        }
    }
];

/**
 * Override rules for packages/docs-examples
 *
 * @type {import('stylelint').Config['overrides']}
 */
const componentsExamplesRules = [
    {
        files: ['packages/docs-examples/**/*.scss', 'packages/docs-examples/**/*.css'],
        rules: {
            'selector-class-pattern': makeSelectorClassPatternOptions(['example-'])
        }
    }
];

/**
 * Override rules for apps/docs
 *
 * @type {import('stylelint').Config['overrides']}
 */
const docsRules = [
    {
        files: ['apps/docs/**/*.scss', 'apps/docs/**/*.css'],
        rules: {
            'selector-class-pattern': makeSelectorClassPatternOptions([
                'docs-',
                // @docsearch/css
                'DocSearch-'
            ])
        }
    }
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
        'selector-class-pattern': makeSelectorClassPatternOptions(),

        // SCSS rules
        'scss/operator-no-newline-after': null,
        'scss/selector-no-union-class-name': true,
        'scss/at-mixin-pattern': [kebabCasePattern, { message: 'Expected @mixin name to be kebab-case.' }],
        'scss/no-unused-private-members': true
    },
    overrides: [
        ...componentsRules,
        ...componentsDevRules,
        ...componentsExamplesRules,
        ...docsRules,
        ...e2eRules
    ]
};

module.exports = config;
