import type { AreaData, Replacement } from '../data';

/** An `@include` of a mixin that takes no arguments any more, through a module namespace or not. */
const ARGUMENTLESS_MIXIN = '(@include\\s+(?:[\\w-]+\\.)?(?:koobiq-theme|koobiq-typography|kbq-core-theme))';

const LIGHT_AND_DARK_THEMES: Replacement = {
    from: '(@koobiq/components/prebuilt-themes/)(?:light|dark)-theme\\.css',
    to: '$1theme.css'
};

/** A line that loads a style sheet: `@use`, `@import`, `@forward`, `<link>`, or a side-effect `import '…'`. */
const LOAD_LINE = `[ \\t]*(?:@(?:use|import|forward)\\s|<link\\s|import\\s*['"])[^\\r\\n]*`;

/** A line an import block holds besides the loads: a blank line or a one-line comment. */
const IMPORT_BLOCK_LINE = `(?:${LOAD_LINE}|[ \\t]*(?://[^\\r\\n]*|/\\*.*?\\*/|<!--.*?-->)?[ \\t]*)`;

/**
 * Drops a line that repeats an earlier line loading `theme.css` in the same import block, as a file that loaded
 * both themes is left with. Only a load followed by loads, blank lines and comments: anywhere else the two lines
 * stand in different branches, such as the cases of a `switch` or two `@media` blocks.
 */
const REPEATED_THEME_LINE: Replacement = {
    from:
        `(?<=^|\\n)(${LOAD_LINE}@koobiq/components/prebuilt-themes/theme\\.css[^\\r\\n]*)` +
        `((?:\\r?\\n${IMPORT_BLOCK_LINE})*?)\\r?\\n\\1(?=\\r?\\n|$)`,
    to: '$1$2'
};

const MARKDOWN_CLASS = '(h[1-6]|body-mono|body|caption|table-cell|table-header)';

/** A markdown typography class used as a selector: in a style sheet, an inline `<style>`, `[class.…]`, a query. */
const MARKDOWN_CLASS_SELECTOR: Replacement = {
    from: `\\.md-${MARKDOWN_CLASS}(?![\\w-])`,
    to: '.kbq-md-$1'
};

/** The `kbq-scrollbar` class token: not the `<kbq-scrollbar>` element, nor a class that starts with it. */
const SCROLLBAR_CLASS = 'kbq-scrollbar(?![\\w-])';
const QUOTED_SCROLLBAR_CLASS = `['"\`]${SCROLLBAR_CLASS}['"\`]`;

/**
 * Removed in 21.0.0: the arguments of `koobiq-theme()`, `koobiq-typography()` and `kbq-core-theme()`,
 * `kbq-contrast()`, `kbq-palette()`, `kbq-color()`, `kbq-typography-config()`, `core/styles/tokens`, the prebuilt
 * `light-theme.css` and `dark-theme.css`, the unprefixed markdown typography classes (`md-h1`, …), and the Sass
 * modules, mixins, functions and timing variables nothing in the library used. Also reports, deprecated for removal
 * in 22.0.0, `kbq-light-theme()`, `kbq-dark-theme()`, the `kbq-scrollbar` class with `kbq-scrollbar-theme()`, and
 * the `--kbq-scrollbar-*` variables of that class the new scrollbar does not share.
 */
