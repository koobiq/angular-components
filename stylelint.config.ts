import type { Config } from 'stylelint';

/**
 * Options of `selector-class-pattern`: the components use `ViewEncapsulation.None`, so every class is global and starts
 * with the prefix of its package.
 *
 * @see https://stylelint.io/user-guide/rules/selector-class-pattern
 */
const makeSelectorClassPatternOptions = (prefixes: string[] = []): [string, { resolveNestedSelectors: boolean }] => {
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
 * Pattern of `keyframes-name-pattern`: keyframes are global like the classes, so a name is kebab-case and starts with
 * the prefix of its package.
 *
 * @see https://stylelint.io/user-guide/rules/keyframes-name-pattern
 */
const makeKeyframesNamePattern = (prefixes: string[] = []): string =>
    `^(${['kbq-', ...prefixes].join('|')})[a-z0-9]+(-[a-z0-9]+)*$`;

const config: Config = {
    ignoreFiles: [
        '**/dist/**',
        '**/node_modules/**',
        '**/coverage/**',
        // a separate npm project with its own Angular, see its README
        'tools/check-angular/**',
        // Playwright's output: the HTML report embeds the minified trace viewer, whose bundled CSS would bury real
        // errors under hundreds of complaints about someone else's stylesheet
        '**/playwright-report/**',
        '**/playwright-report-docs/**',
        '**/test-results/**',
        // the generated theme of the docs site
        'apps/docs/src/styles/koobiq/default-theme/**'
    ],
    defaultSeverity: 'error',
    allowEmptyInput: true,
    // A disable comment names its rule, says why and goes once the rule no longer needs it
    reportNeedlessDisables: true,
    reportInvalidScopeDisables: true,
    reportDescriptionlessDisables: true,
    reportUnscopedDisables: true,
    plugins: ['./tools/stylelint/no-unused-use.mts'],
    extends: [
        'stylelint-config-standard-scss',
        './tools/stylelint/order.mts',
        // should be last
        'stylelint-prettier/recommended'
    ],
    rules: {
        // plugin:stylelint
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
        // The packages add their prefixes below
        'selector-class-pattern': makeSelectorClassPatternOptions(),
        'keyframes-name-pattern': makeKeyframesNamePattern(),
        // The `@use` and `@forward` statements of a file and the `@include` and `@extend` calls of a block read as lists:
        // an empty line before them, none between two of the same kind. Sass itself keeps `@use` and `@forward` at the
        // top of a file
        'at-rule-empty-line-before': [
            'always',
            {
                except: ['blockless-after-same-name-blockless', 'first-nested'],
                ignore: ['after-comment'],
                ignoreAtRules: ['/^(?!include$|extend$|use$|forward$)/']
            }
        ],
        // An empty line before a declaration that follows anything but a declaration, such as the calls; the empty lines
        // between the declarations are `order/properties-order`'s
        'declaration-empty-line-before': [
            'always',
            { except: ['first-nested'], ignore: ['after-declaration', 'after-comment', 'inside-single-line-block'] }
        ],
        // The custom properties and the `$` variables of a block are lists of their own as well: an empty line before
        // each list, the empty lines inside it are up to its author
        'custom-property-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['after-comment', 'after-custom-property', 'inside-single-line-block']
            }
        ],
        // A comment goes where its author puts it, and prettier formats the rest
        'comment-empty-line-before': null,
        // A pair of longhands reads clearer than the `inset` or `flex-flow` it would be folded into
        'declaration-block-no-redundant-longhand-properties': null,
        // `:not(.a):not(.b)` weighs two classes and `:not(.a, .b)` one, so the fix would change which rule wins
        'selector-not-notation': null,
        // A mixin argument may end up in `calc()`, where `0` without a unit is invalid
        'length-zero-no-unit': null,
        // The supported browsers still need some of them, `-webkit-user-select` in Safari among others
        'property-no-vendor-prefix': null,
        'selector-no-vendor-prefix': null,
        'value-no-vendor-prefix': null,
        'at-rule-no-vendor-prefix': null,
        // `& { }` around the body of a mixin is deliberate: dropping it moves the declarations relative to the nested
        // rules of the caller
        'block-no-redundant-nested-style-rules': null,

        // plugin:stylelint-scss
        'scss/operator-no-newline-after': null,
        'scss/selector-no-union-class-name': true,
        'scss/no-unused-private-members': true,
        'scss/double-slash-comment-empty-line-before': null,
        // As `custom-property-empty-line-before` above
        'scss/dollar-variable-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['after-comment', 'after-dollar-variable', 'inside-single-line-block']
            }
        ],
        // `@include name()` and `@include name` are the same call
        'scss/at-mixin-argumentless-call-parentheses': null,
        // A namespace says where a name comes from, and only with one `koobiq/no-unused-use` can tell what is read
        'scss/at-use-no-unnamespaced': true,

        // plugin:koobiq
        'koobiq/no-unused-use': true
    },
    overrides: [
        // packages/components
        {
            files: ['packages/components/**/*.{scss,css}'],
            rules: {
                'selector-class-pattern': makeSelectorClassPatternOptions([
                    // highlight.js
                    'hljs-',
                    // overlayscrollbars
                    'os-'
                ]),
                // overlayscrollbars
                'keyframes-name-pattern': makeKeyframesNamePattern(['os-'])
            }
        },

        // packages/components-dev
        {
            files: ['packages/components-dev/**/*.{scss,css}'],
            rules: {
                'selector-class-pattern': makeSelectorClassPatternOptions(['dev-']),
                'keyframes-name-pattern': makeKeyframesNamePattern(['dev-']),
                // Every dev app has a stylesheet, whether or not it has rules yet
                'no-empty-source': null
            }
        },

        // packages/docs-examples
        {
            files: ['packages/docs-examples/**/*.{scss,css}'],
            rules: {
                'selector-class-pattern': makeSelectorClassPatternOptions(['example-']),
                'keyframes-name-pattern': makeKeyframesNamePattern(['example-'])
            }
        },

        // apps/docs
        {
            files: ['apps/docs/**/*.{scss,css}'],
            rules: {
                'selector-class-pattern': makeSelectorClassPatternOptions([
                    'docs-',
                    // @docsearch/css
                    'DocSearch-'
                ]),
                'keyframes-name-pattern': makeKeyframesNamePattern(['docs-'])
            }
        },

        // packages/e2e
        {
            files: ['packages/e2e/**/*.{scss,css}'],
            rules: {
                'selector-class-pattern': makeSelectorClassPatternOptions(['e2e-']),
                'keyframes-name-pattern': makeKeyframesNamePattern(['e2e-'])
            }
        }
    ]
};

export default config;
