import { Injectable, isDevMode } from '@angular/core';
import type { HLJSApi } from 'highlight.js';
import plaintext from 'highlight.js/lib/languages/plaintext';
import type { KbqCodeBlockHighlightJsConfig } from './code-block-highlight';

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
 * Loads highlight.js once per configuration.
 *
 * The configuration is passed in rather than injected: `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG` may be provided by a
 * component or a route, where a root service would not see it. Loads are shared by the identity of the configuration,
 * so the code blocks under one provider share one load.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class KbqCodeBlockHighlightJsLoader {
    // Weak, so that a configuration made for one component instance goes away with it.
    private readonly loads = new WeakMap<KbqCodeBlockHighlightJsConfig, Promise<HLJSApi | null>>();
    private readonly instances = new WeakMap<KbqCodeBlockHighlightJsConfig, HLJSApi>();

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
}
