/**
 * Data for the `markdown-signals` migration.
 *
 * `markdownText` was the component's only input and the last accessor input in the package. Its setter did
 * the rendering, which is why the automated signal migration skipped it; the rendered HTML is a `computed`
 * now and the input is a plain `input()`.
 *
 * - `markdown.markdownText` → `markdown.markdownText()` (value unchanged — auto-fixed)
 * - `resultHtml` → a read-only `computed`; it was already `protected`, so only a subclass could ever name
 *   it, and only a write to it changed (warn)
 *
 * The setter also never cleared what it had rendered, which the review fixed — see `SUMMARY`.
 */

/** Members of `KbqMarkdown` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['markdownText'];

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** TypeScript type annotation that marks a receiver as a markdown component. */
export const MARKDOWN_TYPE = 'KbqMarkdown';

/** Element selector whose template reference variables (`#ref`) point at a markdown component. */
export const MARKDOWN_ELEMENT = 'kbq-markdown';

/** Import specifier that marks a file as a markdown consumer. */
export const MARKDOWN_PACKAGE = '@koobiq/components/markdown';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const SUBCLASS_ANCHOR = 'extends\\s+KbqMarkdown\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SUBCLASS_ANCHOR,
        pattern: '\\bresultHtml\\s*\\.\\s*set\\b',
        message:
            'KbqMarkdown.resultHtml is a read-only `computed` instead of a `WritableSignal`. It derives from ' +
            '`markdownText` and the projected content, so a subclass that used to push HTML into it has to feed ' +
            'the input instead.'
    },
    {
        anchor: '\\bKbqMarkdown\\w*\\b',
        // The signal-query spellings only. `@ViewChild(KbqMarkdown) md: KbqMarkdown` is a plain annotated
        // field that the receiver pass resolves and rewrites to a single call, so telling the reader it
        // needs a double call there would break working code; `viewChildren`/`ContentChildren` return an
        // array rather than the instance this message describes. Whitespace rather than `[^\n;]`, so a
        // prettier-wrapped call is matched too.
        pattern: '\\b(?:viewChild|contentChild)(?:\\s*\\.\\s*required)?\\s*(?:<[^<>()]*>)?\\s*\\(\\s*KbqMarkdown\\b',
        message:
            'A `viewChild(KbqMarkdown)` / `contentChild(KbqMarkdown)` query is itself a signal, so reading ' +
            '`markdownText` through it is a double call: `this.markdown().markdownText()`. The receiver pass ' +
            'cannot see through the query, so those reads are left untouched. Migrate them by hand.'
    }
];

/** Reported when a template renders the component but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-markdown> but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variables by hand.';

/**
 * Reported when a file names `KbqMarkdown` in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads the member in a shape
 * the access pass cannot reach. Those reads are left alone, and staying silent reads as "nothing to do".
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqMarkdown is used here in a way this migration cannot resolve to a single receiver, so any signal ' +
    'read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Clearing `markdownText` now clears the rendered output. The setter only re-rendered for a truthy value, ' +
        'so setting it back to null or an empty string left the previous HTML on screen indefinitely.',
    '  A `<kbq-markdown>` that both projects content and binds `[markdownText]` falls back to the projected ' +
        'content whenever the input is empty, not just at first render. The projected text is re-read when it ' +
        'changes, so content that only appears after the first render is picked up too.'
];
