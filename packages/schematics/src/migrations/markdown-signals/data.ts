/**
 * Data for the `markdown-signals` migration.
 *
 * `markdownText` was the component's only input and the last accessor input in the package. Its setter did
 * the rendering, which is why the automated signal migration skipped it; the rendered HTML is a `computed`
 * now and the input is a plain `input()`.
 *
 * - `markdown.markdownText` → `markdown.markdownText()` (value unchanged — auto-fixed)
 * - `resultHtml` → a read-only `computed`; only a subclass could see it, and only to write it (warn)
 *
 * The setter also never cleared what it had rendered, which the review fixed — see `SUMMARY`.
 */

/** Members of `KbqMarkdown` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['markdownText'];

/**
 * Signal members that are writable via `.set(...)`. `markdownText` is `input()` (read-only), so this is
 * empty — a programmatic write is left untouched and becomes a compile error the consumer fixes by hand.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

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
        anchor: '\\bKbqMarkdown\\b',
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqMarkdown\\b',
        message:
            'A KbqMarkdown view/content query returns the component instance, whose `markdownText` is now a ' +
            'signal — reading it is a double call, e.g. `this.markdown().markdownText()`. Verify query reads ' +
            'manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Clearing `markdownText` now clears the rendered output. The setter only re-rendered for a truthy value, ' +
        'so setting it back to null or an empty string left the previous HTML on screen indefinitely.',
    '  A `<kbq-markdown>` that both projects content and binds `[markdownText]` falls back to the projected ' +
        'content whenever the input is empty, not just at first render. The projected text itself is still ' +
        'captured once, after the first render — changing it later still does not re-render.'
];