export const styles: AreaData = {
    templateReplacements: [
        LIGHT_AND_DARK_THEMES,
        REPEATED_THEME_LINE,
        {
            from: `(?<=(?<![\\w-])class\\s*=\\s*(?:"[^"]*|'[^']*))(?<![\\w-])md-${MARKDOWN_CLASS}(?![\\w-])`,
            to: 'kbq-md-$1'
        },
        MARKDOWN_CLASS_SELECTOR
    ],
    scssReplacements: [
        { from: `${ARGUMENTLESS_MIXIN}\\([^(){};]*\\)`, to: '$1()' },
        LIGHT_AND_DARK_THEMES,
        REPEATED_THEME_LINE,
        MARKDOWN_CLASS_SELECTOR
    ],
    styleEntryReplacements: [LIGHT_AND_DARK_THEMES],
    warnPatterns: [
        {
            pattern: `${ARGUMENTLESS_MIXIN}\\((?=[^(){};]*\\()`,
            message:
                '`koobiq-theme()`, `koobiq-typography()` and `kbq-core-theme()` take no arguments any more, as they ' +
                'ignored them: remove the arguments, and the theme or typography map built only for them.'
        },
        {
            pattern: '(?<![\\w-])kbq-(?:contrast|palette|color)\\(',
            message:
                '`kbq-contrast()`, `kbq-palette()` and `kbq-color()` were removed from the theming module: use the ' +
                'CSS variables of the theme instead, for example `var(--kbq-foreground-contrast)`.'
        },
        {
            pattern: '(?<![\\w-])kbq-(?:light|dark)-theme\\(',
            message:
                '`kbq-light-theme()` and `kbq-dark-theme()` are deprecated and will be removed in 22.0.0: nothing in the ' +
                'library reads the theme map they build. Use the CSS variables of the theme instead, for example ' +
                '`var(--kbq-foreground-contrast)`.'
        },
        {
            pattern:
                // A selector, `[class.kbq-scrollbar]` or a query.
                `\\.${SCROLLBAR_CLASS}` +
                // A `class` attribute, a `[class]` binding or a `class` host property.
                `|(?<![\\w-])['"]?class\\]?['"]?\\s*[=:]\\s*(?:"[^"]*|'[^']*|\`[^\`]*)(?<![\\w-])${SCROLLBAR_CLASS}` +
                // `classList.add()`, `Renderer2.addClass()`, an `[ngClass]` key.
                `|(?:classList\\.\\w+|(?:add|remove)Class)\\([^()]*${QUOTED_SCROLLBAR_CLASS}` +
                `|${QUOTED_SCROLLBAR_CLASS}\\s*:` +
                '|(?<![\\w-])kbq-scrollbar-theme\\(',
            message:
                'The `kbq-scrollbar` class and its `kbq-scrollbar-theme()` mixin are deprecated and will be removed ' +
                'in 22.0.0, and no library component carries the class any more: put `kbqNativeScrollbar` on the ' +
                'element that scrolls, with `kbqNativeScrollbarDescendants` to style the scrollbars inside it as the ' +
                'class did, or wrap the content in `<kbq-scrollbar>` (both from `@koobiq/components/scrollbar`).'
        },
        {
            pattern:
                '(?<![\\w-])--kbq-scrollbar-(?:size-(?:track-(?:dimension|padding-(?:vertical|horizontal))|' +
                'thumb-(?:width|min-size|border-radius))|thumb-disabled-background|' +
                'track-(?:default|hover|active)-(?:background|border))(?![\\w-])',
            message:
                'The `--kbq-scrollbar-size-*`, `--kbq-scrollbar-thumb-disabled-background` and ' +
                '`--kbq-scrollbar-track-{default,hover,active}-{background,border}` variables are deprecated and ' +
                'will be removed in 22.0.0: only the `kbq-scrollbar` class and the `KbqScrollbar` of ' +
                '`@koobiq/components/scrollbar/deprecated` read them. The new scrollbar reads ' +
                '`--kbq-scrollbar-track-size` for the track dimension, `--kbq-scrollbar-thumb-gap` (the gap on each ' +
                'side of the thumb) for the thumb width, `--kbq-scrollbar-thumb-min-size` and ' +
                '`--kbq-scrollbar-track-background`; the others have no counterpart.'
        },
        {
            pattern: '(?<![\\w-])kbq-typography-config\\(',
            message:
                '`kbq-typography-config()` was removed: use the typography CSS variables (`--kbq-typography-*`) or ' +
                'the `kbq-typography-level-to-styles-css-variables()` mixin of `core/styles/common/tokens`.'
        },
        {
            pattern:
                '@(?:use|import|forward)\\s+[\'"](?:~|[^\'"]*node_modules/)?@koobiq/components/core/styles/_?tokens' +
                '(?:\\.scss)?[\'"]',
            message:
                '`@koobiq/components/core/styles/tokens` was removed: load what it forwarded from the design tokens ' +
                'package directly — `@koobiq/design-tokens/web/variables`, `/palette`, `/typography` or ' +
                '`/md-typography` — or use the CSS variables (`var(--kbq-…)`).'
        },
        {
            pattern:
                '@(?:use|import|forward)\\s+[\'"](?:~|[^\'"]*node_modules/)?@koobiq/components/core/styles/' +
                '(?:functions(?:/_?(?:index|number|string))?|typography/_?typography-utils|common/_?(?:clearfix|popup))' +
                '(?:\\.scss)?[\'"]',
            message:
                'The Sass modules `core/styles/functions` (its index, `number` and `string`), ' +
                '`core/styles/typography/typography-utils`, `core/styles/common/clearfix` and ' +
                '`core/styles/common/popup` were removed: nothing in the library used them. Copy what you need ' +
                'into your own styles; for typography, use the `--kbq-typography-*` CSS variables.'
        },
        {
            pattern:
                '(?<![\\w-])(?:kbq-markdown-typography-config|kbq-typography-level|kbq-typography-level-to-styles|' +
                'kbq-font-(?:size|family|weight|style|feature-settings)|kbq-line-height|kbq-letter-spacing|' +
                'kbq-text-transform|rtl-value)\\(|(?<![\\w-])(?:popup-params|input-placeholder|' +
                'kbq-typography-css-variables)(?![\\w-])',
            message:
                '`kbq-markdown-typography-config()`, the getters of `typography-utils` (`kbq-typography-level()`, ' +
                '`kbq-typography-level-to-styles()`, `kbq-font-size()`…), `popup-params`, `input-placeholder`, ' +
                '`rtl-value()` and `kbq-typography-css-variables` were removed: nothing in the library used them. ' +
                'Use the `--kbq-typography-*` CSS variables, `kbq-typography-level-to-styles-css-variables()` of ' +
                '`core/styles/common/tokens`, `::placeholder`, or copy the mixin into your own styles.'
        },
        {
            anchor: '@koobiq/components/core/styles/functions',
            pattern:
                '(?<![\\w-])\\$ease-(?!out-circ(?![\\w-])|in-out-quad(?![\\w-])|in-out-circ(?![\\w-]))' +
                '(?:in|out|in-out)-(?:quad|cubic|quart|quint|sine|expo|circ|back)(?![\\w-])',
            message:
                'Of the timing variables of `core/styles/functions/timing`, only `$ease-out-circ`, ' +
                '`$ease-in-out-quad` and `$ease-in-out-circ` remain: copy the `cubic-bezier()` of the others.'
        },
        {
            pattern:
                `(?<=['"\`][^'"\`\\n]*)(?<![\\w.-])(?<!(?<![\\w-])class\\s*=\\s*(?:"[^"]*|'[^']*))md-${MARKDOWN_CLASS}` +
                '(?![\\w-])',
            message:
                'The unprefixed markdown typography classes (`md-h1`…`md-h6`, `md-body`, `md-body-mono`, ' +
                '`md-caption`, `md-table-cell`, `md-table-header`) were removed: use the `kbq-md-` class of the ' +
                'same name, for example `kbq-md-h1`.'
        }
    ]
};
