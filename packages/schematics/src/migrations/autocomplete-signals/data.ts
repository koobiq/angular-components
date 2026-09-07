/**
 * Data for the `autocomplete-signals` migration.
 *
 * Four accessor inputs and one write-target input survived the automated signal migration, on the panel
 * and its trigger. All of them are `input()` now, and the panel's internal state moved to signals with them.
 *
 * - `displayWith` / `autoActiveFirstOption` / `openOnFocus` on the panel → calls (auto-fixed)
 * - `autocompleteDisabled` on the trigger → a call (auto-fixed)
 * - `showPanel` / `isOpen` → signals; a read must become a call (auto-fixed)
 * - `classList` → replaced by the `class` input and an internal computed (warn)
 * - `isOpen = …` → the trigger's own state; `attached` is the writable half now (warn)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'displayWith',
    'autoActiveFirstOption',
    'openOnFocus',
    'autocompleteDisabled',
    'showPanel',
    'isOpen'
];

/**
 * Signal members a consumer can still write, as `.set(...)`. `showPanel` was a plain public `boolean`
 * field before this migration and is a `WritableSignal<boolean>` now, so the write has a mechanical
 * translation. The inputs and the read-only `isOpen` computed do not, and are warned about instead.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>(['showPanel']);

/**
 * `displayWith` is the one member whose value is itself a function, so `a.displayWith(value)` is a
 * legitimate pre-migration *invocation* rather than an already-migrated signal read. Appending `()` to
 * it would half-migrate the call; the correct rewrite is `a.displayWith()(value)`.
 */
export const FUNCTION_VALUED_MEMBERS: readonly string[] = ['displayWith'];

/** Signal-API methods reachable on the writable members; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** TypeScript type annotation that marks a receiver as an autocomplete panel. */
export const AUTOCOMPLETE_TYPE = 'KbqAutocomplete';

/** Every type whose members this migration rewrites. */
export const RECEIVER_TYPES: readonly string[] = ['KbqAutocomplete', 'KbqAutocompleteTrigger'];

/**
 * Which members each type owns. A template reference resolves to exactly one of them, so the rewrite has
 * to know which members that reference can carry: `autocompleteDisabled` lives on the trigger, the rest
 * on the panel.
 */
export const MEMBERS_BY_TYPE: Readonly<Record<string, readonly string[]>> = {
    KbqAutocomplete: ['displayWith', 'autoActiveFirstOption', 'openOnFocus', 'showPanel', 'isOpen'],
    KbqAutocompleteTrigger: ['autocompleteDisabled']
};

/**
 * `exportAs` names a template reference can be bound to. The trigger is a directive on an `<input>`, so
 * `#t="kbqAutocompleteTrigger"` is the only way a template names it.
 */
export const EXPORT_AS_TO_TYPE: Readonly<Record<string, string>> = {
    kbqAutocomplete: 'KbqAutocomplete',
    kbqAutocompleteTrigger: 'KbqAutocompleteTrigger'
};

/** Element selector whose template reference variables (`#ref`) point at an autocomplete panel. */
export const AUTOCOMPLETE_ELEMENT = 'kbq-autocomplete';

/** Import specifier that marks a file as an autocomplete consumer. */
export const AUTOCOMPLETE_PACKAGE = '@koobiq/components/autocomplete';

/** Members that left the public surface and can no longer be reached from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = ['classList'];

/** Appended to the protected-members warning. */
export const PROTECTED_HINT =
    '`classList` was a write-only accumulator behind the `class` input and is an internal computed now. ' +
    'Set `class` on <kbq-autocomplete> as before — the classes still land on the overlay panel.';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

