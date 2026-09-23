/**
 * Data for the `divider-signals-and-aria` migration.
 *
 * The divider review changed two things a consumer can notice:
 *
 * - `vertical` and `paddings` are signal inputs instead of accessor pairs, so a read is a call and a
 *   write is a template binding. Both kept their names, so no template needs migrating.
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

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Both inputs kept their names, so [vertical] and [paddings] bindings are unchanged - only ' +
        'TypeScript that reads or writes them through a component reference is affected.',
    '  The host renders role="separator", and aria-orientation="vertical" when vertical, so a ' +
        'hand-rolled one on the element is a duplicate. A divider that only repeats a boundary the ' +
        'layout already conveys should set decorative instead.'
];
