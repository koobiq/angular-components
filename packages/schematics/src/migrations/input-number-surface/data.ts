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
 * It then finished the signal migration: `min`, `max`, `step` and `bigStep` became `input()`, so a read
 * has to become a call. That part *is* rewritten — scoped to a receiver whose type is provably
 * `KbqNumberInput`, because `min`/`max`/`step` are far too common to match on the member name alone.
 *
 * The rest is warn-only. A removed member that was always `undefined` has no replacement expression,
 * and the validator rename is safe to leave until the aliases are dropped.
 */

/** Import specifier that marks a file as an input consumer. */
export const INPUT_PACKAGE = '@koobiq/components/input';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const INPUT_TYPE = '\\bKbqNumberInput\\b|\\bkbqNumberInput\\b';

/** The password directive, which owns the id-namespace change. Anchors its own warning. */
export const PASSWORD_TYPE = '\\bKbqInputPassword\\b|\\bkbqInputPassword\\b';

/** TypeScript type annotation that marks a receiver as a number input. */
export const NUMBER_INPUT_TYPE = 'KbqNumberInput';

/** `exportAs` names a template reference variable can bind the directive under. */
export const NUMBER_INPUT_EXPORT_AS: readonly string[] = ['kbqNumberInput', 'kbqNumericalInput'];

/**
 * `KbqNumberInput` members that became `input()` signals. The value is unchanged — only the call
 * syntax — so a read is rewritten to a call. Every one of these is read-only: a programmatic write
 * has no `.set()` and is warned about instead.
 */
export const SIGNAL_MEMBERS: readonly string[] = ['min', 'max', 'step', 'bigStep'];

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

/**
 * The `KbqFormFieldControl` member-access pattern, handled separately from {@link warnPatterns}: `KbqInput`
 * — the sibling directive that also matches `input[kbqNumberInput]` — still exposes every one of these
 * members, so a bare text match would also flag a file that correctly reads them off a `KbqInput`-typed
 * reference. `index.ts` resolves the receiver of each match against the file's AST before reporting it.
 */
export const FORM_FIELD_CONTROL_MEMBER_PATTERN: WarnPattern = {
    anchor: INPUT_TYPE,
    pattern: '\\b([A-Za-z_$][\\w$]*)\\s*\\.\\s*(?:ngControl|errorState|placeholder|empty|required)\\b',
    message:
        'KbqNumberInput no longer implements KbqFormFieldControl: ngControl, errorState, id, placeholder, ' +
        'empty and required were removed. None of them was ever assigned — the private `control` field ' +
        'behind ngControl had no writer — so every read returned undefined. Read them off the sibling ' +
        'KbqInput, which owns the KbqFormFieldControl provider on the same element, or off the form ' +
        'field itself.'
};

/**
 * Removed exports and the prefixed names that replace them. A pure rename with one mechanical
 * translation each, so these are rewritten rather than reported.
 *
 * The unprefixed names were the exact names `@angular/forms` exports, so importing both in one file
 * shadowed the framework validator. They were deprecated aliases; this release drops them.
 *
 * Only rewritten in a file that imports `@koobiq/components/input` — without that anchor, a project
 * importing `MinValidator` from `@angular/forms` would be rewritten to a koobiq name it never imported.
 */
export const RENAMED_EXPORTS: ReadonlyArray<readonly [from: string, to: string]> = [
    ['MinValidator', 'KbqMinValidator'],
    ['MaxValidator', 'KbqMaxValidator'],
    ['MIN_VALIDATOR', 'KBQ_MIN_VALIDATOR'],
    ['MAX_VALIDATOR', 'KBQ_MAX_VALIDATOR']
];

export const warnPatterns: WarnPattern[] = [
    {
        anchor: INPUT_TYPE,
        // Both attribute orders, and only within the same `<input>` tag as `kbqNumberInput` — a bare
        // `type\s*=\s*"number"` anywhere in the file also matches an unrelated native input.
        pattern:
            '<input\\b[^>]*\\bkbqNumberInput\\b[^>]*\\btype\\s*=\\s*[\'"]number[\'"]|' +
            '<input\\b[^>]*\\btype\\s*=\\s*[\'"]number[\'"][^>]*\\bkbqNumberInput\\b',
        message:
            'type="number" on a kbqNumberInput is reset to type="text" with a console warning. A native ' +
            'number field runs the value sanitization algorithm on assignment and drops every value the ' +
            'directive formats — anything with a fraction, and anything over 999 while withThousandSeparator ' +
            'is on — so the field went blank while the model still held the value. Drop the attribute.'
    },
    {
        anchor: INPUT_TYPE,
        pattern: '\\b(?:valueChange|disabledChange)\\s*\\.\\s*emit\\b',
        message:
            'KbqNumberInput.valueChange and .disabledChange are RxJS Subjects rather than EventEmitters. ' +
            'Subscribing is unchanged; a call to .emit() becomes .next(). These names are too common to ' +
            'rewrite blind — check whether the receiver is the number input before renaming.'
    },
    {
        // Anchored on the password directive, not on INPUT_TYPE: the ids belong to KbqInputPassword.
        anchor: PASSWORD_TYPE,
        // A hand-written reference to a generated id, in a selector, a test id or an aria-* attribute.
        pattern: '[\'"#\\[]\\s*kbq-input-\\d|kbq-input-\\d+["\'\\]]|\\bkbq-input-\\d',
        message:
            'KbqInputPassword mints its ids in its own kbq-input-password- namespace now, so a password ' +
            'field that used to render id="kbq-input-7" renders id="kbq-input-password-7". It shared the ' +
            'kbq-input- counter with KbqInput before, which produced two elements with the same id on any ' +
            "page holding both controls, and the form field's <label for> then resolved to the wrong one. " +
            'Anything keyed on the generated id — a CSS selector, a test locator, a hand-written ' +
            'aria-labelledby — has to be updated, or better, stop depending on a generated value.'
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
    '  min, max, step and bigStep are input() signals that coerce their value, so a static attribute ' +
        '(min="3") holds the number 3 rather than the string "3". Reads on a KbqNumberInput-typed ' +
        'receiver were rewritten to calls; template bindings ([min], big-step="2") are unchanged.',
    '  MinValidator/MaxValidator no longer parseInt their bound value, so a fractional [min]="0.5" ' +
        'validates against 0.5 instead of 0, and a bound [min]="0" reaches the DOM instead of being ' +
        'dropped by a falsy check.',
    '  Stepping is done in integer space against a decimal scale, so one arrow press on 1.005 with ' +
        'step="0.001" renders 1,006 rather than 1,0059999999999998.',
    '  KbqNumberInput carries spinbutton semantics — role, aria-valuenow, aria-valuetext, aria-valuemin, ' +
        'aria-valuemax and inputmode.'
];
