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
 * Signal members that are writable via `.set(...)`. Every migrated member is either an `input()` or a
 * read-only `computed`, so this is empty — writes are left untouched and covered by the warnings.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as an autocomplete panel. */
export const AUTOCOMPLETE_TYPE = 'KbqAutocomplete';

/** Every type whose members this migration rewrites. */
export const RECEIVER_TYPES: readonly string[] = ['KbqAutocomplete', 'KbqAutocompleteTrigger'];

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

const AUTOCOMPLETE_ANCHOR = '\\bKbqAutocomplete\\b';

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
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqAutocomplete\\b',
        message:
            'A KbqAutocomplete view/content query returns the component instance, whose `isOpen` and inputs ' +
            'are now signals — reading one is a double call, e.g. `this.autocomplete().isOpen()`. Verify ' +
            'query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `autoActiveFirstOption`, `openOnFocus` and `kbqAutocompleteDisabled` are `booleanAttribute` inputs. ' +
        'A valueless attribute means true now, where it used to pass the empty string — `coerceBooleanProperty` ' +
        'already treated that as false, so only markup that relied on the empty string reading as false changes.',
    '  Binding `[autoActiveFirstOption]` now overrides KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS even when the bound ' +
        'value is `undefined`. The default only applies to an input nobody bound, so leave it unbound to let ' +
        'the token decide.',
    '  Generated panel ids come from the CDK `_IdGenerator`, so their shape changed from `kbq-autocomplete-1` ' +
        "to `kbq-autocomplete-a1`. It is the value of the trigger's `aria-owns`, so anything asserting on that " +
        'shape needs updating.',
    '  Classes from the `class` attribute now replace each other on the panel instead of accumulating. The ' +
        'old setter merged every value it was given into an object it never cleared, so a `[class]` binding ' +
        'that changed from "a" to "b" left the panel with both.'
];
