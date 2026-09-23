import { SignalMembersConfig, WarnPattern } from '../../utils/signal-members-migration';

/**
 * Data for the `radio-signals-and-aria` migration.
 *
 * The review closed the `name` contract, gave the group something to say about itself, and moved the
 * one-way inputs to the signal API.
 *
 * Only the members listed in `MEMBERS_BY_TYPE` became signals, and the split matters: `name`,
 * `labelPosition` and `required` exist on **both** `KbqRadioGroup` and `KbqRadioButton`, and only the
 * group's are signals. The button's stay accessors, because each folds in the group's value — a button
 * inside a disabled group is disabled, one inside a required group is required. That is why the rewrite
 * is scoped by receiver type rather than by member name: `group.required` becomes `group.required()`,
 * `button.required` is left alone.
 *
 * `value`, `selected` and `disabled` on the group stay accessor inputs. `writeValue` and
 * `setDisabledState` write them from outside the template, `disabled` coerces with `booleanAttribute`
 * and a `model()` carries no `transform`, and `writeValue` has to resolve the checked button
 * synchronously before the first render. Reads and writes of those three are unchanged.
 *
 * Nothing here is writable: every migrated member is a read-only `input()` or a `computed()`, so a
 * programmatic write has no mechanical translation and is reported instead.
 */

/** Identifier shape that marks a file as a radio consumer without an import. */
const RADIO_ANCHOR = '\\bKbqRadio\\w*\\b|\\bkbq-radio\\b';

/** Import specifier that marks a file as a radio consumer. */
export const RADIO_PACKAGE = '@koobiq/components/radio';

/** Which members each type owns. A receiver resolves to one type, so the rewrite is scoped by it. */
export const MEMBERS_BY_TYPE: Readonly<Record<string, readonly string[]>> = {
    KbqRadioGroup: ['name', 'labelPosition', 'required'],
    KbqRadioButton: ['id', 'inputId']
};

/** `exportAs` names a template reference can be bound to. */
export const EXPORT_AS_TO_TYPE: Readonly<Record<string, string>> = {
    kbqRadioGroup: 'KbqRadioGroup',
    kbqRadioButton: 'KbqRadioButton'
};

/** Element selectors whose bare `#ref` points at one of the migrated types. */
export const ELEMENT_TO_TYPE: Readonly<Record<string, string>> = {
    'kbq-radio-group': 'KbqRadioGroup',
    'kbq-radio-button': 'KbqRadioButton'
};

/** None: every migrated member is a read-only `input()` or a `computed()`. */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set();

/** The two custom properties the review removed. Also reported in stylesheets, which the engine skips. */
export const REMOVED_TOKENS_PATTERN = '--kbq-radio-size-(?:big|normal)-top\\b';

export const REMOVED_TOKENS_MESSAGE =
    'The --kbq-radio-size-big-top and --kbq-radio-size-normal-top custom properties were removed. ' +
    'Neither was referenced by any rule in the package, so overriding them never changed anything; ' +
    'the vertical offset follows the line height through kbq-css-half-difference().';

export const warnPatterns: readonly WarnPattern[] = [
    {
        anchor: RADIO_ANCHOR,
        pattern: '\\bisFocused\\b',
        message:
            'KbqRadioButton.isFocused was removed. It was a published input that nothing in the component ' +
            'read — no host binding, no template reference — so binding it never had an effect. Focus state ' +
            'is carried by the FocusMonitor classes on the host (cdk-keyboard-focused / cdk-program-focused); ' +
            'read those, or call focus(origin).'
    },
    {
        anchor: RADIO_ANCHOR,
        pattern: '\\.\\s*radioGroup\\b',
        message:
            'KbqRadioButton.radioGroup is typed KbqRadioGroup | null. It was always injected with ' +
            '{ optional: true } and the non-null assertion only hid it, so a button used outside a group ' +
            'already returned null behind a non-nullable type. Guard the access instead of asserting it. ' +
            'Note that the group members reached through it are signals now: radioGroup?.name() rather ' +
            'than radioGroup.name.'
    },
    {
        anchor: RADIO_ANCHOR,
        pattern: '\\.\\s*id\\s*=[^=]',
        message:
            'KbqRadioButton.id is a read-only input() now, so a programmatic write no longer compiles. Bind ' +
            '[id] in the template instead. Binding it to null or an empty string keeps the generated id, so ' +
            'a read always yields the id the element actually carries. This pattern also matches a plain ' +
            'element.id assignment in a file that happens to name the radio — check before changing it.'
    },
    {
        anchor: RADIO_ANCHOR,
        pattern: REMOVED_TOKENS_PATTERN,
        message: REMOVED_TOKENS_MESSAGE
    }
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders a radio but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variables by hand.';

export const UNRESOLVED_RECEIVER_MESSAGE =
    'A radio type is used here in a way this migration cannot resolve to a single receiver, so any ' +
    'signal read through it was left untouched. Check these lines by hand:';

export const SUMMARY: readonly string[] = [
    '  KbqRadioGroup.name, .labelPosition and .required are signal inputs now, so a read is a call. A read ' +
        'left un-called is silent in a template: {{ group.name }} prints the function source, and ' +
        '@if (group.required) is always true. The same three members on KbqRadioButton are unchanged — each ' +
        "folds in the group's value, so they stay accessors — which is why this rewrite is scoped by type.",
    '  KbqRadioButton.id and .inputId are signals too. id is read-only now: bind [id] rather than assigning ' +
        'to it, and bind null or an empty string to keep the generated one.',
    '  KbqRadioGroup.value, .selected and .disabled are deliberately unchanged. ControlValueAccessor writes ' +
        'the first and last, the buttons write selected, and writeValue has to resolve the checked button ' +
        'before the first render — none of which a read-only input() or a transform-less model() supports.',
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

export const config: SignalMembersConfig = {
    label: '[radio-signals-and-aria]',
    package: RADIO_PACKAGE,
    membersByType: MEMBERS_BY_TYPE,
    exportAsToType: EXPORT_AS_TO_TYPE,
    elementToType: ELEMENT_TO_TYPE,
    writableMembers: WRITABLE_MEMBERS,
    warnPatterns,
    messages: {
        unparseableTemplate: UNPARSEABLE_TEMPLATE_MESSAGE,
        unresolvedReceiver: UNRESOLVED_RECEIVER_MESSAGE,
        summary: SUMMARY
    }
};
