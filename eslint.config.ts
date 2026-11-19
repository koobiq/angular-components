import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylistic from '@stylistic/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import angular from 'angular-eslint';
import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import rxjs from 'eslint-plugin-rxjs-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { importsConfig } from './tools/eslint/imports';
import { publishedJsDocConfig } from './tools/eslint/jsdoc';

const capitalizeFirst = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @see https://typescript-eslint.io/rules/naming-convention/#options
 */
const makeNamingConventionOptions = (prefix: string) => {
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
 * An app of the repository prefixes its selectors and its exported names, so that nothing of it is taken for a part of
 * the library.
 */
const makeAppPrefixRules = (prefix: string): Linter.RulesRecord => ({
    '@angular-eslint/directive-selector': [1, { type: 'attribute', prefix, style: 'camelCase' }],
    '@angular-eslint/component-selector': [1, { type: 'element', prefix, style: 'kebab-case' }],
    '@typescript-eslint/naming-convention': [1, ...makeNamingConventionOptions(prefix)]
});

/**
 * `@angular/animations` is deprecated: the components animate with CSS, waited for with `kbqAfterAnimations`, and
 * templates with `animate.enter`/`animate.leave`.
 *
 * @see https://eslint.org/docs/latest/rules/no-restricted-imports
 */
const noAngularAnimationsImports = [
    {
        group: [
            '@angular/animations',
            '@angular/animations/*',
            '@angular/platform-browser/animations',
            '@angular/platform-browser/animations/*'
        ],
        message: 'Animate with CSS and `animate.enter`/`animate.leave`: @angular/animations is deprecated.'
    }
];

/** Components render without zone.js, where these events of NgZone never fire. */
const noZoneEventsSyntax = {
    selector: 'MemberExpression[property.name=/^(onStable|onUnstable|onMicrotaskEmpty)$/]',
    message:
        'NgZone never emits this without zone.js: run the work in afterNextRender, or notify change detection with a ' +
        'signal or markForCheck().'
};

/**
 * @see https://eslint.org/docs/latest/rules/no-restricted-globals
 */
const noRestrictedGlobalsOptionsForSSR = (() => {
    const restrictedWindowGlobals: Array<keyof Window> = [
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

/** The code that runs in Node rather than in a browser or on the Angular server. */
const nodeCode = [
    '*.{js,cjs,mjs,ts,cts,mts}',
    'tools/**/*.{js,cjs,mjs,ts,cts,mts}',
    'packages/{cli,mcp,schematics}/**/*.{js,cjs,mjs,ts,cts,mts}'
];

export default defineConfig(
    // Global ignores (ported from .eslintignore)
    {
        ignores: [
            // `**/` matters: a bare pattern is anchored to this config's directory, so it would
            // only cover the root folders. Nested build output such as packages/cli/dist would
            // still be linted — and since that is a multi-megabyte minified bundle, linting it
            // makes `yarn eslint` appear to hang. CI never hit it only because linters run on a
            // fresh checkout that has not built anything.
            '**/dist',
            '**/node_modules',
            '**/coverage',
            // Playwright's output, for the same reason as dist: the HTML report embeds the trace
            // viewer, which is minified vendor code, and linting it produces ~90 errors and ~700
            // warnings about someone else's bundle. playwright-report and test-results are mounted
            // out of the container by tools/e2e/docker-compose.yml; playwright-report-docs is the
            // docs-site smoke suite's report (playwright.docs.config.ts). All three appear as soon
            // as anyone runs the relevant suite locally — and, like dist, never on the fresh
            // checkout CI lints.
            '**/playwright-report',
            '**/playwright-report-docs',
            '**/test-results',
            // ignore Yarn's bundled release/plugin binaries (flat config lints .cjs by default,
            // unlike the previous `--ext=.js,.ts,.html`)
            '.yarn',
            // ignore the local tooling directories: `eslint .` walks into them, and the files there
            // (worktree copies of the repository, local settings) belong to no tsconfig project, so the
            // type-aware rules fail on them; .claude/rules holds Markdown only
            '.ai',
            '.claude',
            // the local cache of the Angular CLI: its prebundled dependencies are ES modules in `.js` files
            '.angular',
            // a separate npm project with its own Angular and its own runner, see its README
            'tools/check-angular',
            // ignore build tokens
            'apps/docs/src/styles/koobiq/default-theme/',
            // ignore index.html
            '**/index.html',
            // ignore mocks
            '**/mock.ts',
            // excerpts lifted verbatim from published .d.ts files — linting them would rewrite
            // them to this repository's style, which is exactly what the fixture must not be
            'packages/mcp/test/fixtures/packages/**/*.d.ts'
        ]
    },

    // plugin:@eslint-community/eslint-comments
    {
        extends: [comments.recommended],
        rules: {
            '@eslint-community/eslint-comments/no-unused-disable': 1,
            '@eslint-community/eslint-comments/disable-enable-pair': [1, { allowWholeFile: true }]
        }
    },

    // JavaScript and TypeScript: every rule set the repository uses, with the rules it turns off everywhere. The
    // directories below only relax or tune them
    {
        files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
        extends: [
            eslint.configs.recommended,
            promise.configs['flat/recommended'],
            /** @see https://typescript-eslint.io/users/configs/#strict */
            tseslint.configs.strict,
            /** @see https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/ts-all.ts */
            angular.configs.tsAll,
            /** @see https://github.com/JasonWeinzierl/eslint-plugin-rxjs-x/blob/main/src/configs/strict.ts */
            rxjs.configs.strict
        ],
        plugins: {
            '@stylistic': stylistic
        },
        processor: angular.processInlineTemplates,
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname
            },
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        },
        rules: {
            // plugin:eslint
            'no-console': 1,
            // `@typescript-eslint/no-unused-vars` checks JavaScript too
            'no-unused-vars': 0,
            'no-restricted-imports': [2, { patterns: noAngularAnimationsImports }],
            // The library and the apps render on the server; the Node code and the tests turn it off below
            'no-restricted-globals': [
                1,
                ...noRestrictedGlobalsOptionsForSSR
            ],

            // plugin:promise
            // A `then` with a rejection handler and a `finally` after a `catch` end a chain as well
            'promise/catch-or-return': [2, { allowThen: true, allowFinally: true }],
            // The last callback of a chain has nothing to return to
            'promise/always-return': [2, { ignoreLastCallback: true }],

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
            ],

            // plugin:@typescript-eslint
            // Over a thousand `any` remain in the code; `check-public-api-any` keeps their number in the published
            // typings from growing
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-unused-vars': [
                1,
                {
                    argsIgnorePattern: '^_',
                    enableAutofixRemoval: { imports: true }
                }
            ],
            '@typescript-eslint/ban-tslint-comment': 1,
            // `!` stays where a check next to it proves the value, which the rule cannot see
            '@typescript-eslint/no-non-null-assertion': 0,
            // An NgModule, a directive or a pipe is a class with a decorator and no members of its own, and the
            // validators of `core` are a published class with static members only
            '@typescript-eslint/no-extraneous-class': [2, { allowWithDecorator: true, allowStaticOnly: true }],
            // `void` comes from Angular (`output<void>()`), from the CDK (`CdkScrollable | void`) and from the published
            // types, which keep it
            '@typescript-eslint/no-invalid-void-type': 0,
            // Joining published overloads into one signature changes the typings
            '@typescript-eslint/unified-signatures': 0,

            // plugin:@angular-eslint
            // The published classes are named without the suffix (`KbqButton`), and renaming them breaks the API
            '@angular-eslint/component-class-suffix': 0,
            '@angular-eslint/directive-class-suffix': 0,
            // The published inputs and outputs keep their names: an alias, the `on` prefix and a native event name
            // are part of the API
            '@angular-eslint/no-input-rename': 0,
            '@angular-eslint/no-output-rename': 0,
            '@angular-eslint/no-output-on-prefix': 0,
            '@angular-eslint/no-output-native': 0,
            // A small component keeps its template inline, as AGENTS.md asks, while the rule allows three lines
            '@angular-eslint/component-max-inline-declarations': 0,
            // The components use `ViewEncapsulation.None` on purpose: their classes are global and carry the prefix
            '@angular-eslint/use-component-view-encapsulation': 0,
            // A service that a component, a module or a provider function supplies stays out of the root injector
            '@angular-eslint/use-injectable-provided-in': 0,
            // A provider refers to the class it is declared on through `forwardRef`, as `NG_VALUE_ACCESSOR` does
            '@angular-eslint/no-forward-ref': 0,
            // The deprecated `*ImpurePipe` date pipes are impure by design until their removal in 22.0.0
            '@angular-eslint/no-pipe-impure': 0,

            // plugin:rxjs-x
            // Most subscriptions follow streams that never fail, such as `valueChanges` and DOM events: a handler on each
            // would be noise
            'rxjs-x/no-ignored-error': 0,
            // The published classes expose their streams as `Subject`: hiding them changes the API
            'rxjs-x/no-exposed-subjects': 0,
            // Reports the arrow-function fields passed to `subscribe` too, which keep their `this`
            'rxjs-x/no-unbound-methods': 0,
            'rxjs-x/no-topromise': 1,
            'rxjs-x/throw-error': 1
        }
    },

    // Order of imports and exports, and cycles between modules
    importsConfig,

    // CommonJS: a `.cjs` file, and a `.js` one, since no package with JavaScript in it is `"type": "module"`.
    // typescript-eslint parses every file as a module, so the source type is set here
    {
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            sourceType: 'commonjs'
        },
        rules: {
            // CommonJS loads a module with `require()`
            '@typescript-eslint/no-require-imports': 0
        }
    },

    // Angular templates: every rule of template-all, with the rules the repository turns off everywhere
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
            // The texts come from the locale configuration, not from Angular i18n
            '@angular-eslint/template/i18n': 0,
            // A template reads a signal by calling it
            '@angular-eslint/template/no-call-expression': 0,
            // An example or a dev app styles its demo in place
            '@angular-eslint/template/no-inline-styles': 0,
            // A template of a component is as complex as its states
            '@angular-eslint/template/cyclomatic-complexity': 0,
            // These components render the content of their host element themselves
            '@angular-eslint/template/elements-content': [
                2,
                { allowList: ['kbq-navbar-toggle', 'kbq-app-switcher-list-item', 'kbq-app-switcher-dropdown-app'] }
            ],
            // A static attribute also lands on the host element, unlike a binding: `[class]` of `kbq-dropdown` sets
            // the classes of its panel only, and a static `title` on a component shows the native tooltip as well
            '@angular-eslint/template/prefer-static-string-properties': [2, { ignore: ['class', 'title'] }],
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

    // packages/components
    {
        files: ['packages/components/**/*.ts'],
        rules: {
            // plugin:eslint
            // Components render without zone.js, where these events never fire
            'no-restricted-syntax': [1, noZoneEventsSyntax]
        }
    },

    // packages/components, the code of the library: a field says what it holds. `!` keeps the compiler quiet about a
    // field that is `undefined` until something sets it, and the published typings promise a value to whoever reads it
    // first
    {
        files: ['packages/components/**/*.ts'],
        ignores: ['**/*.spec.ts', '**/*.spec-helper.ts', '**/*.playwright-spec.ts', '**/e2e.ts'],
        rules: {
            'no-restricted-syntax': [
                1,
                noZoneEventsSyntax,
                {
                    selector: 'PropertyDefinition[definite=true]',
                    message:
                        'Give the field a value, a constructor parameter or `abstract`, or type it `| undefined`: with ' +
                        '`!` it is `undefined` until set, whatever its type says.'
                }
            ]
        }
    },

    // packages/components, the deprecated entry points: they keep the decorator API until their removal in 22.0.0
    {
        files: ['packages/components/**/deprecated/**/*.ts'],
        rules: {
            '@angular-eslint/prefer-signals': 0,
            '@angular-eslint/prefer-output-emitter-ref': 0
        }
    },

    // packages/components-dev
    {
        files: ['packages/components-dev/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-console': 0,

            ...makeAppPrefixRules('dev')
        }
    },

    // packages/docs-examples
    {
        files: ['packages/docs-examples/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-console': 0
        }
    },

    // apps/docs
    {
        files: ['apps/docs/**/*.ts'],
        rules: {
            // plugin:eslint
            'no-console': [1, { allow: ['warn', 'error'] }],

            ...makeAppPrefixRules('docs')
        }
    },

    // The templates of the library, the examples, the dev apps and the e2e app are yet to be reviewed for
    // accessibility; the docs app passes these rules
    {
        files: [
            'packages/components/**/*.html',
            'packages/components-dev/**/*.html',
            'packages/docs-examples/**/*.html',
            'packages/e2e/**/*.html'
        ],
        rules: {
            '@angular-eslint/template/click-events-have-key-events': 0,
            '@angular-eslint/template/interactive-supports-focus': 0,
            '@angular-eslint/template/label-has-associated-control': 0
        }
    },

    // The templates of the unit specs and the e2e app are test hosts: they reach no consumer, so their buttons may go
    // without `type`, and an empty element is one of the states they test
    {
        files: [
            '**/*.spec.ts/*.html',
            'packages/e2e/**/*.html',
            '**/e2e.ts/*.html'
        ],
        rules: {
            '@angular-eslint/template/button-has-type': 0,
            '@angular-eslint/template/elements-content': 0
        }
    },

    // The dev apps reach no consumer either, so their buttons may go without `type`
    {
        files: ['packages/components-dev/**/*.html'],
        rules: {
            '@angular-eslint/template/button-has-type': 0
        }
    },

    // packages/e2e and the e2e scenarios of the components
    {
        files: ['**/e2e.ts', 'packages/e2e/**/*.ts'],
        rules: {
            // plugin:eslint
            // The e2e app does not render on the server
            'no-restricted-globals': 0,

            ...makeAppPrefixRules('e2e')
        }
    },

    // Playwright code: the e2e specs and the helpers they share
    {
        files: ['**/*.playwright-spec.ts', 'packages/e2e/utils/**/*.ts'],
        extends: [playwright.configs['flat/recommended']],
        rules: {
            // plugin:playwright — on top of the recommended set, errors for a hardcoded wait, the flake this
            // suite keeps rediscovering, and for a `page.pause()` left over from debugging.
            'playwright/no-wait-for-timeout': 2,
            'playwright/no-page-pause': 2,
            'playwright/expect-expect': [
                2,
                {
                    // The rule matches identifiers exactly, so the helpers that hold the assertions are
                    // listed here. An e2e helper that asserts is named for what it expects.
                    assertFunctionNames: [
                        'expect',
                        'e2eExpectNoScrollbarAfterFlash',
                        'expectIconsCentred',
                        'expectNameSplitWithoutOverflow',
                        'expectSidepanelType'
                    ]
                }
            ],
            'playwright/no-conditional-expect': 2,
            // A skip on what the browser supports reports the test as not run, where an early return would pass it
            'playwright/no-skipped-test': [1, { allowConditional: true }],
            // plugin:eslint
            // A spec drives a browser from Node, not an app that renders on the server
            'no-restricted-globals': 0,
            // The e2e app is zoneless, so the render an action causes lands a task or a frame
            // later and a value read once right after it is the one from before: the flake most of
            // docs/e2e-flakiness.md comes down to. A value that cannot change, such as a response body, is read
            // into a constant first. `expect` and `expect.soft` alike, with the read anywhere in the subject
            // (`expect(f(await …))`, `expect((await …).y)`) but not inside a function passed to it (`toPass`).
            'no-restricted-syntax': [
                2,
                ...[
                    '> AwaitExpression',
                    '> :not(ArrowFunctionExpression, FunctionExpression) AwaitExpression'
                ].map((read) => ({
                    selector: `CallExpression:matches([callee.name="expect"], [callee.object.name="expect"][callee.property.name="soft"]) ${read}`,
                    message:
                        'A value read once can predate the render the last action causes: assert on the locator, ' +
                        'which retries, or use expect.poll().'
                }))
            ]
        }
    },

    // Unit specs: they run in Node without zone.js, as the library does, awaiting `fixture.whenStable()` and driving
    // time with Vitest's fake timers
    {
        files: ['**/*.spec.ts', '**/*.spec-helper.ts'],
        extends: [vitest.configs.recommended],
        rules: {
            // plugin:vitest — on top of the recommended set, the helpers that hold a test's assertions and an
            // async assertion that has to be awaited.
            // A helper that holds a test's assertions is listed by its exact name: a wildcard also matches
            // any call on a variable named the same way, such as `checkbox.click()`.
            'vitest/expect-expect': [
                2,
                {
                    assertFunctionNames: [
                        'expect',
                        '*.expect',
                        'checkDirection',
                        'checkSelectedIndex',
                        'expectCustomScrollbars',
                        'expectFlatTreeToMatch',
                        'expectObservable',
                        'expectPipeStyle',
                        'runModifierKeyTest',
                        'shouldFocusReturnButtonWith',
                        'shouldRefocusSaveButtonWith',
                        'shouldSelectActiveOptionAndRestoreFocus'
                    ]
                }
            ],
            // `toHaveNoViolations` runs axe-core, so it is an async assertion too
            'vitest/valid-expect': [2, { alwaysAwait: true, asyncMatchers: ['toHaveNoViolations'] }],
            // `describe(KbqButton.name)` and `describe(SCHEMATIC_NAME)` follow a rename on their own
            'vitest/valid-title': [2, { ignoreTypeOfDescribeName: true }],

            // plugin:eslint
            // A spec does not render on the server
            'no-restricted-globals': 0,
            'no-restricted-imports': [
                2,
                {
                    patterns: noAngularAnimationsImports,
                    paths: [
                        {
                            name: '@angular/core/testing',
                            importNames: [
                                'fakeAsync',
                                'tick',
                                'flush',
                                'flushMicrotasks',
                                'discardPeriodicTasks',
                                'waitForAsync'
                            ],
                            message:
                                'The tests run without zone.js: await fixture.whenStable() and use vi.useFakeTimers() instead.'
                        }
                    ]
                }
            ],

            // plugin:rxjs-x
            // A spec waits for a value the code under test has to emit: a default would let a missing one pass
            'rxjs-x/no-ignored-default-value': 0,

            // plugin:@angular-eslint
            // A test host is declared next to its test and never rendered by an app
            '@angular-eslint/use-component-selector': 0,
            '@angular-eslint/prefer-on-push-component-change-detection': 0,

            // plugin:@typescript-eslint
            // A stub stands in for a class the code under test only needs to exist
            '@typescript-eslint/no-extraneous-class': [
                2,
                { allowWithDecorator: true, allowStaticOnly: true, allowEmpty: true }
            ]
        }
    },

    // Node code: the configs of the repository, its tools and the packages that run in Node
    {
        files: nodeCode,
        rules: {
            // plugin:eslint
            // Node has no server rendering to protect
            'no-restricted-globals': 0
        }
    },

    // tools, packages/schematics and packages/cli: scripts that report to the terminal
    {
        files: [
            'tools/**/*.{js,cjs,mjs,ts,cts,mts}',
            'packages/{cli,schematics}/**/*.{js,cjs,mjs,ts,cts,mts}'
        ],
        rules: {
            // plugin:eslint
            'no-console': 0
        }
    },

    // tools/vitest: the test setup fills in the browser classes jsdom lacks with empty stubs
    {
        files: ['tools/vitest/**/*.ts'],
        rules: {
            '@typescript-eslint/no-extraneous-class': [
                2,
                { allowWithDecorator: true, allowStaticOnly: true, allowEmpty: true }
            ]
        }
    },

    // JSDoc of the published Angular packages, which the docs are generated from or are to be
    publishedJsDocConfig,

    // plugin:prettier — must be last so it can turn off conflicting formatting rules
    {
        files: ['**/*.{js,cjs,mjs,ts,cts,mts,html}'],
        extends: [prettierRecommended]
    }
);
