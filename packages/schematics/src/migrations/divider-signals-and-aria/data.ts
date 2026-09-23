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

/** The class a receiver has to be annotated with for its member access to be a divider's. */
export const DIVIDER_TYPE_NAME = 'KbqDivider';

/** Identifier and element shapes that mark a file worth parsing at all. */
export const DIVIDER_TYPE = '\\bKbqDivider\\w*\\b|\\bkbq-divider\\b';

/** The inputs that stopped being accessor pairs. */
export const SIGNAL_INPUTS = ['vertical', 'paddings'];

export const WRITE_MESSAGE =
    'KbqDivider.vertical and KbqDivider.paddings are signal inputs and take no assignment. Bind ' +
    '[vertical] / [paddings] in the template instead; both kept their names, so the binding itself ' +
    'is unchanged.';

export const READ_MESSAGE =
    'KbqDivider.vertical and KbqDivider.paddings are signal-backed: read them as calls, ' +
    'divider.vertical() and divider.paddings().';

export interface WarnPattern {
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

/**
 * Template warnings. The element name carries the scope here, so unlike the member access on the
 * TypeScript side these need no receiver to resolve — the attribute is on `<kbq-divider>` or it is not.
 */
export const templateWarnPatterns: WarnPattern[] = [
    {
        pattern: '<kbq-divider[^>]*\\b(?:role|aria-orientation)\\s*=',
        message:
            'kbq-divider renders role="separator" itself, plus aria-orientation="vertical" when vertical, ' +
            'so a hand-rolled role or aria-orientation on the element is a duplicate. Drop it, or set ' +
            '`decorative` for a divider that only repeats a boundary the layout already conveys.'
    },
    {
        pattern: '<kbq-divider[^>]*\\baria-hidden\\s*=',
        message:
            'A hand-rolled aria-hidden on kbq-divider still works and is left alone, but `decorative` says ' +
            'the same thing through the component: it renders role="presentation" instead of "separator".'
    }
];

/**
 * Stylesheet warnings. The CSS change has the widest reach of the three and no call site in TypeScript
 * at all, so the consumer's own stylesheets are the only place it can be pointed at.
 */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern: 'kbq-divider[^{}]*\\{[^{}]*\\bheight\\s*:',
        message:
            'A `height` on a divider selector was usually there to survive the old `height: 100%` collapsing ' +
            'to zero. A vertical divider spans its flex or grid line on its own now — the override can go. ' +
            'Outside such a line, set `--kbq-divider-size-vertical-height` instead of `height`, so the value ' +
            'does not depend on which stylesheet the browser reads last. The token also hands the alignment ' +
            "back to the row, which a raw `height` does not: the divider's defaults are emitted at one class " +
            'of specificity, so a `height` of your own wins and leaves `align-self: stretch` behind it.'
    },
    {
        pattern: 'kbq-divider[^{}]*\\{[^{}]*\\bmargin[\\w-]*\\s*:[^;{}]*!important',
        message:
            'The `paddings` margins are emitted from a single class, with the orientation matched through ' +
            ':where(), which contributes no specificity. A selector of your own outranks them outright, so ' +
            'an `!important` that existed to beat the old three-class chain is no longer needed.'
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
    '  align-self: stretch applies to both orientations, so a horizontal divider in a flex column that ' +
        'sets align-items now spans the column instead of collapsing to its empty content.',
    '  The paddings margins are emitted from a single class, matching the orientation through :where(), ' +
        'so a consumer class of its own overrides them without !important. Note the other direction: a ' +
        'margin you already set that was silently losing to the old three-class chain now applies, so the ' +
        'spacing around a divider can change without you touching it.',
    '  Use the token rather than a raw height: it also hands the alignment back to the row, so a divider ' +
        'with a length of its own follows align-items instead of being pinned to the start of the line.'
];
