/**
 * Data for the `loader-overlay-signals` migration.
 *
 * `text` and `caption` were the two inputs the automated signal migration skipped, because they are read
 * inside `@if` blocks and it would not risk the narrowing. They are `input()` now, and honest about being
 * optional: both were declared `string` over a field with no initializer, so an overlay that bound neither
 * reported `undefined` from a non-nullable type.
 *
 * - `overlay.text` / `overlay.caption` → calls (value unchanged — auto-fixed)
 * - the template helpers and the content queries → `protected` / `private` (warn)
 *
 * `size`, `transparent` and `card` were already signals in 20.2.0 and need no rewrite; `transparent` only
 * gained a `booleanAttribute` transform, which is reported rather than rewritten.
 */

/** Members of `KbqLoaderOverlay` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['text', 'caption'];

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Reported for a programmatic write, which has no mechanical translation: every member is an `input()`. */
export const writeMessage = (members: Iterable<string>): string =>
    `These are \`input()\`s now, so a programmatic write no longer compiles: ${[...members].join(', ')}. ` +
    'Bind them in the template instead. The write is left untouched so the error points at your call site.';

/** TypeScript type annotation that marks a receiver as a loader overlay. */
export const OVERLAY_TYPE = 'KbqLoaderOverlay';

/** Element selector whose template reference variables (`#ref`) point at a loader overlay. */
export const OVERLAY_ELEMENT = 'kbq-loader-overlay';

/** Import specifier that marks a file as a loader overlay consumer. */
export const OVERLAY_PACKAGE = '@koobiq/components/loader-overlay';

/** Template helpers that became `protected`: a subclass still sees them, nothing outside does. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'isExternalIndicator',
    'isExternalText',
    'isExternalCaption',
    'isEmpty',
    'spinnerSize'
];

/** Content queries that became `private`: not even a subclass can name them. */
export const PRIVATE_MEMBERS: readonly string[] = ['externalIndicator', 'externalText', 'externalCaption'];

/** Every member a consumer can no longer read, whichever visibility it landed on. */
export const HIDDEN_MEMBERS: readonly string[] = [...PROTECTED_MEMBERS, ...PRIVATE_MEMBERS];

export const protectedMessage = (members: Iterable<string>): string =>
    `These KbqLoaderOverlay members are \`protected\` now: ${[...members].join(', ')}. They are the ` +
    'template helpers behind the projection slots: what the overlay renders is the contract, not how it ' +
    'decides. Read the DOM, or track the projected content yourself.';

export const privateMessage = (members: Iterable<string>): string =>
    `These KbqLoaderOverlay content queries are \`private\` now, so a subclass cannot name them either: ` +
    `${[...members].join(', ')}. Project the content and read the DOM, or track it yourself.`;

/**
 * Reported for a read through a signal query, which is a signal holding the component: the read needs two
 * calls rather than one. Emitted from the AST pass rather than a regex, so it follows the same receiver
 * resolution as the rewrite - the decorator form is a plain annotated field that the rewrite handles, and
 * telling the reader it needs two calls there would break working code.
 *
 * `viewChild()` without `.required` is typed `Signal<KbqLoaderOverlay | undefined>`, so the safe spelling
 * differs between the two forms.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the component behind a call of its own, so reading \`${member}\` through it needs ` +
    `two calls: \`this.overlay()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Reported when a template renders the overlay but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-loader-overlay> but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its template reference variables by hand. If every template is reported this way, ' +
    '`@angular/compiler` could not be loaded from this install.';

/**
 * Reported when a file names `KbqLoaderOverlay` in a type position the receiver pass cannot scope to a
 * single identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads a member in a
 * shape the access pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqLoaderOverlay is used here in a way this migration cannot resolve to a single receiver, so any ' +
    'signal read through it was left untouched. Check these lines by hand:';

/** Reported per file for the one change that produces no compile error anywhere. */
export const TRANSPARENT_ATTRIBUTE_MESSAGE =
    '`<kbq-loader-overlay transparent>` renders the transparent background now. The valueless attribute used ' +
    'to pass the empty string, which is falsy, so it rendered the *filled* background - the opposite of what ' +
    'it reads as. Nothing here fails to compile: check what this markup was relying on.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `text` and `caption` report `string | undefined` instead of `string`. Both were declared non-nullable ' +
        'over a field with no initializer, so an overlay that bound neither always handed back `undefined` — ' +
        'the call sites that were already wrong now fail to compile.',
    '  `transparent` is a `booleanAttribute` input, and it flips in both directions. A valueless attribute, ' +
        '`0` and `NaN` used to read as false, so <kbq-loader-overlay transparent> rendered the *filled* ' +
        'background - the opposite of what it reads as - and they all mean true now. Conversely ' +
        '[transparent]="\'false\'" was a non-empty string, so it used to mean true, and now means false.'
];
