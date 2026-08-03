/**
 * Data for the `button-toggle-signals-and-aria` migration.
 *
 * The v20.3.0 review of `kbq-button-toggle` did two things at once. It gave the control the ARIA it always
 * behaved with — a single-selection group is now a `radiogroup` of radios, a `multiple` one a `group` of
 * toggle buttons — and it moved the two pure-coercion inputs of the group to `input()`.
 *
 * Only the second part breaks compilation. The first changes rendered markup, the tab order and what the
 * arrow keys do, none of which a schematic can rewrite, so it is reported instead.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** TypeScript type annotations that mark a receiver as part of the button-toggle family. */
export const GROUP_TYPE = 'KbqButtonToggleGroup';
export const TOGGLE_TYPE = 'KbqButtonToggle';

/** `exportAs` of the group: a `#ref="kbqButtonToggleGroup"` in a template points at one. */
export const GROUP_EXPORT_AS = 'kbqButtonToggleGroup';

/** Element the accessible-name check looks for. */
export const TOGGLE_ELEMENT = 'kbq-button-toggle';

/**
 * Attributes that make an element an icon, i.e. content that carries no accessible name of its own.
 *
 * Deliberately wider than the component's own detection, which is a `contentChildren(KbqIcon)` query and so
 * only ever sees `[kbq-icon]`: `KbqIconButton` and `KbqIconItem` extend `KbqIcon` without providing its
 * token, so the query walks past them. They are glyphs all the same and name nothing, so a toggle holding
 * only one of them is worth reporting even where the runtime warning stays quiet.
 */
export const ICON_ATTRS: readonly string[] = ['kbq-icon', 'kbq-icon-button', 'kbq-icon-item'];

/**
 * Attributes that give a toggle an accessible name.
 *
 * `title` is not among them: it would sit on `<kbq-button-toggle>`, while the name is computed for the
 * inner `<button>` the user actually focuses, and the attribute never reaches it.
 */
export const NAME_ATTRS: readonly string[] = ['aria-label', 'aria-labelledby'];

/** Group members that became `input()` signals: a read becomes a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['vertical', 'multiple'];

/**
 * Methods that mean a member access is already migrated, so no `()` is appended. `input()` has no `set`,
 * but a consumer who reached for one still must not have a second `()` stapled on.
 */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/**
 * Written-to signal members. An `input()` is read-only and has no `.set()`, so there is nothing to rewrite
 * to — the write is reported and the binding has to take over.
 */
export const WRITE_MESSAGES: ReadonlyMap<string, string> = new Map([
    [
        'vertical',
        '`KbqButtonToggleGroup.vertical` is an `input()` and cannot be assigned. Bind it in the template ' +
            '(`[vertical]="isVertical"`) and drive the bound value instead.'
    ],
    [
        'multiple',
        '`KbqButtonToggleGroup.multiple` is an `input()` and cannot be assigned. Bind it in the template ' +
            '(`[multiple]="isMultiple"`) and drive the bound value instead.'
    ]
]);

/**
 * Members of `MANUAL_MEMBERS` that only break for a writer. They became read-only getters, so a read still
 * compiles and reads exactly as it did — reporting one would bury the lines that do need work.
 */
export const WRITE_ONLY_MANUAL_MEMBERS: ReadonlySet<string> = new Set(['iconType', 'type']);

/**
 * Members accessed on a group or a toggle that were removed, narrowed or made read-only. Reported with the
 * file they were found in; never rewritten.
 */
export const MANUAL_MEMBERS: ReadonlyMap<string, string> = new Map([
    [
        'buttonToggleGroup',
        '`KbqButtonToggle.buttonToggleGroup` is now `protected` and typed `KbqButtonToggleGroup | null`. It ' +
            'was declared non-null while being `null` for a standalone toggle. Reach the group through the ' +
            'element it sits on, or inject it yourself with `{ optional: true }`.'
    ],
    [
        'mcButton',
        '`KbqButtonToggle.mcButton` was removed — it was a dead view query with a legacy `mc` prefix. Use ' +
            '`toggle.focus()`, which now focuses the inner button instead of the non-focusable host, or ' +
            '`toggle.focusViaKeyboard()`.'
    ],
    [
        'icons',
        '`KbqButtonToggle.icons` is now private. The content query only ever fed the internal icon detection; ' +
            'read the resulting `iconType` instead.'
    ],
    [
        'iconType',
        '`KbqButtonToggle.iconType` is a read-only getter now. It is still `-icon` / `-icon-text` / `` and is ' +
            'still rendered as the matching host class, but it cannot be assigned.'
    ],
    [
        'type',
        '`KbqButtonToggle.type` is a read-only getter now, and it follows `multiple` at runtime instead of ' +
            'being frozen in `ngOnInit`. It also drives the rendered ARIA, so assigning it is no longer inert.'
    ],
    [
        'selected',
        '`KbqButtonToggleGroup.selected` is typed `KbqButtonToggle | KbqButtonToggle[] | null` instead of ' +
            '`any`, so an assignment to a differently typed variable stops compiling. In multiple-selection ' +
            'mode it hands back a fresh array per selection change rather than the model’s own.'
    ],
    [
        'emitChangeEvent',
        '`KbqButtonToggleGroup.emitChangeEvent()` takes the toggle the change came from: ' +
            '`emitChangeEvent(toggle)`. It used to read the source off the selection, which is empty right ' +
            'after the last toggle of a multiple-selection group is unchecked — `KbqButtonToggleChange.source` ' +
            'came out `undefined` there, against its own type.'
    ]
]);

