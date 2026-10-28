import { DOCUMENT } from '@angular/common';
import { inject, Injectable, isDevMode } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import type { HLJSApi } from 'highlight.js';
import plaintext from 'highlight.js/lib/languages/plaintext';
import type { KbqCodeBlockHighlightJsConfig } from './code-block-highlight';
import { highlightJSLineNumbersPlugin } from './highlightjs-line-numbers';

// The core and not the full bundle: a bundler emits a chunk for every `import()` it finds, called or not, so the
// full bundle has to be imported by the application that asks for it. An instance of its own, as the module is one
// object for the whole process, the full bundle included: the languages one configuration registers on it would reach
// every other, and every later server render.
const defaultHljsLoader = async (): Promise<{ default: HLJSApi }> => ({
    default: (await import('highlight.js/lib/core')).default.newInstance()
});

// The key of the default configuration: `config ?? {}` would make a new key on every call.
const DEFAULT_CONFIG: KbqCodeBlockHighlightJsConfig = {};

/**
 * Language the loader registers on every instance, the fallback of a file the code block cannot highlight otherwise.
 *
 * @internal
 */
export const PLAIN_TEXT_LANGUAGE = 'plaintext';

/**
 * Options of the line numbers table.
 *
 * @internal
 */
export type KbqCodeBlockLineNumbersOptions = { startFrom: number; singleLine: boolean };

/** The part of the API the line numbers plugin attaches to its host that the code block calls. */
type LineNumbersApi = {
    lineNumbersValue(value: string, options: KbqCodeBlockLineNumbersOptions): string;
};

/**
 * Loads highlight.js once per configuration and installs its line numbers plugin once per application.
 *
 * The configuration is passed in rather than injected: `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG` may be provided by a
 * component or a route, where a root service would not see it. Loads are shared by the identity of the configuration,
 * so the code blocks under one provider share one load.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class KbqCodeBlockHighlightJsLoader {
    private readonly document = inject<Document>(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    // Weak, so that a configuration made for one component instance goes away with it.
    private readonly loads = new WeakMap<KbqCodeBlockHighlightJsConfig, Promise<HLJSApi | null>>();
    private readonly instances = new WeakMap<KbqCodeBlockHighlightJsConfig, HLJSApi>();
    private lineNumbers: LineNumbersApi | null = null;

    /** The instance loaded for `config`, or `null` until it is. */
    loaded(config: KbqCodeBlockHighlightJsConfig | null): HLJSApi | null {
        return this.instances.get(config ?? DEFAULT_CONFIG) ?? null;
    }

    /**
     * Loads highlight.js for `config`, sharing the load in flight. A failure resolves to `null` rather than rejecting,
     * since the callers have nowhere to send a rejection, and is forgotten, so that the next file change tries again.
     */
    load(config: KbqCodeBlockHighlightJsConfig | null): Promise<HLJSApi | null> {
        const key = config ?? DEFAULT_CONFIG;
        let loading = this.loads.get(key);

        if (!loading) {
            loading = this.importInstance(key).then(
                (instance) => {
                    this.instances.set(key, instance);

                    return instance;
                },
                (error: unknown) => {
                    this.loads.delete(key);

                    if (isDevMode()) {
                        // eslint-disable-next-line no-console
                        console.warn('[KbqCodeBlock] Failed to load highlight.js.', error);
                    }

                    return null;
                }
            );
            this.loads.set(key, loading);
        }

        return loading;
    }

    /** Wraps highlighted markup in the line numbers table. */
    addLineNumbers(html: string, options: KbqCodeBlockLineNumbersOptions): string {
        // The plugin cannot take empty markup: it reads the last of no lines.
        return html ? this.lineNumbersPlugin().lineNumbersValue(html, options) : html;
    }

    private async importInstance({ core, languages = {} }: KbqCodeBlockHighlightJsConfig): Promise<HLJSApi> {
        const entries = Object.entries(languages);
        // The languages do not need the core to load, so they load alongside it.
        const [{ default: instance }, loaded] = await Promise.all([
            (core ?? defaultHljsLoader)(),
            Promise.all(entries.map(([, loader]) => loader()))
        ]);

        entries.forEach(([name], index) => instance.registerLanguage(name, loaded[index].default));

        // The directive falls back to plain text, and highlight.js throws on a language it has not registered, as the
        // core has none.
        if (!instance.getLanguage(PLAIN_TEXT_LANGUAGE)) instance.registerLanguage(PLAIN_TEXT_LANGUAGE, plaintext);

        return instance;
    }

    /**
     * The plugin appends a `<style>` to `<head>` and registers a document `copy` listener, and removes neither, so it
     * is installed once, for the lifetime of the application.
     */
    private lineNumbersPlugin(): LineNumbersApi {
        if (!this.lineNumbers) {
            const window = this.window;
            // The plugin attaches its API to `w.hljs` and reads nothing else from `w` but the selection and the user
            // agent. A host of its own keeps the plugin off the highlight.js module, which every server render in the
            // process shares, and off the global `window.hljs`.
            const host = {
                hljs: {},
                getSelection: () => window.getSelection(),
                get navigator() {
                    return window.navigator;
                }
            };

            highlightJSLineNumbersPlugin(this.document, host as unknown as Window);
            this.lineNumbers = host.hljs as LineNumbersApi;
        }

        return this.lineNumbers;
    }
}
