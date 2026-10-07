/**
 * Data for the `list-signals` migration.
 *
 * The inputs of `KbqListSelection` and `KbqListOption` are signal inputs read through a getter now. Reads are
 * unchanged; a programmatic write no longer compiles, except `KbqListOption.selected`, which stays writable.
 * Warn-only: the write belongs in a binding or a form control.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const LIST_ANCHOR = '\\bKbqList(?:Selection|Option)\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: LIST_ANCHOR,
        pattern: '\\.\\s*(?:autoSelect|noUnselectLast|multiple|tabIndex|selectAllHandler)\\s*=[^=]',
        message:
            'KbqListSelection.autoSelect, .noUnselectLast, .multiple, .tabIndex and .selectAllHandler are signal ' +
            'inputs read through a getter now, so a programmatic write no longer compiles. Bind them in the ' +
            'template; multipleMode stays writable. This pattern also matches a write to an unrelated object in ' +
            'the same file — check before changing it.'
    },
    {
        anchor: LIST_ANCHOR,
        pattern: '\\.\\s*(?:value|disabled|draggable|showCheckbox)\\s*=[^=]',
        message:
            'The value, disabled, draggable and showCheckbox of KbqListOption, and the disabled and draggable of ' +
            'KbqListSelection, are signal inputs read through a getter now, so a programmatic write no longer ' +
            'compiles. Bind them in the template, or disable the list through its form control. ' +
            'KbqListOption.selected stays writable. This pattern also matches a write to an unrelated object in ' +
            'the same file — check before changing it.'
    }
];

export const SUMMARY = [
    'KbqListSelection and KbqListOption are read as before; only programmatic writes to their inputs are gone.'
];
