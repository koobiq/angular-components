import { Platform } from '@angular/cdk/platform';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { KBQ_WINDOW } from '../tokens';

/**
 * Strategy used to persist component state across reloads.
 *
 * Payloads are opaque: a store moves them, it never interprets them. A read is typed `unknown` on
 * purpose — web storage is origin-wide and user-writable, so the consumer has to normalize whatever
 * comes back (see `KbqStateSavingConfig.normalize`).
 *
 * Provide a custom implementation through the `KBQ_STATE_STORE` token to change where the state is
 * stored (a backend, or an in-memory map). To keep it for the tab session only, provide the bundled
 * `KbqSessionStorageStateStore` instead of writing one.
 */
export interface KbqStateStore {
    /** Returns the raw persisted payload for the key, or `null` when nothing is stored/available. */
    getState(key: string): unknown;
    /** Persists the payload under the key. It has to be JSON-serializable. */
    setState(key: string, state: unknown): void;
    /** Removes the payload persisted under the key. */
    removeState(key: string): void;
}

/**
 * Base `KbqStateStore` backed by one of the `Window` storages, which the subclass picks.
 *
 * All access is guarded so it is safe on the server (SSR) and in environments where storage throws on
 * access (private mode, sandboxed iframes) or holds a payload that is not even valid JSON.
 */
@Injectable()
export abstract class KbqWebStorageStateStore implements KbqStateStore {
    // `KBQ_WINDOW`'s factory throws wherever there is no `window` at all, so it is only injected in the
    // browser: a component injects its store eagerly, before it knows whether it will persist anything.
    private readonly window = inject(Platform).isBrowser ? inject(KBQ_WINDOW) : null;

    /** The storage this store reads from and writes to. */
    protected abstract getStorage(window: Window): Storage;

    getState(key: string): unknown {
        if (!this.window) return null;

        try {
            const raw = this.getStorage(this.window).getItem(key);

            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    setState(key: string, state: unknown): void {
        if (!this.window) return;

        try {
            this.getStorage(this.window).setItem(key, JSON.stringify(state));
        } catch {
            // Ignore storage write failures (quota exceeded, disabled/blocked storage, etc.).
        }
    }

    removeState(key: string): void {
        if (!this.window) return;

        try {
            this.getStorage(this.window).removeItem(key);
        } catch {
            // Ignore storage failures (disabled/blocked storage, etc.).
        }
    }
}

/** Default `KbqStateStore` implementation, persisting into `localStorage`. */
@Injectable({ providedIn: 'root' })
export class KbqLocalStorageStateStore extends KbqWebStorageStateStore {
    protected getStorage(window: Window): Storage {
        return window.localStorage;
    }
}

/**
 * `KbqStateStore` implementation persisting into `sessionStorage`, so the state lives for the tab
 * session instead of indefinitely.
 *
 * @example
 * ```ts
 * providers: [{ provide: KBQ_STATE_STORE, useExisting: KbqSessionStorageStateStore }]
 * ```
 */
@Injectable({ providedIn: 'root' })
export class KbqSessionStorageStateStore extends KbqWebStorageStateStore {
    protected getStorage(window: Window): Storage {
        return window.sessionStorage;
    }
}

/**
 * Injection token for the store components persist their state into (see `KbqStateStore`).
 * Defaults to a `localStorage`-backed implementation (`KbqLocalStorageStateStore`).
 *
 * Providing it in a component's own `providers` scopes the replacement to that subtree.
 */
export const KBQ_STATE_STORE = new InjectionToken<KbqStateStore>('KBQ_STATE_STORE', {
    providedIn: 'root',
    factory: () => inject(KbqLocalStorageStateStore)
});
