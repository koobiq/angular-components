import type { AreaData, Replacement } from '../data';

/** An `@include` of a mixin that takes no arguments any more, through a module namespace or not. */
const ARGUMENTLESS_MIXIN = '(@include\\s+(?:[\\w-]+\\.)?(?:koobiq-theme|koobiq-typography|kbq-core-theme))';

const LIGHT_AND_DARK_THEMES: Replacement = {
    from: '(@koobiq/components/prebuilt-themes/)(?:light|dark)-theme\\.css',
    to: '$1theme.css'
};

/** Drops a line that repeats an earlier line loading `theme.css`, as a file that loaded both themes is left with. */
const REPEATED_THEME_LINE: Replacement = {
    from: '(?<=^|\\n)([^\\r\\n]*@koobiq/components/prebuilt-themes/theme\\.css[^\\r\\n]*)([^]*?)\\r?\\n\\1(?=\\r?\\n|$)',
    to: '$1$2'
};

const MARKDOWN_CLASS = '(h[1-6]|body-mono|body|caption|table-cell|table-header)';

/** A markdown typography class used as a selector: in a style sheet, an inline `<style>`, `[class.…]`, a query. */
const MARKDOWN_CLASS_SELECTOR: Replacement = {
    from: `\\.md-${MARKDOWN_CLASS}(?![\\w-])`,
    to: '.kbq-md-$1'
};

/**
 * Removed in 21.0.0: the arguments of `koobiq-theme()`, `koobiq-typography()` and `kbq-core-theme()`,
 * `kbq-contrast()`, `kbq-palette()`, `kbq-color()`, `kbq-typography-config()`, `core/styles/tokens`, the prebuilt
 * `light-theme.css` and `dark-theme.css`, and the unprefixed markdown typography classes (`md-h1`, …). Also reports
 * `kbq-light-theme()` and `kbq-dark-theme()`, deprecated for removal in 22.0.0.
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
                `(?<=['"\`][^'"\`\\n]*)(?<![\\w.-])(?<!(?<![\\w-])class\\s*=\\s*(?:"[^"]*|'[^']*))md-${MARKDOWN_CLASS}` +
                '(?![\\w-])',
            message:
                'The unprefixed markdown typography classes (`md-h1`…`md-h6`, `md-body`, `md-body-mono`, ' +
                '`md-caption`, `md-table-cell`, `md-table-header`) were removed: use the `kbq-md-` class of the ' +
                'same name, for example `kbq-md-h1`.'
        }
    ]
};
