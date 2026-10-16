import { isPlatformServer } from '@angular/common';
import {
    booleanAttribute,
    Directive,
    effect,
    inject,
    InjectionToken,
    input,
    isDevMode,
    numberAttribute,
    PendingTasks,
    PLATFORM_ID,
    Provider,
    Renderer2,
    SecurityContext,
    signal
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import type { HLJSApi, LanguageFn } from 'highlight.js';
import { KbqCodeBlockHighlightJsLoader, KbqCodeBlockLineNumbersOptions } from './code-block-highlight-js-loader';
import { KbqCodeBlockFile } from './types';

/** `highlight.js` configuration */
export type KbqCodeBlockHighlightJsConfig = Partial<{
    /** Lazy loader for highlight.js core (no bundled languages). When omitted, the full bundle is loaded. */
    core: () => Promise<{ default: HLJSApi }>;
    /** Map of language name to lazy loader for that language's LanguageFn. */
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
 *     core: () => import('highlight.js/lib/core'),
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
 * Fallback language for code block if language is not supported/specified.
 *
 * See the [list of supported languages](https://highlightjs.readthedocs.io/en/stable/supported-languages.html).
 */
export const KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE = new InjectionToken<string>(
    'KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE',
    { factory: () => 'plaintext' }
);

/** Utility provider for `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE`. */
export const kbqCodeBlockFallbackFileLanguageProvider = (language: string): Provider => ({
    provide: KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE,
    useValue: language
});

/**
 * Marks the markup the directive has highlighted. Found while highlight.js has yet to load, it can only have come
 * from the server: once the browser has highlighted a file, highlight.js stays loaded.
 */
const HIGHLIGHTED_ATTRIBUTE = 'data-highlighted';

/**
 * Directive which applies syntax highlighting to the code block content.
 *
 * @docs-private
 */
@Directive({
    selector: 'code[kbqCodeBlockHighlight]',
    host: {
        class: 'hljs'
    },
    exportAs: 'kbqCodeBlockHighlight'
})
export class KbqCodeBlockHighlight {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly pendingTasks = inject(PendingTasks);
    private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
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
            // Captured here rather than read inside `highlight()`: on the load path that read happens in a
            // microtask, where nothing is tracked, so the effect's dependencies would otherwise depend on
            // which branch had run before.
            const lineNumbers = { startFrom: this.startFrom(), singleLine: this.singleLine() };
            const hljs = this.loader.loaded(this.config);

            if (hljs) {
                this.highlight(hljs, file, lineNumbers);

                return;
            }

            // The template leaves `<code>` empty, so that hydration does not look for a text node the highlighted
            // markup has replaced. The plain content stands in until highlighting lands, and for good if it fails.
            if (this.nativeElement.hasAttribute(HIGHLIGHTED_ATTRIBUTE)) {
                // Markup from the server stays instead, rather than flash plain text over code that arrived
                // highlighted. Once: the file of a later run is not the one it was rendered for.
                this.renderer.removeAttribute(this.nativeElement, HIGHLIGHTED_ATTRIBUTE);
            } else {
                this.renderer.setProperty(this.nativeElement, 'textContent', file.content);
                this.renderer.removeAttribute(this.nativeElement, 'data-language');
            }

            // A `file` that arrives while highlight.js is still loading must not be overwritten by the previous
            // one, and nothing may be highlighted through a directive that has gone away in the meantime.
            let cancelled = false;

            onCleanup(() => (cancelled = true));

            // `pending` holds the code block, the pending task holds server rendering: both last until the load
            // settles, failed or not. The task is the server's only: in the browser it would keep the application
            // unstable, and Angular replays what a reader did before hydration only once it is stable.
            this._pending.set(true);
            const removeTask = this.isServer ? this.pendingTasks.add() : null;

            this.loader
                .load(this.config)
                .then((loaded) => {
                    if (loaded && !cancelled) this.highlight(loaded, file, lineNumbers);
                })
                .finally(() => {
                    // A run cancelled by a newer file leaves `pending` to that one.
                    if (!cancelled) this._pending.set(false);

                    removeTask?.();
                });
        });
    }

    /** The starting line number. */
    readonly startFrom = input<number, unknown>(1, { transform: numberAttribute });

    /** Whether to display line numbers for single line code block. */
    readonly singleLine = input<boolean, unknown>(false, { transform: booleanAttribute });

    private highlight(hljs: HLJSApi, file: KbqCodeBlockFile, lineNumbers: KbqCodeBlockLineNumbersOptions): void {
        this._pending.set(true);

        let { language } = file;
        const isKnownLanguage = !!language && !!hljs.getLanguage(language);

        if (!language || !isKnownLanguage) {
            // A file without a language is plain text by design; only a language the core lacks is a mistake.
            if (language) {
                this.warn(
                    `[KbqCodeBlock] Unknown file language: "${language}". Fall back to "${this.fallbackFileLanguage}".`,
                    file
                );
            }

            language = this.fallbackFileLanguage;
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

        // Plain text has no syntax to score, so its relevance is always 0 — even for the fallback itself.
        if (relevance === 0 && isKnownLanguage && highlightedLanguage !== 'plaintext') {
            this.warn('[KbqCodeBlock] File content does not match the specified programming language.', file);
        }

        const safeHTML = this.domSanitizer.sanitize(SecurityContext.HTML, highlightedHTML) ?? '';
        const highlightedHTMLWithLineNumbers = this.loader.addLineNumbers(safeHTML, lineNumbers);

        this.renderer.setAttribute(this.nativeElement, 'data-language', highlightedLanguage!);
        this.renderer.setProperty(this.nativeElement, 'innerHTML', highlightedHTMLWithLineNumbers);
        this.renderer.setAttribute(this.nativeElement, HIGHLIGHTED_ATTRIBUTE, '');

        this._pending.set(false);
    }

    private warn(...messages: unknown[]): void {
        if (!isDevMode()) return;

        // eslint-disable-next-line no-console
        console.warn(...messages);
    }
}
