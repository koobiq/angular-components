/**
 * Data for the `table-cell-content` migration.
 *
 * `KbqTableCellContent` is removed. It was declared `selector: 'kbq-table td'`, and Angular's directive
 * selector grammar has no descendant combinator: the parser calls `setElement()` for every bare tag it
 * meets, so the second one overwrote the first and the effective selector was `td`. Every template that
 * imported `KbqTableModule` therefore got a directive instance plus a live content query on every cell
 * it rendered, `kbq-table` scoping included nothing, and the `kbq-table` element the selector named has
 * never existed — the component is an attribute on a native `<table>`.
 *
 * The single rule the directive fed is CSS now
 * (`.kbq-table > :is(tbody, tfoot) > tr > :is(td, th):has(.kbq-button, .kbq-button-icon)`), which also drops the
 * `@koobiq/components/button` dependency from the table entry point.
 *
 * Warn-only: an entry in an `imports` array is deleted rather than replaced, and a stylesheet keyed on
 * the modifier class has to be re-pointed at the cell, which no rewrite can decide.
 */

/** Import specifier that marks a file as a table consumer. */
export const TABLE_PACKAGE = '@koobiq/components/table';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const TABLE_TYPE = '\\bKbqTable\\w*\\b|\\bkbq-table[\\w-]*';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TABLE_TYPE,
        pattern: '\\bKbqTableCellContent\\b',
        message:
            'KbqTableCellContent was removed. Its selector was `kbq-table td`, which Angular parses as ' +
            'plain `td` — it matched every cell in every template importing KbqTableModule, and the ' +
            '`kbq-table` element it named has never existed. Delete it from the imports array; the reduced ' +
            'padding of a cell holding a button is plain CSS now and needs no directive.'
    },
    {
        anchor: TABLE_TYPE,
        pattern: 'kbq-table-cell_has-button',
        message:
            'The kbq-table-cell_has-button class is no longer applied — nothing binds it. A stylesheet ' +
            'keyed on it should select the cell instead: ' +
            '`.kbq-table > :is(tbody, tfoot) > tr > :is(td, th):has(.kbq-button, .kbq-button-icon)`.'
    },
    {
        anchor: '\\bstickyHeader\\b|\\bkbq-table_sticky-header\\b',
        // A trailing hyphen would start a different token (`--kbq-background-bg-secondary`, `-tertiary`),
        // so it is excluded rather than relying on `\b` — a hyphen is not a word character, so a boundary
        // already sits between `bg` and `-secondary` regardless.
        pattern: '--kbq-background-bg(?![\\w-])',
        message:
            'A pinned table header is painted with --kbq-table-sticky-header-background, which defaults to ' +
            '--kbq-background-card rather than --kbq-background-bg. If this table sits directly on the page ' +
            'background, set --kbq-table-sticky-header-background: var(--kbq-background-bg) on it — in dark ' +
            'theme the two surfaces differ visibly.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Row hover and the pill corner radii cover `<th>` inside `<tbody>` as well as `<td>`, so a row led ' +
        'by a row header is highlighted and rounded as a unit instead of from its second cell on. A ' +
        'consumer rule that switched the highlight off per row (`tr:hover { background: none }`) used to ' +
        'be a no-op against the cell-level color; bind [disableHover] or set ' +
        '--kbq-table-states-hover-background: transparent instead.',
    '  Every color is behind a --kbq-table-* token now (--kbq-table-header-text, --kbq-table-body-text, ' +
        '--kbq-table-border-color, --kbq-table-states-hover-background, --kbq-table-sticky-header-background), ' +
        'and the row radius is --kbq-table-size-row-border-radius. Overriding the global tokens the theme ' +
        'used to read directly no longer reaches the table alone.',
    '  Cell padding and the corner radii are logical properties, and alignment goes through ' +
        '--kbq-table-cell-text-align (default `start`), so a table under dir="rtl" mirrors instead of ' +
        'staying left-aligned, and a column can be re-aligned with a custom property instead of ' +
        'out-specifying `.kbq-table > thead > tr > th`.',
    '  `<tfoot>` gets the library color and typography it was already being padded for.',
    '  A pinned header publishes its measured height as --kbq-table-size-sticky-header-height and the ' +
        'table uses it as scroll-margin-block-start on its cells and their focusable content, so a control ' +
        'scrolled to the top edge does not land under the header (WCAG 2.2 SC 2.4.11). Add ' +
        'scroll-padding-block-start to your own scroll container if it holds more than the table.'
];