/**
 * Warnings for `.ts` files. Only evaluated for files that reference button-toggle, which is what keeps the
 * looser patterns (`tabindex`, `mcButton`) scoped.
 */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\btabindex\\b|\\btabIndex\\b',
        message:
            'The tab order of a single-selection group changed: it is one tab stop now — the selected toggle, ' +
            'or the first enabled one — and the others render `tabindex="-1"`. A `multiple` group still keeps ' +
            'every toggle in the tab order. Assertions that count tab stops need updating.'
    },
    {
        pattern: '\\bmcButton\\b',
        message:
            '`mcButton` was removed from `KbqButtonToggle`. Use `focus()` / `focusViaKeyboard()`, which now ' +
            'reach the inner button.'
    },
    {
        pattern: '\\bmarkForCheck\\s*\\(',
        message:
            '`KbqButtonToggle.markForCheck()` still exists but the library no longer calls it: a toggle now ' +
            'derives `checked` and `disabled` from signals owned by its group and re-renders on its own. ' +
            'Manual calls are inert rather than wrong — check whether the surrounding workaround is still needed.'
    }
];

/** Warnings for stylesheets. Only evaluated for files that also mention the button-toggle. */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.kbq-icon-button\\b',
        message:
            'The button-toggle theme used to target `& > .kbq-icon-button`, a class `KbqButton` never emitted. ' +
            'It targets `.kbq-button-icon` now, alongside `.kbq-button`. A stylesheet copied from the old ' +
            'mixin selects nothing.'
    },
    {
        pattern: 'cdk-keyboard-focused[^{]*\\{[^}]*border-color',
        message:
            'The keyboard-focus `border-color` is now owned by the theme alone, from ' +
            '`--kbq-button-toggle-item-states-focused-outline`. The structural stylesheet no longer declares ' +
            'it from the raw `--kbq-states-line-focus-theme`, so overriding the component token works ' +
            'regardless of import order — and an override that relied on source order may now lose.'
    }
];

/** Reported for an icon-only toggle that has no accessible name. `%s` is replaced with the line number. */
export const UNNAMED_ICON_TOGGLE_MESSAGE =
    'line %s: `<kbq-button-toggle>` projects icons only and has no accessible name, so its button is ' +
    'announced as an unlabelled button (AXE `button-name`). Add `aria-label` or `aria-labelledby` — both are ' +
    'inputs of the toggle now and are forwarded to the inner button. In development builds this also logs a ' +
    'console warning.';

/** Behaviour changes that no call site can point at, printed once per run. */
export const BEHAVIOUR_NOTE = [
    'Behaviour changes with no call site to migrate:',
    '- A single-selection group renders role="radiogroup" and its inner buttons role="radio" + aria-checked;',
    '  a multiple-selection group renders role="group" and aria-pressed. The group also renders',
    '  aria-orientation, following `vertical`. Snapshot and DOM-query tests change.',
    '- Arrow keys now move focus and selection together inside a single-selection group, and Home/End jump to',
    '  its ends. The keydown is preventDefault-ed, so a consumer handler on the same keys no longer runs.',
    '- Name the group with the new aria-label / aria-labelledby inputs so its purpose is announced along with',
    '  the selected item.',
    '- `disabled` on a standalone toggle returns a real boolean. It used to return the group it could not',
    '  find — `null` — whenever the toggle was not disabled itself: falsy either way, but `=== false` and',
    '  `typeof` checks behaved differently.',
    '- `tabIndex` defaults to `null` instead of `undefined`, which is what its declared type always said.',
    '- `KbqButtonToggleGroup` implements OnDestroy and ignores a sync scheduled by a toggle that outlived it,',
    '  so tearing a whole selected group down no longer emits valueChange after destruction.',
    '- `onTouched` / `registerOnTouched` take `() => void` instead of `any`, and',
    '  KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR is typed `Provider`.',
    '- The focus ring is unchanged, but measured: 2.77:1 against the group background in the light theme,',
    '  under the 3:1 of WCAG 1.4.11. It comes from the shared --kbq-states-line-focus-theme token.'
];

/**
 * Reported when a file works with a group but reads `vertical` / `multiple` on a receiver declared
 * somewhere else, which is as far as a single-file pass can see.
 */
export const UNRESOLVED_SIGNAL_READ_MESSAGE =
    'This file reads `vertical` or `multiple` on a receiver that is not declared in it, so the read could ' +
    'not be verified or rewritten. Both are `input()` signals now: check by hand whether the receiver is a ' +
    '`KbqButtonToggleGroup`, and if it is, append `()` to the read.';

/** Reported when a template names the group but cannot be parsed, so nothing was inspected or rewritten. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references the button-toggle but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its template reference variable, and check icon-only toggles for an accessible name, by hand.';
