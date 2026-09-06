/**
 * Data for the `radio-name-and-aria` migration.
 *
 * The radio review closed the `name` contract and gave the group something to say about itself:
 *
 * - `KbqRadioButton.isFocused` — removed. It was a published input nothing read; focus state comes
 *   from the `FocusMonitor`'s `cdk-*-focused` classes.
 * - `KbqRadioButton.radioGroup` — typed `KbqRadioGroup | null`. It was always injected
 *   `{ optional: true }` behind a non-nullable type.
 * - `KbqRadioButton.name` — resolves to the group's name, or to an id unique to the button when there
 *   is no group. A button outside a group no longer shares `undefined` with every other one, and an
 *   explicitly bound `[name]` is no longer discarded in `ngOnInit`.
 * - `KbqRadioButton.focus()` takes a `FocusOrigin`, and `KbqRadioGroup` has a `focus()` of its own.
 * - `KbqRadioGroup` accepts `[color]`, mirrors `[required]` as `aria-required` and an error color as
 *   `aria-invalid`.
 * - `--kbq-radio-size-big-top` and `--kbq-radio-size-normal-top` — removed. Both were declared and
 *   referenced nowhere.
 *
 * Warn-only. A removed input has no replacement expression, and narrowing `KbqRadioGroup | null` back
 * to a non-null value is a decision the call site owns.
 */

/** Import specifier that marks a file as a radio consumer. */
export const RADIO_PACKAGE = '@koobiq/components/radio';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const RADIO_TYPE = '\\bKbqRadio\\w*\\b|\\bkbq-radio\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: RADIO_TYPE,
        pattern: '\\bisFocused\\b',
        message:
            'KbqRadioButton.isFocused was removed. It was a published input that nothing in the component ' +
            'read — no host binding, no template reference — so binding it never had an effect. Focus state ' +
            'is carried by the FocusMonitor classes on the host (cdk-keyboard-focused / cdk-program-focused); ' +
            'read those, or call focus(origin) to set it.'
    },
    {
        anchor: RADIO_TYPE,
        pattern: '\\.\\s*radioGroup\\b',
        message:
            'KbqRadioButton.radioGroup is typed KbqRadioGroup | null. It was always injected with ' +
            '{ optional: true } and the non-null assertion only hid it, so a button used outside a group ' +
            'already returned null behind a non-nullable type. Guard the access instead of asserting it.'
    },
    {
        anchor: RADIO_TYPE,
        pattern: '--kbq-radio-size-(?:big|normal)-top\\b',
        message:
            'The --kbq-radio-size-big-top and --kbq-radio-size-normal-top custom properties were removed. ' +
            'Neither was referenced by any rule in the package, so overriding them never changed anything; ' +
            'the vertical offset follows the line height through kbq-css-half-difference().'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A <kbq-radio-button> used outside a <kbq-radio-group> is independent now. It used to resolve its ' +
        'name to undefined, and the application-global UniqueSelectionDispatcher isolates its listeners by ' +
        'name alone, so checking one un-checked every other group-less radio in the application. Markup ' +
        'that relied on that mutual exclusion has to say so: put the buttons in a group, or give them the ' +
        'same explicit [name].',
    '  [name] on a <kbq-radio-button> inside a group is honoured. ngOnInit used to overwrite it with the ' +
        "group's name unconditionally, so a bound name was discarded; a button bound to its own name now " +
        'forms its own selection group.',
    '  <kbq-radio-group> is a radiogroup, which takes no name from its content. Name it with a plain ' +
        'aria-label / aria-labelledby attribute on the element — a detached label sibling leaves the group ' +
        'unnamed for assistive technology.',
    '  A kbq-hint projected into a button is exposed through aria-describedby instead of being folded into ' +
        "the button's accessible name, so an option is announced by its own text.",
    '  KbqRadioGroup accepts [color]: one binding colors every button in the group, so the error palette ' +
        'no longer has to be repeated per option. The error color is also mirrored as aria-invalid, and ' +
        '[required] as aria-required, on the group element.',
    "  KbqRadioButton.focus() takes a FocusOrigin and routes through the FocusMonitor, so focus('keyboard') " +
        'leaves the visible ring the theme paints off .cdk-keyboard-focused. KbqRadioGroup has a focus() of ' +
        'its own that forwards to the checked option, or to the first enabled one.',
    '  The native input carries its option value now, so a group inside a plain <form> submits that value ' +
        'instead of the literal "on". Only string-like values round-trip, and a group meant for native ' +
        'submission still needs an explicit [name] — the generated one changes between application loads.'
];
