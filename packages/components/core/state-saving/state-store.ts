import { Platform } from '@angular/cdk/platform';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
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
    /**
     * Optional. Every key this store currently holds.
     *
     * `KbqStateSavingService` needs it to report the entries no live component claims. Leave it out when
     * the storage cannot be enumerated — a backend, most commonly — and the service reports the live
     * components alone.
     */
    keys?(): string[];
    /**
     * Optional. Emits whenever entries change outside this instance — the same app open in another tab,
     * most commonly. `KbqStateSavingService` re-emits it, so a panel listing the entries can refresh.
     * Leave it out when the storage has no way to report that.
     */
    changes?: Observable<void>;
}

/**
 * How long a web-storage entry survives without being written or read, in milliseconds.
 * Defaults to 90 days.
 *
 * Components persist under keys derived from the host's position in the document when no
 * `stateSavingKey` is given, so a restructuring silently strands the entry written under the previous
 * key. The TTL is what eventually collects those.
 */
export const KBQ_STATE_SAVING_TTL = new InjectionToken<number>('KBQ_STATE_SAVING_TTL', {
    providedIn: 'root',
    factory: () => 90 * 24 * 60 * 60 * 1000
});

/** Prefix every entry a web-storage state store owns is written under. */
const stateKeyPrefix = 'kbq.state.';

/** What a web-storage state store actually writes: the consumer's payload plus its own bookkeeping. */
interface KbqStateEnvelope {
    /** Epoch milliseconds of the last write or refresh. Drives expiry. */
    savedAt: number;
    /** The consumer's opaque payload. */
    state: unknown;
}

