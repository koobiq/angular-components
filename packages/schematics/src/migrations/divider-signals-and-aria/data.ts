/**
 * Data for the `divider-signals-and-aria` migration.
 *
 * The divider review changed three things a consumer can notice:
 *
 * - `vertical` and `paddings` are signal inputs instead of accessor pairs, so a read is a call and a
 *   write is a template binding. Both kept their names, so no template needs migrating.
 * - The vertical divider spans its flex or grid line (`align-self: stretch`) instead of being sized
 *   `height: 100%`, which resolved to zero in exactly the rows vertical dividers live in. Outside such
 *   a line it now needs `--kbq-divider-size-vertical-height`.
 * - The host carries `role="separator"` and, when vertical, `aria-orientation="vertical"`, with a
 *   `decorative` input that swaps to `role="presentation"`. Hand-rolled attributes are duplicates.
 *
 * Warn-only. A read that becomes a call and a hand-rolled attribute that becomes a duplicate are both
 * decisions about the call site, not rewrites that can be derived from it.
 */

/** Import specifier that marks a file as a divider consumer. */
export const DIVIDER_PACKAGE = '@koobiq/components/divider';

/** Identifier and element shapes that mark a consumer without an import. */
export const DIVIDER_TYPE = '\\bKbqDivider\\w*\\b|\\bkbq-divider\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: DIVIDER_TYPE,
        pattern: '\\.\\s*(?:vertical|paddings)\\s*=(?!=)',
        message:
            'KbqDivider.vertical and KbqDivider.paddings are signal inputs and take no assignment. Bind ' +
            '[vertical] / [paddings] in the template instead; both kept their names, so the binding itself ' +
            'is unchanged.'
    },
    {
        anchor: DIVIDER_TYPE,
        pattern: '\\.\\s*(?:vertical|paddings)\\b(?!\\s*[=(])',
        message:
            'KbqDivider.vertical and KbqDivider.paddings are signal-backed: read them as calls, ' +
            'divider.vertical() and divider.paddings().'
    },
    {
        anchor: '\\bkbq-divider\\b',
        pattern: '<kbq-divider[^>]*\\b(?:role|aria-orientation)\\s*=',
        message:
            'kbq-divider renders role="separator" itself, plus aria-orientation="vertical" when vertical, ' +
            'so a hand-rolled role or aria-orientation on the element is a duplicate. Drop it, or set ' +
            '`decorative` for a divider that only repeats a boundary the layout already conveys.'
    },
    {
        anchor: '\\bkbq-divider\\b',
        pattern: '<kbq-divider[^>]*\\baria-hidden\\s*=',
        message:
            'A hand-rolled aria-hidden on kbq-divider still works and is left alone, but `decorative` says ' +
            'the same thing through the component: it renders role="presentation" instead of "separator".'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The vertical divider spans its flex or grid line (align-self: stretch) instead of being sized ' +
        'height: 100%, which resolved to zero in exactly the centred rows vertical dividers live in. A ' +
        'local height override that existed only to work around that collapse can go.',
    '  Outside a flex or grid line - in a table cell, or a plain block - a vertical divider no longer ' +
        'takes its height from the parent. Set --kbq-divider-size-vertical-height on the divider ' +
        '(the token is declared on .kbq-divider, so the override has to reach the element).',
    '  The paddings margins are emitted from a single class, matching the orientation through :where(), ' +
        'so a consumer class of its own overrides them without !important.'
];
