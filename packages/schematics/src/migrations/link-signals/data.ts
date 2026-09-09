/**
 * Data for the `link-signals` migration.
 *
 * The three inputs the automated signal migration skipped were all accessors, and each of them did
 * something beyond storing a value.
 *
 * - `link.disabled` → `link.disabled()` (auto-fixed, with a caveat about what it reports)
 * - `link.tabIndex` → a signal whose value changed: the getter folded in the disabled state (warn)
 * - `link.print` → was write-only (a setter with no getter), so it has no read to rewrite (warn on writes)
 * - the icon and print bookkeeping → `protected`, `private` or gone (warn)
 *
 * `disabledSignal` stays a public `WritableSignal<boolean>`: `kbqTooltip` accepts a link through
 * `forDisabledComponent` and reads it, and that contract is typed on the tooltip side.
 */

/** Members of `KbqLink` a read of which must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['disabled'];

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** TypeScript type annotation that marks a receiver as a link. */
export const LINK_TYPE = 'KbqLink';

/** Import specifier that marks a file as a link consumer. */
export const LINK_PACKAGE = '@koobiq/components/link';

/**
 * `tabIndex` became a read-only `InputSignal` AND changed its value: the getter returned `-1` for a
 * disabled link, it now reports what was bound. The host attribute still goes to `-1` while the link is
 * disabled, so nothing about focus behavior changed — only a programmatic read sees the difference, and a
 * mechanical `()` append would silently change it.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['tabIndex'];

/** The write-only input: a setter with no getter, so there is no read to rewrite. */
export const WRITE_ONLY_MEMBERS: readonly string[] = ['print'];

/** Icon and print bookkeeping that became `protected`: a subclass still sees it, nothing outside does. */
export const PROTECTED_MEMBERS: readonly string[] = ['hasIcon', 'printMode', 'printUrl'];

/** Members that became `private`, so not even a subclass can name them. */
export const PRIVATE_MEMBERS: readonly string[] = ['icons', 'nativeElement'];

/** Members that are gone from the class altogether, including the lifecycle hook a subclass could call. */
export const REMOVED_MEMBERS: readonly string[] = ['icon', 'destroyRef', 'ngAfterContentInit'];

/** Every member a consumer can no longer read, whichever visibility it landed on. */
export const HIDDEN_MEMBERS: readonly string[] = [...PROTECTED_MEMBERS, ...PRIVATE_MEMBERS, ...REMOVED_MEMBERS];

/** Every member the access pass looks at, whatever it ends up doing with it. */
export const KNOWN_MEMBERS: readonly string[] = [
    ...SIGNAL_MEMBERS,
    ...VALUE_CHANGED_MEMBERS,
    ...WRITE_ONLY_MEMBERS,
    ...HIDDEN_MEMBERS
];

export const protectedMessage = (members: Iterable<string>): string =>
    `These KbqLink members are \`protected\` now: ${[...members].join(', ')}. They are the print and icon ` +
    'bookkeeping: the classes and the `print` attribute the directive puts on the anchor are the contract, ' +
    'not the state behind them.';

export const privateMessage = (members: Iterable<string>): string =>
    `These KbqLink members are \`private\` now, so a subclass cannot name them either: ` +
    `${[...members].join(', ')}. \`nativeElement\` has a public accessor - call \`getHostElement()\`; the ` +
    'icon query is internal, and the icon spacing classes are what it produces.';

export const removedMessage = (members: Iterable<string>): string =>
    `These KbqLink members are gone: ${[...members].join(', ')}. \`icon\` is dropped - \`icons\` already ` +
    'answered the one question it was asked - `destroyRef` is not held any more, so inject `DestroyRef` ' +
    'yourself if a subclass needs it, and `ngAfterContentInit` is not implemented, so an override calling ' +
    '`super.ngAfterContentInit()` no longer compiles: the icon classes follow the content query on their own.';

/** Reported for a programmatic write: every member is an `input()`, so the write no longer compiles. */
export const writeMessage = (members: Iterable<string>): string =>
    `These are \`input()\`s now, so a programmatic write no longer compiles: ${[...members].join(', ')}. ` +
    'Bind them in the template instead. `print` was a write-only input - a setter with no getter - and ' +
    '`tabIndex` had a setter too. The write is left untouched so the error points at your call site.';

export const valueChangedMessage = (members: Iterable<string>): string =>
    `${[...members].join(', ')} is a read-only InputSignal - read it as \`link.tabIndex()\`. Its value also ` +
    'changed: the getter used to fold in the disabled state and report -1 for a disabled link, it now ' +
    'reports what was bound. The host attribute still goes to -1 while the link is disabled. Migrate by hand.';

/**
 * Emitted next to the files the rewrite touched, because the call it writes is correct but does not report
 * quite the same value. The old getter mirrored `disabledSignal`, which `kbqTooltip` writes directly through
 * `forDisabledComponent`; the input reports only what was bound.
 */
export const DISABLED_CAVEAT =
    '  `disabled` reads here were rewritten to `disabled()`. That reports the bound input, while the old ' +
    'getter mirrored `disabledSignal` - the effective state the host bindings render. The two differ only ' +
    'if something writes `disabledSignal` directly, which is what `kbqTooltip` does through ' +
    '`forDisabledComponent`: read `disabledSignal()` at those call sites.';

/**
 * Reported for a read through a signal query, which is a signal holding the directive: the read needs two
 * calls rather than one. Emitted from the AST pass rather than a regex, so it follows the same receiver
 * resolution as the rewrite - the decorator form is a plain annotated field that the rewrite handles.
 *
 * `viewChild()` without `.required` is typed `Signal<KbqLink | undefined>`, so the safe spelling differs
 * between the two forms.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the directive behind a call of its own, so reading \`${member}\` through it needs ` +
    `a double call: \`this.link()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `print` accepts `string | null` instead of `any`, and `[print]="undefined"` no longer marks the link ' +
        'as printable. The old setter tested `value !== null`, so an explicit `undefined` passed it and added ' +
        '`kbq-link_print` while printing the href; the input tests `!= null`, which covers both. An unbound ' +
        'link behaves exactly as before: no class, and the href still lands in the `print` attribute.',
    '  A disabled link carries `aria-disabled` instead of the `disabled` attribute, which is not valid HTML ' +
        'on an anchor and told assistive tech nothing. If you styled `a[kbq-link][disabled]`, match ' +
        '`.kbq-disabled` or `[aria-disabled]` instead.'
];
