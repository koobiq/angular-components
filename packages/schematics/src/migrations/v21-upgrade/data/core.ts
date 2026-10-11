import type { AreaData, Replacement } from '../data';

const CORE = '@koobiq/components/core';

/** A named import of `symbol` from the core entry point, so an app's own symbol of that name is left alone. */
const importedFromCore = (symbol: string): string =>
    `import\\s*(?:type\\s*)?\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*['"]${CORE}['"]`;

/** Renames `from` to `to`; a core import clause that held both names keeps the last one. */
const rename = (from: string, to: string): Replacement[] => [
    { from: `\\b${from}\\b`, to },
    {
        from: `([{,]\\s*)${to}\\s*,\\s*(?=(?:[\\w\\s,]*,\\s*)?${to}\\b(?!\\s+as\\b)[\\w\\s,]*\\}\\s*from\\s*['"]${CORE}['"])`,
        to: '$1'
    }
];

// Templates read the enums when a component exposes them under their own name.
const DEFAULT_ENUM_MEMBERS: Replacement[] = [
    { from: '\\bKbqThemeSelector\\.Default\\b', to: 'KbqThemeSelector.Light' },
    { from: '\\bKbqThemeNames\\.Default\\b', to: 'KbqThemeNames.Light' }
];

// The members of `ThemePalette` that `KbqComponentColors` holds under the same value; the others style nothing.
const THEME_PALETTE: Replacement[] = [
    {
        from: `(?<=${importedFromCore('ThemePalette')}[\\s\\S]*)\\bThemePalette\\.(Error|Warning|Success)\\b`,
        to: 'KbqComponentColors.$1',
        ensureImport: { symbol: 'KbqComponentColors', from: CORE }
    },
    {
        // The specifier, with one of its commas, once nothing else names it; an emptied clause is dropped by
        // `removeImport`.
        from: `\\bThemePalette\\b(?!\\s+as\\b)\\s*,?\\s*(?=[^}]*\\}\\s*from\\s*['"]${CORE}['"])(?![\\s\\S]*\\bThemePalette\\b)`,
        to: '',
        removeImport: { symbol: 'ThemePalette', from: CORE }
    }
];

/**
 * Removed in 21.0.0: the `Default` members of `KbqThemeSelector` and `KbqThemeNames`, `KbqDefaultThemes`,
 * `KbqTheme`, the legacy `ThemeService`, `getOptionScrollPosition` and `ThemePalette`.
 */
export const core: AreaData = {
    tsReplacements: [
        ...DEFAULT_ENUM_MEMBERS,
        ...rename('KbqDefaultThemes', 'KBQ_DEFAULT_THEMES'),
        ...rename('KbqTheme', 'KbqThemeConfig'),
        ...THEME_PALETTE
    ],
    templateReplacements: DEFAULT_ENUM_MEMBERS,
    warnPatterns: [
        {
            pattern: '\\bKbqTheme\\b',
            message:
                '`KbqTheme` was renamed to `KbqThemeConfig`, which requires `colorScheme` (`light` or `dark`) and ' +
                'has no `selected`: add `colorScheme` to every custom theme and compare a theme with ' +
                '`KbqThemeService.currentTheme()` instead of reading `selected`.'
        },
        {
            pattern: importedFromCore('ThemeService'),
            message:
                '`ThemeService` was removed: inject `KbqThemeService` instead. `current.value` and `getTheme()` ' +
                'become `currentTheme()` (a signal: wrap it in `toObservable()` for a stream), `themes` becomes ' +
                '`themes()` and `setThemes()`, `setTheme(theme)` becomes `setMode(theme.colorScheme)`, or ' +
                '`selectTheme(theme.name)` to pin that theme. `KbqThemeService` applies a theme once injected and ' +
                "starts in `'auto'` mode: set the initial mode with `kbqThemeProvider({ mode })`."
        },
        {
            pattern: importedFromCore('getOptionScrollPosition'),
            message:
                '`getOptionScrollPosition()` was removed. `KbqOption.focus()` scrolls an option into view; for an ' +
                'element of your own, call `kbqFocusAndReveal(element)` from `@koobiq/components/core`.'
        },
        {
            // Every use but the rewritten members and the import specifier itself.
            anchor: importedFromCore('ThemePalette'),
            pattern:
                '\\bThemePalette\\s+as\\b|\\bThemePalette\\b(?!\\s*\\.\\s*(?:Error|Warning|Success)\\b)(?![^{}]*\\}\\s*from\\b)',
            message:
                '`ThemePalette` was removed: use `KbqComponentColors`, which `Error`, `Warning` and `Success` are ' +
                'rewritten to. `Primary`, `Secondary`, `Info` and `Default` matched no style of any component: drop ' +
                'the color, or pick a member of `KbqComponentColors` the component supports. Instead of `Empty`, ' +
                "leave `color` unset: `KbqComponentColors.Empty` is `'empty'`, not `''`. Type a member " +
                '`KbqComponentColors`, and hand a template `KbqComponentColors` instead of the enum.'
        }
    ]
};
