/**
 * Replacement data for the narrowed button color set.
 *
 * A button used to accept any `KbqComponentColors` / `ThemePalette` value, but
 * `kbq-button-theme()` only ever styled the pairs the design system defines. A style
 * paired with anything else matched no theme rule at all and fell through to the
 * user-agent button appearance — most visibly `transparent` with no explicit color,
 * because the shared default (`contrast-fade`) was not one of the two colors the
 * transparent block styled.
 *
 * Two things changed:
 *
 * 1. Each style now carries its own default color. `transparent` resolves to
 *    `contrast` rather than `contrast-fade`: it paints neither fill nor border, so
 *    the color only picks the foreground and the design system has no faded
 *    transparent variant.
 * 2. Every style gained an unqualified fallback rule, so a pair the design system
 *    does not define renders in the style's default color instead of unstyled — and
 *    `color` was narrowed to the four colors a button actually supports.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** The colors `color` still accepts, on a button, a button group and a split button. */
export const SUPPORTED_COLORS = ['theme', 'theme-fade', 'contrast', 'contrast-fade'];

/**
 * Color values a button no longer accepts, as written in a template.
 *
 * `KbqComponentColors.Default` is deliberately absent: it is `'contrast'`, so it
 * still compiles. `ThemePalette.Default` is `'secondary'` and does not — but the two
 * are indistinguishable by member name, so that one is left to the warning below.
 */
export const UNSUPPORTED_COLORS = ['error', 'warning', 'success', 'empty', 'primary', 'secondary', 'info'];

/**
 * Enum member names that resolve to an unsupported color. Used only to warn: the
 * receiver is not resolved, so rewriting on a name alone could delete a binding that
 * reads from something else entirely.
 */
export const UNSUPPORTED_MEMBERS = ['Error', 'Warning', 'Success', 'Empty', 'Primary', 'Secondary', 'Info'];

/** Attribute / element names identifying a host whose `color` input is now narrowed. */
export const COLOR_HOST_ATTRIBUTES = ['kbq-button', 'kbq-button-group', 'kbqButtonGroupRoot', 'kbq-split-button'];
export const COLOR_HOST_ELEMENTS = ['kbq-button-group', 'kbq-split-button'];

/** The input this migration rewrites. */
export const COLOR_ATTRIBUTE = 'color';

export const removedColorMessage = (value: string): string =>
    `removed \`color="${value}"\`: a button supports ${SUPPORTED_COLORS.join(', ')} only. The button already ` +
    `rendered in its style's default color here — an unsupported color matched no theme rule — so dropping the ` +
    `binding keeps the appearance and fixes the type error.`;

export const unsupportedMemberMessage = (member: string): string =>
    `\`color\` is bound to \`${member}\`, which is not one of ${SUPPORTED_COLORS.join(', ')}. Remove the binding ` +
    `to keep the style's default color, or pick a supported one. Not rewritten automatically: the expression is ` +
    `not resolved, so the member name alone does not prove which enum it comes from.`;

/** Warnings for `.ts` sources. */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.color\\s*=\\s*(?:KbqComponentColors|ThemePalette)\\.(?:' + UNSUPPORTED_MEMBERS.join('|') + ')',
        message:
            'assigns an unsupported color programmatically. `KbqButton.color`, `KbqButtonGroupRoot.color` and ' +
            '`KbqSplitButton.color` now accept ' +
            SUPPORTED_COLORS.join(', ') +
            ' only; anything else never had a theme rule and now renders in the style default.'
    },
    {
        pattern: 'kbqOkType',
        message:
            '`kbqOkType` on `KbqModalComponent` / `ModalOptions` was narrowed from `string` to `KbqButtonColor`: ' +
            'it colors the predefined OK button, so it takes ' +
            SUPPORTED_COLORS.join(', ') +
            ' only.'
    },
    {
        pattern: ':\\s*(?:KbqComponentColors|ThemePalette)\\b',
        message:
            'declares a member typed `KbqComponentColors` / `ThemePalette`. If it feeds a button `color` binding, ' +
            'narrow it to `KbqButtonColor` — the wide type no longer assigns. Watch for values built inside ' +
            '`Array.from`/`map` callbacks too: without a return-type annotation an enum member widens to the whole ' +
            'enum and stops assigning even when every value is supported.'
    }
];

/** Warnings for stylesheets. */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern:
            '\\.kbq-button_transparent[^{,]*\\.kbq-contrast-fade|\\.kbq-contrast-fade[^{,]*\\.kbq-button_transparent',
        message:
            'targets `.kbq-button_transparent.kbq-contrast-fade`, which no longer matches: a transparent button ' +
            'defaults to `contrast` now. Retarget it at `.kbq-contrast`, or drop it if it was a workaround for the ' +
            'transparent button rendering unstyled.'
    }
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'template could not be parsed, so its `color` bindings were left untouched — check them by hand.';

export const BEHAVIOUR_NOTE = [
    'Behaviour changes that are not auto-fixable:',
    '  - A transparent button with no explicit color now renders in `contrast` instead of `contrast-fade`.',
    '    It used to match no theme rule at all and rendered as a native button, so this is the fix — but a',
    '    stylesheet or a `color` getter read that expected `contrast-fade` needs updating.',
    '  - A style paired with a color the design system does not define (e.g. filled + theme) now renders in the',
    '    style default instead of unstyled.',
    '  - `KbqButtonGroupRoot` no longer propagates a color it was never given, so each nested button follows the',
    '    default color of its own style. A color bound on the group still wins over that default.'
];
