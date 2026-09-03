/**
 * Data for the `checkbox-signals` migration.
 *
 * The one-way inputs became signals; `id` and `clickAction` are the two the automated migration skipped,
 * because application code writes to them.
 *
 * - `checkbox.id` / `clickAction` / `big` / `required` / `value` / `name` / `labelPosition` → calls (auto-fixed)
 * - the template plumbing (`inputId`, `inputElement`, `getAriaChecked`, the click handlers) → `protected` (warn)
 *
 * `checked`, `disabled`, `indeterminate` and `tabIndex` stay accessor inputs over the signals of the
 * `KbqCheckable` host directive: they are two-way state that the component and the `ControlValueAccessor`
 * both write, and a `model()` cannot carry the `booleanAttribute` / `numberAttribute` transform they need.
 * That is the shape the reviewed `KbqButtonToggle` settled on. Reads and writes of those four are unchanged.
 */

/** Members of `KbqCheckbox` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'id',
    'clickAction',
    'big',
    'required',
    'value',
    'name',
    'labelPosition'
];

/**
 * Signal members that are writable via `.set(...)`. Every migrated `KbqCheckbox` member is `input()`
 * (read-only), so this is empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a checkbox. */
export const CHECKBOX_TYPE = 'KbqCheckbox';

/** Element selector whose template reference variables (`#ref`) point at a checkbox. */
export const CHECKBOX_ELEMENT = 'kbq-checkbox';

/** Import specifier that marks a file as a checkbox consumer. */
export const CHECKBOX_PACKAGE = '@koobiq/components/checkbox';

/** Members that moved out of the public surface and can no longer be reached from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'inputId',
    'inputElement',
    'getAriaChecked',
    'onInputClick',
    'onInteractionEvent',
    'onLabelTextChange'
];

/** Appended to the protected-members warning. */
export const PROTECTED_HINT =
    'They are the wiring between the label, the visually hidden native input and the click algorithm. ' +
    'Use `focus()` and `toggle()`, or drive the checkbox through its inputs.';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const CHECKBOX_ANCHOR = '\\bKbqCheckbox\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: CHECKBOX_ANCHOR,
        pattern: '\\.\\s*(?:id|clickAction)\\s*=[^=]',
        message:
            'KbqCheckbox.id and clickAction are read-only signal inputs now, so a programmatic write no longer ' +
            'compiles. Bind `[id]` / `[clickAction]` in the template instead. Note that binding ' +
            '`[clickAction]="undefined"` explicitly overrides the KBQ_CHECKBOX_CLICK_ACTION token rather than ' +
            'falling back to it — leave the input unbound to use the token.'
    },
    {
        anchor: CHECKBOX_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqCheckbox\\b',
        message:
            'A KbqCheckbox view/content query returns the component instance, whose `id`, `value` and the other ' +
            'one-way inputs are now signals — reading one is a double call, e.g. `this.checkbox().id()`. ' +
            'Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Generated ids come from the CDK `_IdGenerator`, so their shape changed from `kbq-checkbox-1` to ' +
        '`kbq-checkbox-a1` — the app id is part of the prefix now, which is what keeps two Angular apps on ' +
        'one page from colliding. Nothing should match on that shape, but a test that did needs updating.',
    '  `<kbq-checkbox [id]="null">` now falls back to the generated id on the host as well. It used to leave ' +
        'the host without an id while the hidden input still pointed its `for` at the generated one.',
    '  `checked`, `big` and `indeterminate` are `booleanAttribute` inputs, and `required` defaults to `false` ' +
        'instead of `undefined` behind a `boolean` type. `<kbq-checkbox checked>` used to pass the empty ' +
        'string, which is falsy, so the valueless attribute did nothing; it checks the box now.',
    '  `value` reports `string | undefined` instead of `string`. It was declared non-nullable over an ' +
        '`undefined!` default, so an unbound checkbox always handed back `undefined`.',
    '  An enabled <kbq-checkbox> no longer carries `disabled="false"` on its host. The host binding ' +
        'rendered the boolean verbatim, so every enabled checkbox shipped the attribute — enough for a ' +
        'consumer stylesheet or test selector written as `kbq-checkbox[disabled]` to match all of them.'
];
