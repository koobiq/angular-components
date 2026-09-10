/**
 * Data for the `code-block-signals` migration.
 *
 * `KbqCodeBlock` finished its move to signals: nothing on it is a decorator input any more.
 *
 * - `softWrap`, `viewAll`, `canDownload`, `files`, `activeFileIndex`, `hideTabs` → `WritableSignal`s over
 *   a backing `input()`, so a read becomes a call and a plain write becomes `.set(…)` (auto-fixed)
 * - `maxHeight` was already a signal input; only its type changed (warn)
 * - `canLoad` and `codeFiles`, the deprecated write-only aliases, are backing inputs now: bind them, a
 *   programmatic write no longer compiles (warn)
 *
 * A `model()` would have been the obvious shape for the six, but `ModelOptions` carries no `transform`,
 * and every one of them needs `booleanAttribute` or `numberAttribute` to keep a valueless attribute
 * (`<kbq-code-block softWrap>`) working. Hence the backing input plus a `linkedSignal` over it.
 */

/** Members whose value is unchanged; a read must become a call, a write must become `.set(…)`. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'softWrap',
    'viewAll',
    'canDownload',
    'files',
    'activeFileIndex',
    'hideTabs'
];

/**
 * Members the migration reports rather than rewrites: `maxHeight` was already a signal input and only
 * changed its type, and `KbqCodeBlockHighlight.file` turned from a write-only setter into a required
 * input. Both are reported per file, because a summary line names no call site.
 */
export const REPORTED_MEMBERS: readonly string[] = ['maxHeight', 'file'];

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** `exportAs` name a template reference has to carry to be the code block rather than some other directive. */
export const CODE_BLOCK_EXPORT_AS = 'kbqCodeBlock';

/** TypeScript type annotation that marks a receiver as a code block. */
export const CODE_BLOCK_TYPE = 'KbqCodeBlock';

/** Type annotation that marks a receiver as the highlight directive, whose `file` input also changed. */
export const HIGHLIGHT_TYPE = 'KbqCodeBlockHighlight';

/** Element selector whose template reference variables (`#ref`) point at a code block. */
export const CODE_BLOCK_ELEMENT = 'kbq-code-block';

/** Import specifier that marks a file as a code block consumer. */
export const CODE_BLOCK_PACKAGE = '@koobiq/components/code-block';

/**
 * Members that can no longer be reached from outside the component: the backing inputs behind the six
 * signals, plus the two deprecated aliases that used to be write-only setters.
 */
export const PROTECTED_MEMBERS: readonly string[] = [
    'softWrapInput',
    'viewAllInput',
    'canDownloadInput',
    'canLoadInput',
    'filesInput',
    'codeFilesInput',
    'activeFileIndexInput',
    'hideTabsInput'
];

/** Reported for a write the rewrite cannot translate on its own. */
export const writeMessage = (members: Iterable<string>): string =>
    `These writes were left untouched: ${[...members].join(', ')}. A plain \`x.softWrap = value\` is ` +
    'rewritten to `x.softWrap.set(value)`, but a compound assignment (`||=`, `+=`) or an increment would ' +
    'need the receiver spelled twice, and `canLoad` / `codeFiles` are backing inputs now, so writing them ' +
    'no longer compiles at all - bind the attribute instead.';

export const reportedMessage = (members: Iterable<string>): string =>
    `These KbqCodeBlock members changed shape without changing name: ${[...members].join(', ')}. ` +
    '`maxHeight` reports `number | undefined` instead of `number` and never NaN, so decide per call site ' +
    'between `?? 0` and handling the unset state. `KbqCodeBlockHighlight.file` was a write-only setter ' +
    'and is a required input now: bind `[file]`, and read it as `file()`.';

export const protectedMessage = (members: Iterable<string>): string =>
    `These KbqCodeBlock members are backing inputs now and cannot be read or written from outside: ` +
    `${[...members].join(', ')}. Bind the attribute they alias - \`softWrap\`, \`viewAll\`, ` +
    '`canDownload`, `canLoad`, `files`, `codeFiles`, `activeFileIndex`, `hideTabs` - and read the signal ' +
    'of the same name as the attribute.';

/**
 * Reported for a read through a signal query, which is a signal holding the component: the read needs two
 * calls rather than one. Emitted from the AST pass rather than a regex, so it follows the same receiver
 * resolution as the rewrite.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the component behind a call of its own, so reading \`${member}\` through it ` +
    `needs two calls: \`this.codeBlock()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Reported when a template renders the code block but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-code-block> but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its template reference variables by hand. If every template is reported this way, ' +
    '`@angular/compiler` could not be loaded from this install.';

/**
 * Reported when a file names `KbqCodeBlock` in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads a member in a shape
 * the access pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqCodeBlock is used here in a way this migration cannot resolve to a single receiver, so any signal ' +
    'read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `maxHeight` reports `number | undefined` instead of `number`, and a value that is not cleanly ' +
        "numeric - a valueless `maxHeight` attribute, `'200px'` - reports `undefined` rather than NaN. " +
        'It was declared non-nullable over an `undefined!` default, so a block with no binding always ' +
        'handed back `undefined` behind a `number` type.',
    '  `KbqCodeBlockHighlight.file` was a write-only required input that started highlighting as a side ' +
        'effect. It is a required signal input driven by an effect now, so it can finally be read - and a ' +
        'programmatic write no longer compiles.',
    '  Reading `hideTabs` reports what was bound. What the header actually does is `tabsHidden()`, which ' +
        'adds the rule that a single file with no filename hides the bar; the component used to write that ' +
        'rule into `hideTabs` itself, which latched the bar off for good.',
    '  `canLoad` and `codeFiles` fill in for `canDownload` and `files` rather than writing into them: ' +
        'either attribute turns the download button on, and `codeFiles` applies while `files` is empty. ' +
        'Which of each pair won used to depend on the order they sat in the template.',
    '  An `activeFileIndex` outside `files` renders the first file instead of the indexed one, and an ' +
        'empty `files` renders no code at all. Both used to reach `files[activeFileIndex]` and throw on ' +
        'the undefined result. The index itself is left alone: resetting it wrote back into ' +
        '`[(activeFileIndex)]` while the parent was still updating.'
];
