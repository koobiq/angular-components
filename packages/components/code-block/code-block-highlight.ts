import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    InjectionToken,
    input,
    isDevMode,
    numberAttribute,
    PendingTasks,
    Provider,
    Renderer2,
    SecurityContext,
    signal
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import type { HLJSApi, LanguageFn } from 'highlight.js';
import { KbqCodeBlockHighlightJsLoader, PLAIN_TEXT_LANGUAGE } from './code-block-highlight-js-loader';
import { KbqCodeBlockFile } from './types';

/**
 * Configuration of highlight.js, which highlights the code of a code block: how to load it and which languages to
 * register. Without a configuration, the code block loads the highlight.js core, which has no languages, and shows the
 * code as plain text. Provide it with `kbqCodeBlockHighlightJsConfigProvider`.
 */
export type KbqCodeBlockHighlightJsConfig = Partial<{
    /**
     * Lazy loader for the highlight.js instance. The core has no languages: register the ones the files use in
     * `languages`, or load all of them with `() => import('highlight.js')`, the full bundle of about 1 MB.
     * Defaults to `() => import('highlight.js/lib/core')`.
     */
    core: () => Promise<{ default: HLJSApi }>;

    /**
     * Map of language name to lazy loader for that language's LanguageFn. A language of highlight.js loads from
     * `highlight.js/lib/languages/<name>`, where `<name>` is the name of its file in
     * [src/languages](https://github.com/highlightjs/highlight.js/tree/11-stable/src/languages). Plain text needs no
     * entry: the code block registers it as the fallback language.
     */
    languages: Record<string, () => Promise<{ default: LanguageFn }>>;
}>;

/**
 * Injection token for configuring `KbqCodeBlockHighlightJsConfig`.
 */
export const KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG = new InjectionToken<KbqCodeBlockHighlightJsConfig>(
    'KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG'
);

/**
 * Utility provider for `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG`.
 *
 * @example
 * ```ts
 * providers: [
 *   kbqCodeBlockHighlightJsConfigProvider({
 *     languages: {
 *       typescript: () => import('highlight.js/lib/languages/typescript'),
 *       css: () => import('highlight.js/lib/languages/css'),
 *       html: () => import('highlight.js/lib/languages/xml')
 *     }
 *   })
 * ]
 * ```
 */
export const kbqCodeBlockHighlightJsConfigProvider = (options: KbqCodeBlockHighlightJsConfig): Provider => ({
    provide: KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG,
    useValue: options
});

/**
 * Fallback language for code block if language is not supported/specified. It has to be registered in `languages` of
 * `KbqCodeBlockHighlightJsConfig`, unless it is plain text or the full bundle of highlight.js is loaded, or the code
 * block falls back to `plaintext`.
 *
 * See the [list of supported languages](https://github.com/highlightjs/highlight.js/blob/11-stable/SUPPORTED_LANGUAGES.md).
 */
export const KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE = new InjectionToken<string>(
    'KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE',
    { factory: () => PLAIN_TEXT_LANGUAGE }
);

/** Utility provider for `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE`. */
export const kbqCodeBlockFallbackFileLanguageProvider = (language: string): Provider => ({
    provide: KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE,
    useValue: language
});

/**
 * Marks the markup the directive has highlighted. Found while highlight.js has yet to load, it can only have come
 * from the server: once the browser has highlighted a file, highlight.js stays loaded. Not `data-highlighted`, which
 * highlight.js sets on the elements it highlights itself.
 */
const HIGHLIGHTED_MARKUP_ATTRIBUTE = 'data-highlighted-markup';

const LINE_BREAK = /\r\n|\r|\n/g;

/** Indices of the lines to mark, and the columns of each line between which its text is marked. */
type CodeBlockMarks = { lines: Set<number>; text: Map<number, [from: number, to: number][]> };

/**
 * Directive which applies syntax highlighting to the code block content.
 *
 * @docs-private
 */