const parseEnvelope = (raw: string | null): KbqStateEnvelope | null => {
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);

        return parsed !== null && typeof parsed === 'object' && typeof parsed.savedAt === 'number' && 'state' in parsed
            ? (parsed as KbqStateEnvelope)
            : null;
    } catch {
        return null;
    }
};

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
    private readonly ttl = inject(KBQ_STATE_SAVING_TTL);

    /**
     * `storage` fires only in the *other* documents of the same origin, never in the one that wrote the
     * value, so this reports exactly the external changes `KbqStateStore.changes` is meant to report,
     * with no echo of this instance's own writes.
     */
    readonly changes: Observable<void> = this.watchStorage();

    constructor() {
        this.removeExpired();
    }

    /** The storage this store reads from and writes to. */
    protected abstract getStorage(window: Window): Storage;

    keys(): string[] {
        if (!this.window) return [];

        try {
            const storage = this.getStorage(this.window);
            const keys: string[] = [];

            for (let index = 0; index < storage.length; index++) {
                const storageKey = storage.key(index);

                if (!storageKey?.startsWith(stateKeyPrefix)) continue;

                // An expired entry is on its way out — listing it would report an orphan that disappears
                // on its own before anyone can act on it.
                if (this.isExpired(parseEnvelope(storage.getItem(storageKey)))) continue;

                keys.push(storageKey.slice(stateKeyPrefix.length));
            }

            return keys;
        } catch {
            return [];
        }
    }

    getState(key: string): unknown {
        if (!this.window) return null;

        try {
            const storage = this.getStorage(this.window);
            const envelope = parseEnvelope(storage.getItem(stateKeyPrefix + key));

            if (!envelope) return this.readLegacyState(storage, key);

            if (this.isExpired(envelope)) {
                storage.removeItem(stateKeyPrefix + key);

                return null;
            }

            // Refresh the entry, so state that is read on every visit but never changed does not expire
            // under an active user. `setState` decides whether the write is actually due.
            this.setState(key, envelope.state);

            return envelope.state;
        } catch {
            return null;
        }
    }

    setState(key: string, state: unknown): void {
        if (!this.window) return;

        try {
            const storage = this.getStorage(this.window);
            const serialized = JSON.stringify(state);
            const current = parseEnvelope(storage.getItem(stateKeyPrefix + key));
            const now = Date.now();

            // Skip the write when the payload is unchanged and the entry is not yet halfway to expiring.
            // A component persists a whole snapshot on every change, and a single interaction routinely
            // produces the same snapshot twice (one item closing while another opens); `setItem` is
            // synchronous. Comparing whole entries would never match — `savedAt` differs every time.
            if (current && JSON.stringify(current.state) === serialized && now - current.savedAt <= this.ttl / 2) {
                return;
            }

            storage.setItem(stateKeyPrefix + key, JSON.stringify({ savedAt: now, state } satisfies KbqStateEnvelope));
        } catch {
            // Ignore storage write failures (quota exceeded, disabled/blocked storage, etc.).
        }
    }

    removeState(key: string): void {
        if (!this.window) return;

        try {
            const storage = this.getStorage(this.window);

            storage.removeItem(stateKeyPrefix + key);

            // An entry left over from before the prefix existed would be read again on the next load and
            // undo the removal, so shadow it with an empty one. Deleting it outright is not an option:
            // an unprefixed key is not necessarily ours (see `readLegacyState`).
            if (storage.getItem(key) !== null) this.setState(key, null);
        } catch {
            // Ignore storage failures (disabled/blocked storage, etc.).
        }
    }

    /**
     * Reads an entry written before entries were prefixed (`@koobiq/components` 20.2.0), so an upgrade
     * does not reset what users had.
     *
     * Read-through only: the entry is neither rewritten nor removed, because an unprefixed key is not
     * necessarily ours — an application storing its own `settings` would lose it to a component keyed
     * `stateSavingKey="settings"`. The first write moves the state under the prefix and takes over from
     * there. A one-release bridge; remove it in the next major.
     */
    private readLegacyState(storage: Storage, key: string): unknown {
        const raw = storage.getItem(key);

        return raw ? JSON.parse(raw) : null;
    }

    /**
     * Drops the entries that outlived the TTL, along with anything under the prefix that no longer
     * parses. Runs once per application — the store is `providedIn: 'root'`.
     *
     * Keys derived from the document make this necessary: a component whose surrounding markup changes
     * starts writing under a new key, and nothing else would ever collect the old entry.
     */
    private removeExpired(): void {
        if (!this.window) return;

        try {
            const storage = this.getStorage(this.window);

            // Backwards: removing an entry shifts the index of every entry after it.
            for (let index = storage.length - 1; index >= 0; index--) {
                const storageKey = storage.key(index);

                if (!storageKey?.startsWith(stateKeyPrefix)) continue;

                if (this.isExpired(parseEnvelope(storage.getItem(storageKey)))) storage.removeItem(storageKey);
            }
        } catch {
            // Ignore storage failures (disabled/blocked storage, etc.).
        }
    }

    /** Whether an entry is unusable: absent, no longer parseable, or past the TTL. */
    private isExpired(envelope: KbqStateEnvelope | null): boolean {
        return !envelope || Date.now() - envelope.savedAt > this.ttl;
    }

    /** Backs `changes`. `EMPTY` on the server, which has no other tabs to hear from. */
    private watchStorage(): Observable<void> {
        const window = this.window;

        if (!window) return EMPTY;

        return new Observable<void>((subscriber) => {
            const listener = ({ key, storageArea }: StorageEvent) => {
                // The event fires for every storage area, so a `localStorage` store must not react to a
                // `sessionStorage` write. `storageArea` is nullable in the spec — fall through when it
                // is absent rather than guessing.
                if (storageArea && storageArea !== this.getStorage(window)) return;

                // `key === null` is `Storage.clear()` — every key at once, this store's entries included.
                if (key === null || key.startsWith(stateKeyPrefix)) subscriber.next();
            };

            window.addEventListener('storage', listener);

            return () => window.removeEventListener('storage', listener);
        });
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
 * session instead of until it expires.
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
