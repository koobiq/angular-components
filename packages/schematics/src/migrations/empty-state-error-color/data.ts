/**
 * Data for the `empty-state-error-color` migration.
 *
 * The empty-state review closed the one imperative hook the component had and renamed its four theme
 * custom properties:
 *
 * - `KbqEmptyStateIcon.setErrorColor()` — removed. It existed so that `KbqEmptyState` could tint the
 *   icon once from `ngAfterContentInit`, which made the tint irreversible, late for anything toggled
 *   after init, and silently absent whenever the icon was wrapped rather than carrying the slot
 *   attribute. The illustration follows `[errorColor]` on its own now.
 * - `--kbq-empty-state-title`, `--kbq-empty-state-color`, `--kbq-empty-state-error-title`,
 *   `--kbq-empty-state-error-color` — renamed to `-title-color`, `-text-color`, `-error-title-color`
 *   and `-error-text-color`. The new name is chained from the old one, so both an override and a
 *   direct read of the old name keep resolving, but the old name is deprecated.
 *
 * Warn-only. A call to a removed method has no replacement expression, and a token override is a
 * theming decision the schematic cannot make.
 */

/** Import specifier that marks a file as an empty-state consumer. */
export const EMPTY_STATE_PACKAGE = '@koobiq/components/empty-state';

/**
 * Identifier, element and custom-property shapes that mark a consumer without an import.
 *
 * Every `warnPatterns` entry below only applies to a file that also matches this, so it is checked
 * once, ahead of the per-pattern checks, rather than repeated as a per-pattern anchor.
 */
export const EMPTY_STATE_TYPE = '\\bKbqEmptyState\\w*\\b|\\bkbq-empty-state\\b';

export interface WarnPattern {
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\bsetErrorColor\\b',
        message:
            'KbqEmptyStateIcon.setErrorColor() was removed. It tinted the icon once from ' +
            'ngAfterContentInit, so the tint never went away, never arrived for an [errorColor] flipped ' +
            'after init, and never happened at all when the icon was wrapped by the slot instead of ' +
            'carrying it. The illustration follows [errorColor] on <kbq-empty-state> now, in both markup ' +
            'shapes — bind the input and delete the call.'
    },
    {
        // Matches either shape the old name can appear in: a declaration (an override) or a
        // `var(--kbq-empty-state-...)` read.
        pattern:
            '--kbq-empty-state-(?:title|color|error-title|error-color)\\s*:' +
            '|\\bvar\\(\\s*--kbq-empty-state-(?:title|color|error-title|error-color)\\s*[,)]',
        message:
            'The four empty-state theme tokens were renamed: --kbq-empty-state-title becomes ' +
            '--kbq-empty-state-title-color, --kbq-empty-state-color becomes --kbq-empty-state-text-color ' +
            '(it is the text color, not the component color), --kbq-empty-state-error-title becomes ' +
            '--kbq-empty-state-error-title-color and --kbq-empty-state-error-color becomes ' +
            '--kbq-empty-state-error-text-color. The old name still resolves — an override and a direct ' +
            'read both keep working — but it is deprecated. Rename it.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The title is rendered with heading typography but was written as a <div> in every usage in the ' +
        'library. Write it as a real heading of the level the page calls for — <h2 kbq-empty-state-title> ' +
        '— the component zeroes the browser margin, so nothing moves.',
    '  An empty state inserted into a page that has already been read needs role="status" (role="alert" ' +
        'for the error variant) on <kbq-empty-state>; the component adds no role of its own.',
    '  empty-state.scss loads its own token layer now instead of relying on a second styleUrls entry, ' +
        'so anything reusing the stylesheet gets the custom properties with the rules. A workaround that ' +
        're-declared --kbq-empty-state-size-* tokens to compensate can be dropped.'
];