@Directive({
    selector: 'code[kbqCodeBlockHighlight]',
    host: {
        class: 'hljs',
        // Bound to the file rather than to the highlighted markup, so that markup kept from the server is numbered
        // before highlight.js loads again.
        '[class.kbq-code-block__code_line-numbers]': 'lineCount() > 1 || singleLine()',
        '[style.--kbq-code-block-line-numbers-start]': 'startFrom() - 1',
        '[style.--kbq-code-block-line-numbers-digits]': 'lineNumberDigits()'
    },
    exportAs: 'kbqCodeBlockHighlight'
})
export class KbqCodeBlockHighlight {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly pendingTasks = inject(PendingTasks);
    private readonly loader = inject(KbqCodeBlockHighlightJsLoader);
    private readonly fallbackFileLanguage = inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE);
    // Read here and handed to the loader: a component or a route may provide a configuration of its own.
    private readonly config = inject(KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG, { optional: true });
    private readonly _pending = signal(false);

    /**
     * Whether syntax highlighting is pending.
     *
     * @docs-private
     */
    readonly pending = this._pending.asReadonly();

    /** The code file. */
    readonly file = input.required<KbqCodeBlockFile>();

    constructor() {
        effect((onCleanup) => {
            const file = this.file();
            const hljs = this.loader.loaded(this.config);

            if (hljs) {
                this.highlight(hljs, file);

                return;
            }

            // The template leaves `<code>` empty, so that hydration does not look for a text node the highlighted
            // markup has replaced. The plain content stands in until highlighting lands, and for good if it fails.
            const keepsServerMarkup = this.nativeElement.hasAttribute(HIGHLIGHTED_MARKUP_ATTRIBUTE);

            if (keepsServerMarkup) {
                // Markup from the server stays instead, rather than flash plain text over code that arrived
                // highlighted. Once: the file of a later run is not the one it was rendered for.
                this.renderer.removeAttribute(this.nativeElement, HIGHLIGHTED_MARKUP_ATTRIBUTE);
            } else {
                this.renderer.setProperty(this.nativeElement, 'textContent', file.content);
                this.renderer.removeAttribute(this.nativeElement, 'data-language');
            }

            // A `file` that arrives while highlight.js is still loading must not be overwritten by the previous
            // one, and nothing may be highlighted through a directive that has gone away in the meantime.
            let cancelled = false;

            onCleanup(() => (cancelled = true));

            // `pending` holds the code block until the load settles, failed or not. A block with nothing highlighted to
            // show holds the application as well, so that server rendering and tests wait for the highlighted markup.
            // Markup kept from the server needs no task: it would keep a hydrated page unstable, and Angular replays
            // what a reader did before hydration only once the page is stable.
            this._pending.set(true);
            const removeTask = keepsServerMarkup ? null : this.pendingTasks.add();

            this.loader
                .load(this.config)
                .then((loaded) => {
                    if (loaded && !cancelled) this.highlight(loaded, file);
                })
                .finally(() => {
                    // A run cancelled by a newer file leaves `pending` to that one.
                    if (!cancelled) this._pending.set(false);

                    removeTask?.();
                });
        });
    }

    /** The starting line number. */
    readonly startFrom = input<number, unknown>(1, { transform: (value: unknown) => numberAttribute(value, 1) });

    /** Whether to display line numbers for single line code block. */
    readonly singleLine = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Number of lines of the file, a line break at its end not counted, as it starts no line. */
    protected readonly lineCount = computed(() => {
        const lines = this.file().content.split(LINE_BREAK);

        return lines.length > 1 && !lines[lines.length - 1] ? lines.length - 1 : lines.length;
    });

    /** Width of the line numbers column, in digits of its largest number. */
    protected readonly lineNumberDigits = computed(() => String(this.startFrom() + this.lineCount() - 1).length);

    private highlight(hljs: HLJSApi, file: KbqCodeBlockFile): void {
        this._pending.set(true);

        let { language } = file;
        const isKnownLanguage = !!language && !!hljs.getLanguage(language);

        if (!language || !isKnownLanguage) {
            const fallbackLanguage = this.fallbackLanguage(hljs);

            // A file without a language is plain text by design; only a language the core lacks is a mistake.
            if (language) {
                this.warn(
                    `[KbqCodeBlock] Unknown file language: "${language}". Fall back to "${fallbackLanguage}".`,
                    file
                );
            }

            language = fallbackLanguage;
        }

        const {
            value: highlightedHTML,
            language: highlightedLanguage,
            illegal,
            relevance
        } = hljs.highlight(file.content, { language });

        if (illegal) {
            this.warn('[KbqCodeBlock] File content contains illegal characters.', file);
        }

        // Plain text and an empty file have no syntax to score, so their relevance is always 0. Plain text is compared by
        // definition: highlight.js returns the name the file gives, which may be an alias such as `text`.
        const isPlainText = hljs.getLanguage(language) === hljs.getLanguage(PLAIN_TEXT_LANGUAGE);

        if (relevance === 0 && isKnownLanguage && !isPlainText && file.content.trim()) {
            this.warn('[KbqCodeBlock] File content does not match the specified programming language.', file);
        }

        const safeHTML =
            this.domSanitizer.sanitize(
                SecurityContext.HTML,
                this.splitIntoLines(highlightedHTML, this.findMarks(file))
            ) ?? '';

        this.renderer.setAttribute(this.nativeElement, 'data-language', highlightedLanguage!);
        this.renderer.setProperty(this.nativeElement, 'innerHTML', safeHTML);
        this.renderer.setAttribute(this.nativeElement, HIGHLIGHTED_MARKUP_ATTRIBUTE, '');

        this._pending.set(false);
    }

    /**
     * Wraps every line of the highlighted markup in an element of its own, for the line numbers to count. The spans a
     * line break crosses are closed at the end of its line and opened again on the next one. The line break stays
     * inside its line, so that an empty line keeps its height and the text of the code is the text of the file.
     *
     * Marked text is wrapped in marks that hold text only, so that a mark never crosses a tag: text marked across a
     * span or a line break is marked piece by piece.
     */
    private splitIntoLines(html: string, marks: CodeBlockMarks): string {
        const lines: string[] = [];
        const openSpans: string[] = [];
        let line = '';
        let lineHasText = false;
        let markedColumns = marks.text.get(0);
        let column = 0;
        let markOpen = false;

        const closeMark = () => {
            if (markOpen) line += '</mark>';

            markOpen = false;
        };

        // highlight.js emits spans and escaped text. A tag of another kind, which a plugin of highlight.js may add,
        // passes through as it is.
        for (const [token, lineBreak] of html.matchAll(/(\r\n|\r|\n)|<span[^>]*>|<\/span>|<[^>]*>|[^<\r\n]+/g)) {
            if (lineBreak) {
                closeMark();
                lines.push(`${line}${'</span>'.repeat(openSpans.length)}\n`);
                line = openSpans.join('');
                lineHasText = false;
                markedColumns = marks.text.get(lines.length);
                column = 0;

                continue;
            }

            if (token.startsWith('<')) {
                closeMark();

                if (token === '</span>') {
                    openSpans.pop();
                } else if (token.startsWith('<span')) {
                    openSpans.push(token);
                }

                line += token;

                continue;
            }

            lineHasText = true;

            if (!markedColumns) {
                line += token;

                continue;
            }

            // The text is escaped, so a character of the file is an entity or itself.
            for (const [character] of token.matchAll(/&[^;]+;|[^&]/g)) {
                const marked = markedColumns.some(([from, to]) => from <= column && column < to);

                if (marked !== markOpen) {
                    line += marked ? '<mark class="kbq-code-block__mark">' : '</mark>';
                    markOpen = marked;
                }

                line += character;
                column++;
            }
        }

        closeMark();

        // A line break at the end of the file starts no line, though the spans it crosses close after it.
        if (lineHasText) lines.push(line);

        return lines
            .map((content, index) => {
                const className = marks.lines.has(index)
                    ? 'kbq-code-block__line kbq-code-block__line_marked'
                    : 'kbq-code-block__line';

                return `<span class="${className}">${content}</span>`;
            })
            .join('');
    }

    /**
     * Finds what the marks of the file mark. Text is found in the content and marked by columns of its lines: the
     * highlighted markup escapes characters and may write a line break differently, so its offsets are not the
     * content's.
     */
    private findMarks(file: KbqCodeBlockFile): CodeBlockMarks {
        // A file that comes as JSON may hold `null` for a mark field it does not set.
        const { content } = file;
        const markedLines = file.markedLines ?? [];
        const markedText = file.markedText ?? [];
        const marks: CodeBlockMarks = { lines: new Set(), text: new Map() };

        if (!markedLines.length && !markedText.length) return marks;

        // Where every line starts and where it ends, before its line break.
        const lines: [start: number, end: number][] = [];
        let start = 0;

        for (const { index, 0: lineBreak } of content.matchAll(LINE_BREAK)) {
            lines.push([start, index]);
            start = index + lineBreak.length;
        }

        // A line break at the end of the file starts no line.
        if (start < content.length || !lines.length) lines.push([start, content.length]);

        const lineAt = (offset: number): number => {
            let low = 0;
            let high = lines.length - 1;

            while (low < high) {
                const middle = Math.ceil((low + high) / 2);

                if (lines[middle][0] <= offset) {
                    low = middle;
                } else {
                    high = middle - 1;
                }
            }

            return low;
        };

        for (const mark of markedLines) {
            let ranges: [first: number, last: number][];

            if (typeof mark === 'number') {
                ranges = [[mark, mark]];
            } else if (Array.isArray(mark)) {
                ranges = [mark];
            } else {
                ranges = this.findMatches(content, mark).map(([from, to]) => [
                    lineAt(from) + 1,
                    lineAt(Math.max(from, to - 1)) + 1
                ]);
            }

            let marksLine = false;

            for (const [first, last] of ranges) {
                if (!Number.isInteger(first) || !Number.isInteger(last)) continue;

                for (let line = Math.max(first, 1); line <= Math.min(last, lines.length); line++) {
                    marks.lines.add(line - 1);
                    marksLine = true;
                }
            }

            if (!marksLine) {
                this.warn('[KbqCodeBlock] Line mark does not mark any line of the file.', mark, file);
            }
        }

        for (const mark of markedText) {
            const matches = this.findMatches(content, mark).filter(([from, to]) => from < to);

            if (!matches.length) {
                this.warn('[KbqCodeBlock] Text mark does not mark any text of the file.', mark, file);
            }

            for (const [from, to] of matches) {
                for (let line = lineAt(from); line < lines.length && lines[line][0] < to; line++) {
                    const [lineStart, lineEnd] = lines[line];
                    const columns: [number, number] = [
                        Math.max(from, lineStart) - lineStart,
                        Math.min(to, lineEnd) - lineStart
                    ];

                    if (columns[0] >= columns[1]) continue;

                    const lineColumns = marks.text.get(line);

                    if (lineColumns) {
                        lineColumns.push(columns);
                    } else {
                        marks.text.set(line, [columns]);
                    }
                }
            }
        }

        return marks;
    }

    /**
     * Every match of a string or a regular expression in the content, from the offset where it starts to the one
     * where it ends. A regular expression with capturing groups matches what they capture.
     */
    private findMatches(content: string, pattern: string | RegExp): [from: number, to: number][] {
        if (typeof pattern === 'string') {
            const matches: [number, number][] = [];
            let from = pattern ? content.indexOf(pattern) : -1;

            while (from !== -1) {
                matches.push([from, from + pattern.length]);
                from = content.indexOf(pattern, from + pattern.length);
            }

            return matches;
        }

        // A copy that finds every match and the indices of its groups, whatever the flags of the original.
        const regExp = new RegExp(pattern.source, `${pattern.flags.replace(/[dg]/g, '')}dg`);

        return Array.from(content.matchAll(regExp), ({ indices }) => indices!).flatMap(([match, ...groups]) =>
            groups.length ? groups.filter(Boolean) : [match]
        );
    }

    /** The fallback language, or plain text, which the loader registers on every instance, if it is unknown too. */
    private fallbackLanguage(hljs: HLJSApi): string {
        if (hljs.getLanguage(this.fallbackFileLanguage)) return this.fallbackFileLanguage;

        this.warn(
            `[KbqCodeBlock] Unknown fallback language: "${this.fallbackFileLanguage}". Fall back to "${PLAIN_TEXT_LANGUAGE}".`
        );

        return PLAIN_TEXT_LANGUAGE;
    }

    private warn(...messages: unknown[]): void {
        if (!isDevMode()) return;

        // eslint-disable-next-line no-console
        console.warn(...messages);
    }
}
