/**
 * Data for the `button-truncation` migration.
 *
 * `KbqButton` and `KbqButtonToggle` now truncate their label with an ellipsis by default. Three things
 * changed that no compiler can catch:
 *
 * 1. `.kbq-button` / `.kbq-light-button` gained `max-width: 100%`, so a button that used to overflow its
 *    container now clamps to it and clips the label. Nothing in a template or a stylesheet identifies the
 *    affected places — this is reported once, as a note.
 * 2. `.kbq-button-text` went from `display: flex` to `display: inline-block` (only a block container paints
 *    `text-overflow`). Content projected into the default slot that relied on being a flex row lays out
 *    differently, and hand-rolled truncation overrides now stack on top of the built-in one.
 * 3. `kbq-button-toggle` gained a `.kbq-button-toggle-text` box between `.kbq-button-toggle-wrapper` and the
 *    projected content, so selectors aimed at the wrapper reach a different element.
 *
 * Only the markup is auto-fixed: an icon at either edge of a button's default slot is moved into the
 * `kbqButtonPrefix`/`kbqButtonSuffix` slot, which is what keeps it laid out *beside* the truncating box
 * instead of inside it. Stylesheets are reported, never rewritten — the right fix depends on why the
 * override exists.
 */

/** Attribute that marks a Koobiq button host, e.g. `<button kbq-button>` or `<a kbq-button>`. */
export const BUTTON_ATTR = 'kbq-button';

/** Element whose default slot has the same prefix/suffix contract as a button. */
export const TOGGLE_ELEMENT = 'kbq-button-toggle';

/**
 * Attributes that make an element a `KbqIcon`. `[kbq-icon-button]` and `[kbq-icon-item]` are subclasses,
 * so they count towards the same content query the component uses to decide its icon layout.
 */
export const ICON_ATTRS: readonly string[] = ['kbq-icon', 'kbq-icon-button', 'kbq-icon-item'];

/** Marker directives that project content out of the truncating label box. */
export const PREFIX_ATTR = 'kbqButtonPrefix';
export const SUFFIX_ATTR = 'kbqButtonSuffix';

export interface WarnPattern {
    /** The selector this entry is about, printed so the report says what was matched. */
    selector: string;
    /** Matched against the whole file content. */
    pattern: string;
    /** What to tell the consumer, printed with the file path. */
    message: string;
}

/**
 * Stylesheet overrides that are affected by the layout change. Reported with file locations in both `fix`
 * and dry-run mode: whether an override has to be dropped, retargeted or kept depends on why it was written,
 * and guessing wrong silently changes a layout.
 */
export const stylePatterns: WarnPattern[] = [
    {
        selector: '.kbq-button-text',
        pattern: '\\.kbq-button-text\\b',
        message:
            '`.kbq-button-text` is no longer a flex container — it is `display: inline-block`, because ' +
            '`text-overflow: ellipsis` is never painted on a flex box. If you project your own row of elements ' +
            'into the default slot, re-declare `display: flex; align-items: center` on it (see how ' +
            '`kbq-filter-bar` does it). If this rule was hand-rolled truncation, delete it: the label now ' +
            'truncates on its own.'
    },
    {
        selector: '.kbq-button-wrapper',
        pattern: '\\.kbq-button-wrapper\\b',
        message:
            '`.kbq-button-wrapper` no longer needs a truncation override — `.kbq-button-text` inside it clips ' +
            'and paints the ellipsis, and the button host carries `max-width: 100%`. An override that sets ' +
            '`overflow`/`text-overflow`/`display` here now stacks on top of the built-in behaviour; delete it ' +
            'unless it does something else.'
    },
    {
        selector: '.kbq-button-toggle-wrapper',
        pattern: '\\.kbq-button-toggle-wrapper\\b',
        message:
            '`kbq-button-toggle` gained a `.kbq-button-toggle-text` box: the wrapper is now only the flex row ' +
            'that lays out the slots, and the projected label sits one level deeper. Retarget selectors that ' +
            'meant the label (including `display: block` overrides added to get an ellipsis — that now works ' +
            'out of the box) at `.kbq-button-toggle-text`.'
    }
];

/** Printed once per run: the one change that has no textual signature to search for. */
export const MAX_WIDTH_NOTE: string[] = [
    '`.kbq-button` and `.kbq-light-button` now carry `max-width: 100%`.',
    'A button whose label is wider than its container no longer overflows — it clamps and truncates.',
    'Nothing identifies those places in code, so review screens with narrow buttons, dense toolbars and',
    'table cells visually (screenshot tests will show it immediately).',
    'To upgrade first and adopt truncation screen by screen, neutralise it in your global styles:',
    '    .kbq-button, .kbq-light-button { max-width: none; }'
];

/** Printed once per run when a template could not be migrated automatically. */
export const MANUAL_TEMPLATE_NOTE =
    'Icons that are not a direct first/last child of the button (wrapped in your own element, or produced by ' +
    'a block with more than one element) keep sharing the label box and give the ellipsis up. Mark them with ' +
    `\`${PREFIX_ATTR}\`/\`${SUFFIX_ATTR}\` by hand if the label should truncate.`;
