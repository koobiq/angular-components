/**
 * Data for the `app-switcher-signals` migration.
 *
 * `KbqAppSwitcherTrigger` moved `selectedApp` / `selectedSite` from a plain `@Input()` (plus a matching
 * `output()`) to `model()`, and the review that came with it removed several members that never did anything.
 *
 * Only `selectedApp` is a value-preserving property → signal change, so only it is auto-fixed. `selectedSite`
 * also changed *what it returns* — the old getter handed back the site with its applications already grouped,
 * the model returns the value that was passed in — so a mechanical `()` would silently change the value and it
 * is surfaced as a warning instead.
 *
 * Template *bindings* (`[selectedApp]`, `[(selectedSite)]`, `(selectedAppChange)`) keep working; only
 * programmatic access and reads through a `#ref="kbqAppSwitcher"` break.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** TypeScript type annotation that marks a receiver as the app-switcher trigger. */
export const TRIGGER_TYPE = 'KbqAppSwitcherTrigger';

/** `exportAs` of the trigger: a `#ref="kbqAppSwitcher"` in a template points at one. */
export const TRIGGER_EXPORT_AS = 'kbqAppSwitcher';

/** Members whose value is unchanged: a read becomes a call, a write becomes `.set(…)`. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['selectedApp'];

/** Of those, the ones backed by `model()`, so a write can be rewritten rather than left to the compiler. */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set(['selectedApp']);

/**
 * Methods of the signal/model API. A member access followed by one of these is already migrated — or is the
 * result of the rename below — so no `()` is appended. This is what makes the migration idempotent.
 */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/**
 * Outputs folded into their model. `ModelSignal` implements `OutputRef`, so `.subscribe(fn)` keeps the exact
 * same signature and the access can simply be renamed; `.emit(v)` has no equivalent and is warned about.
 */
export const OUTPUT_TO_MODEL: ReadonlyMap<string, string> = new Map([['selectedAppChange', 'selectedApp']]);

/**
 * Members accessed on a trigger that changed their value semantics or disappeared. Reported with the file they
 * were found in; never rewritten.
 */
export const MANUAL_MEMBERS: ReadonlyMap<string, string> = new Map([
    [
        'selectedSite',
        '`selectedSite` is now a `model()`, and its value changed: the old getter returned the site with its ' +
            'applications already grouped, the model returns the value that was passed in. Read ' +
            '`trigger.selectedSite()` for the raw site or `trigger.parsedSelectedSite()` for the grouped one, ' +
            'and write with `trigger.selectedSite.set(…)`.'
    ],
    [
        'selectedSiteChange',
        '`selectedSiteChange` is now the implicit output of the `selectedSite` model: subscribe with ' +
            '`trigger.selectedSite.subscribe(…)`. It emits the raw site, not the grouped one the old output ' +
            'carried. Replace `.emit(v)` with `trigger.selectedSite.set(v)`.'
    ],
    [
        'selectedAppChange',
        '`selectedAppChange` is now the implicit output of the `selectedApp` model: subscribe with ' +
            '`trigger.selectedApp.subscribe(…)` and replace `.emit(v)` with `trigger.selectedApp.set(v)`.'
    ],
    [
        'header',
        '`KbqAppSwitcherTrigger.header` was removed — the popup never rendered a header, so the value was ' +
            'pushed into the overlay and dropped. Delete the usage.'
    ],
    [
        'footer',
        '`KbqAppSwitcherTrigger.footer` was removed — the popup never rendered a footer, so the value was ' +
            'pushed into the overlay and dropped. Delete the usage.'
    ]
]);

/**
 * Warnings for `.ts` files. Checked against the post-fix content, so an auto-fixed usage does not also produce
 * a "manual migration required" note. Only evaluated for files that reference the app-switcher, which is what
 * keeps the looser patterns (`getIcon(`, `icon:`) scoped.
 */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\b(?:isTrapFocus|updateTrapFocus)\\b',
        message:
            '`KbqAppSwitcherComponent.isTrapFocus` / `updateTrapFocus()` were removed: the template never ' +
            'bound `[cdkTrapFocus]`, so neither did anything. Delete the usage.'
    },
    {
        pattern: '\\bgetIcon\\s*\\(',
        message:
            '`KbqAppSwitcherDropdownApp.getIcon()` was removed. Inline `icon` markup is now sanitized by ' +
            '`KbqAppSwitcherIconSanitizer` and rendered by the component itself — drop the call.'
    },
    {
        pattern: '\\bKbqAppSwitcherListItem\\b',
        message:
            '`KbqAppSwitcherListItem.collapsed` is now a `model()`: read it as `collapsed()` and write it as ' +
            '`collapsed.set(v)`. Its `app` input became `input.required`, so it must be bound.'
    },
    {
        pattern: '\\bKbqAppSwitcherDropdown(?:App|Site)\\b',
        message:
            'The `app` / `site` inputs of `KbqAppSwitcherDropdownApp` / `KbqAppSwitcherDropdownSite` are now ' +
            '`input.required` signals and must be bound.'
    },
    {
        pattern: '\\bicon\\s*:',
        message:
            'Inline `icon` SVG markup is now sanitized against a strict SVG allow-list before it is rendered: ' +
            '`<script>`, `<style>`, `<foreignObject>`, HTML elements, every `on*` handler and any external ' +
            'reference are removed, and markup that changes shape when re-parsed is dropped entirely (the row ' +
            'then falls back to `iconSrc`). Check icons that rely on any of those.'
    }
];

/**
 * Behaviour changes that no usage pattern can point at, printed once per run.
 */
export const BEHAVIOUR_NOTE = [
    'Behaviour changes with no call site to migrate:',
    '- KbqAppSwitcherModule no longer provides FocusTrapFactory / FOCUS_TRAP_INERT_STRATEGY. The app-switcher',
    '  never rendered a focus trap, and those providers are injector-wide: they disabled the CDK inert',
    '  strategy for every other focus trap in the same scope. If your app relied on that, provide them',
    '  explicitly where they are actually needed.',
    '- defaultGroupBy now identifies a synthetic group by its type name instead of an empty `id`.',
    '- The popup hides itself when it scrolls out of an ancestor marked `kbq-hide-nested-popup`. The guard',
    '  that used to suppress this never passed, so the behaviour is effectively new.'
];

/** Reported when a template names the trigger but cannot be parsed, so nothing was rewritten in it. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references the app-switcher but could not be parsed, so it was left untouched. ' +
    'Migrate reads through its template reference variable by hand.';
