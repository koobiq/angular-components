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

/**
 * Removed in 21.0.0: the `Default` members of `KbqThemeSelector` and `KbqThemeNames`, `KbqDefaultThemes`,
 * `KbqTheme`, the legacy `ThemeService` and `getOptionScrollPosition`.
 */
export const core: AreaData = {
    tsReplacements: [
        ...DEFAULT_ENUM_MEMBERS,
        ...rename('KbqDefaultThemes', 'KBQ_DEFAULT_THEMES'),
        ...rename('KbqTheme', 'KbqThemeConfig')
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
        }
    ]
};
