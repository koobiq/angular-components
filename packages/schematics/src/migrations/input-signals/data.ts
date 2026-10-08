/**
 * Data for the `input-signals` migration.
 *
 * `KbqNumberInput.value` / `.disabled` and `KbqInput.type` are signal inputs read through a getter now. Reads are
 * unchanged; a programmatic write no longer compiles. Warn-only: the write belongs in a binding or a form control.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbqNumberInput\\b|\\bkbqNumberInput\\b',
        pattern: '\\.\\s*(?:value|disabled)\\s*=[^=]',
        message:
            'KbqNumberInput.value and .disabled are signal inputs read through a getter now, so a programmatic ' +
            'write no longer compiles. Bind [value] / [disabled], or write through the form control. This ' +
            'pattern also matches a write to an unrelated object in the same file — check before changing it.'
    },
    {
        anchor: '\\bKbqInput\\b',
        pattern: '\\.\\s*type\\s*=[^=]',
        message:
            'KbqInput.type is a signal input read through a getter now, so a programmatic write no longer ' +
            'compiles. Bind [type] instead. This pattern also matches a write to an unrelated object in the ' +
            'same file — check before changing it.'
    }
];

export const SUMMARY = [
    'KbqNumberInput.value / .disabled and KbqInput.type are read as before; only programmatic writes are gone.'
];
