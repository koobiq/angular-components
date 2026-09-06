/**
 * Data for the `input-number-surface` migration.
 *
 * The input review stripped the `KbqFormFieldControl` surface `KbqNumberInput` declared and never
 * populated, and prefixed the two validator directives whose unprefixed names shadow the identically
 * named exports of `@angular/forms`:
 *
 * - `KbqNumberInput` no longer `implements KbqFormFieldControl`. `ngControl`, `errorState`, `id`,
 *   `placeholder`, `empty` and `required` are gone; every one of them was `undefined` for the whole
 *   lifetime of the directive, because the backing `control` field was never assigned. The real
 *   implementation always lived on the sibling `KbqInput`, which is what the form field resolves.
 * - `MinValidator` / `MaxValidator` / `MIN_VALIDATOR` / `MAX_VALIDATOR` → `KbqMinValidator` /
 *   `KbqMaxValidator` / `KBQ_MIN_VALIDATOR` / `KBQ_MAX_VALIDATOR`. The old names stay as deprecated
 *   aliases for one minor, so nothing breaks today.
 *
 * Warn-only. A removed member that was always `undefined` has no replacement expression, and the
 * rename is safe to leave until the aliases are dropped.
 */

/** Import specifier that marks a file as an input consumer. */
export const INPUT_PACKAGE = '@koobiq/components/input';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const INPUT_TYPE = '\\bKbqNumberInput\\b|\\bkbqNumberInput\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: INPUT_TYPE,
        pattern: '\\.\\s*(?:ngControl|errorState|placeholder|empty|required)\\b',
        message:
            'KbqNumberInput no longer implements KbqFormFieldControl: ngControl, errorState, id, placeholder, ' +
            'empty and required were removed. None of them was ever assigned — the private `control` field ' +
            'behind ngControl had no writer — so every read returned undefined. Read them off the sibling ' +
            'KbqInput, which owns the KbqFormFieldControl provider on the same element, or off the form ' +
            'field itself.'
    },
    {
        anchor: INPUT_PACKAGE,
        pattern: '\\b(?:MinValidator|MaxValidator)\\b',
        message:
            'MinValidator and MaxValidator are deprecated aliases of KbqMinValidator and KbqMaxValidator. ' +
            'The unprefixed names are the exact names @angular/forms exports, so importing both in one file ' +
            'shadows the framework validator. Rename the imports; the aliases are removed in the next major.'
    },
    {
        anchor: INPUT_PACKAGE,
        pattern: '\\b(?:MIN_VALIDATOR|MAX_VALIDATOR)\\b',
        message:
            'MIN_VALIDATOR and MAX_VALIDATOR are deprecated aliases of KBQ_MIN_VALIDATOR and ' +
            'KBQ_MAX_VALIDATOR. Rename the imports; the aliases are removed in the next major.'
    },
    {
        anchor: INPUT_TYPE,
        pattern: 'type\\s*=\\s*[\'"]number[\'"]',
        message:
            'type="number" on a kbqNumberInput is reset to type="text" with a console warning. A native ' +
            'number field runs the value sanitization algorithm on assignment and drops every value the ' +
            'directive formats — anything with a fraction, and anything over 999 while withThousandSeparator ' +
            'is on — so the field went blank while the model still held the value. Drop the attribute.'
    },
    {
        anchor: INPUT_TYPE,
        pattern: '\\bvalueAsNumber\\b',
        message:
            'KbqNumberInput no longer redefines HTMLInputElement.prototype.valueAsNumber. The patch replaced ' +
            'the platform accessor for every <input> in the application, returned null where the DOM ' +
            'specification requires NaN, and read a date field as parseFloat of its date string. A ' +
            'locale-aware numeric read is now a member of the directive: numberInput.valueAsNumber.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  min, max, step and bigStep coerce their value, so a static attribute (min="3") now holds the number ' +
        '3 rather than the string "3", and ngAcceptInputType_* declarations let the static form compile ' +
        'under strictTemplates.',
    '  MinValidator/MaxValidator no longer parseInt their bound value, so a fractional [min]="0.5" ' +
        'validates against 0.5 instead of 0, and a bound [min]="0" reaches the DOM instead of being ' +
        'dropped by a falsy check.',
    '  Stepping is done in integer space against a decimal scale, so one arrow press on 1.005 with ' +
        'step="0.001" renders 1,006 rather than 1,0059999999999998.',
    '  KbqNumberInput carries spinbutton semantics — role, aria-valuenow, aria-valuetext, aria-valuemin, ' +
        'aria-valuemax and inputmode — and KbqInputPassword mints its ids in its own kbq-input-password- ' +
        'namespace, so a page holding both controls no longer emits two elements with the same id and the ' +
        "form field's <label for> resolves to its own control.",
    '  _input-theme.scss was renamed to _input-typography.scss: it holds a typography mixin, not a colour ' +
        'theme. A consumer that @use-d the old path by hand has to update it.'
];