// `\w*` rather than `\b`, so a file that only imports `KbqAutocompleteModule` is anchored too: that is
// exactly the shape `referencesAutocomplete` widened the file filter to admit.
const AUTOCOMPLETE_ANCHOR = '\\bKbqAutocomplete\\w*\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: AUTOCOMPLETE_ANCHOR,
        pattern: '\\.\\s*isOpen\\s*=[^=]',
        message:
            'KbqAutocomplete.isOpen is a read-only computed now — `attached() && showPanel()`. The writable ' +
            'half is `attached`, which the trigger owns: call `autocomplete.attached.set(…)` if you really ' +
            'need it. Note that the old setter and getter disagreed: writing `isOpen = true` and reading it ' +
            'back returned false whenever the panel had no options.'
    },
    {
        anchor: AUTOCOMPLETE_ANCHOR,
        // The signal-query form only. `@ViewChild(KbqAutocomplete) a: KbqAutocomplete` is a plain annotated
        // field that the receiver pass resolves and rewrites to a single call, so warning about a double
        // call there would break working code. Whitespace rather than `[^\n;]`, so a wrapped call matches.
        pattern:
            '\\b(?:viewChild|contentChild)(?:\\s*\\.\\s*required)?\\s*(?:<[^<>()]*>)?\\s*\\(\\s*KbqAutocomplete\\b',
        message:
            'A `viewChild(KbqAutocomplete)` / `contentChild(KbqAutocomplete)` query is itself a signal, so ' +
            'reading a panel signal through it is a double call: `this.autocomplete().isOpen()`. The receiver ' +
            'pass cannot see through the query, so those reads are left untouched. Migrate them by hand.'
    },
    {
        anchor: AUTOCOMPLETE_ANCHOR,
        // `displayWith` is function-valued, so an existing call is an invocation, not a migrated read.
        pattern: '\\.\\s*displayWith\\s*\\(',
        message:
            '`displayWith` is an `input()` holding a function, so the read and the invocation are separate ' +
            'calls now: `autocomplete.displayWith()(value)`. A call left at one pair of parentheses reads the ' +
            'function object in TypeScript and, in a template, interpolates it instead of the label.'
    },
    {
        anchor: AUTOCOMPLETE_ANCHOR,
        // The inputs have no writable half at all, unlike `showPanel`, which is auto-fixed to `.set(…)`.
        pattern: '\\.\\s*(?:displayWith|autoActiveFirstOption|openOnFocus|autocompleteDisabled)\\s*=[^=]',
        message:
            'These are `input()`s now, so a programmatic write is no longer possible: bind them in the ' +
            'template instead. The pre-migration source carried this warning on `displayWith` already.'
    }
];

/** Reported when a template renders the panel but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-autocomplete> but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its template reference variables by hand.';

/**
 * Reported when a file names a migrated type in a position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads a member in a shape
 * the access pass cannot reach. Those reads are left alone, and staying silent reads as "nothing to do".
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqAutocomplete / KbqAutocompleteTrigger is used here in a way this migration cannot resolve to a ' +
    'single receiver, so any signal read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `autoActiveFirstOption`, `openOnFocus` and `kbqAutocompleteDisabled` are `booleanAttribute` inputs. ' +
        'For `autoActiveFirstOption` and `kbqAutocompleteDisabled` that matches the `coerceBooleanProperty` they ' +
        'already used, so nothing changes. `openOnFocus` had no coercion at all: a valueless attribute or `0` ' +
        "used to read as false and now means true, and `'false'` used to read as true and now means false.",
    '  Binding `[autoActiveFirstOption]` overrides KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS even when the bound value ' +
        'is `undefined` — as it did before, because the old setter coerced every binding write. The default ' +
        'only applies to an input nobody bound, so leave it unbound to let the token decide.',
    '  Generated panel ids come from the CDK `_IdGenerator`. With the default `APP_ID` the shape is unchanged ' +
        '(`kbq-autocomplete-0`, `kbq-autocomplete-1`, …); an app or test that sets a custom `APP_ID` now gets it ' +
        "embedded, e.g. `kbq-autocomplete-a1` under TestBed. The id is the panel element's `id`, so selectors and " +
        'snapshots targeting it may need updating.',
    '  Classes from the `class` attribute now replace each other on the panel instead of accumulating. The ' +
        'old setter merged every value it was given into an object it never cleared, so a `[class]` binding ' +
        'that changed from "a" to "b" left the panel with both.'
];
