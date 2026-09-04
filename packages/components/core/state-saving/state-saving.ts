import { DestroyRef, ElementRef, inject, isDevMode, Signal } from '@angular/core';
import { KBQ_STATE_SAVING_KEY_RESOLVER } from './state-saving-key';
import { KbqStateSavingRef, KbqStateSavingService } from './state-saving-service';
import { KBQ_STATE_STORE } from './state-store';

/** Configuration for `kbqStateSaving()`. */
export interface KbqStateSavingConfig<T> {
    /** The component's class name, used in the dev-mode warning about an unresolvable key. */
    name: string;
    /** Whether persistence is enabled — typically the component's `useStateSaving` input. */
    enabled: Signal<boolean>;
    /**
     * The consumer-provided key — typically the component's `stateSavingKey` input. While it is empty,
     * the key is derived from the host element by `KBQ_STATE_SAVING_KEY_RESOLVER`.
     */
    key: Signal<string>;
    /**
     * Coerces a raw persisted payload into the component's state, returning `null` when it is unusable.
     * Storage is origin-wide and user-writable, so a payload is never trusted; this is also where one
     * written by an earlier version is migrated.
     */
    normalize: (parsed: unknown) => T | null;
}

/**
 * Persists one component's state through `KBQ_STATE_STORE`. Created by `kbqStateSaving()`.
 *
 * It owns the storage plumbing only — which key to use, when writing is allowed, and turning a raw
 * payload into state. What to restore, and when, stays with the component.
 */
export class KbqStateSaving<T> implements KbqStateSavingRef {
    /** The host element the key is derived from, and by which `KbqStateSavingService` locates it. */
    readonly host: Element | null = inject(ElementRef, { optional: true })?.nativeElement ?? null;

    /** The state last read from or written to the store, or `null` when there is none. */
    get state(): T | null {
        return this.config.enabled() ? this._state : null;
    }

    /** The component's class name, as passed to `kbqStateSaving()`. */
    get name(): string {
        return this.config.name;
    }

    /**
     * The key the state is persisted under, empty until `read()` has run.
     *
     * Deliberately the key that was read, not the one that would be resolved now: resolving needs the
     * host to be in the document, and asking before it is there would report a key nothing uses.
     */
    get key(): string {
        return this.readKey ?? '';
    }

    /**
     * Whether this component persists — its own `useStateSaving`, not `KbqStateSavingService`'s
     * application-wide switch, which is uniform and readable from the service itself.
     */
    get enabled(): boolean {
        return this.config.enabled();
    }

    private readonly store = inject(KBQ_STATE_STORE);
    private readonly resolveKey = inject(KBQ_STATE_SAVING_KEY_RESOLVER);
    private readonly service = inject(KbqStateSavingService);
    private readonly destroyRef = inject(DestroyRef);

    private _state: T | null = null;

    /**
     * How deep the current `applying()` nesting is. A counter, not a flag: a nested call's `finally` would
     * otherwise release the guard for the rest of the outer block.
     */
    private applyingDepth = 0;

    /**
     * The key `read()` last read, or `null` when it has not read one. Until it has, the component has not
     * seen what is stored and a write would overwrite it blind — which is what an input binding that
     * changes the state before the host's initialization hook would otherwise do. Holding the key rather
     * than a flag also stops a write from landing on a key whose contents were never read.
     */
    private readKey: string | null = null;

    private resolvedKey: string | undefined;

    constructor(private readonly config: KbqStateSavingConfig<T>) {
        // Last, so `config` is assigned: a `changes` subscriber can read the registered ref synchronously.
        this.service.register(this);
        this.destroyRef.onDestroy(() => this.service.unregister(this));
    }

    /**
     * Reads and normalizes the persisted state. Returns `null` while persistence is disabled, and while
     * no key can be resolved for the host.
     */
    read(): T | null {
        this._state = null;

        if (!this.persists) return null;

        const key = this.storageKey;

        if (!key) {
            if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn(
                    `${this.config.name}: state saving is enabled, but no key could be derived from the ` +
                        'host element — it is not in the document when the state is read. Nothing is ' +
                        'persisted. Provide a `stateSavingKey` to persist anyway.'
                );
            }

            return null;
        }

        this.readKey = key;
        this._state = this.config.normalize(this.store.getState(key));

        return this._state;
    }

    /**
     * Persists the state. A no-op while persistence is disabled, while `applying()` runs, and before
     * `read()` has run — a component must not overwrite state it has not looked at yet.
     *
     * Pass the component's whole state, not a change to it: a full snapshot drops values that no longer
     * exist on its own, where an incremental write leaves them behind to be restored forever.
     */
    write(state: T): void {
        if (!this.persists || this.applyingDepth > 0) return;

        const key = this.storageKey;

        if (key !== this.readKey) {
            if (isDevMode() && this.readKey !== null) {
                // eslint-disable-next-line no-console
                console.warn(
                    `${this.config.name}: the state saving key changed from \`${this.readKey}\` to \`${key}\` ` +
                        'after the state was read. Nothing is persisted under the new key until it is read, ' +
                        "so the state stored there is not overwritten with another key's."
                );
            }

            return;
        }

        this._state = state;

        this.store.setState(key, state);
        this.service.notify();
    }

    /**
     * Removes the persisted state. A no-op while the component's own persistence is disabled, so a
     * component that persists nothing cannot delete an entry another one owns.
     *
     * Deliberately not gated on `KbqStateSavingService`'s application-wide switch, unlike `read()` and
     * `write()`: that switch means "stop remembering", and removing what was already remembered carries
     * it out rather than being something it should block.
     *
     * Persistence itself stays on — the next `write()` records the state again.
     */
    clear(): void {
        if (!this.config.enabled()) return;

        this._state = null;

        const key = this.readKey ?? this.storageKey;

        if (key) this.store.removeState(key);

        this.service.notify();
    }

    /**
     * Runs `apply` with `write()` suppressed, and nests safely.
     *
     * Restored state is applied through the component's own setters, which persist as they go — without
     * this, restoring would immediately write the state straight back.
     */
    applying<R>(apply: () => R): R {
        this.applyingDepth++;

        try {
            return apply();
        } finally {
            this.applyingDepth--;
        }
    }

    /** Whether this controller reads and writes at all. */
    private get persists(): boolean {
        return this.service.isEnabled() && this.config.enabled();
    }

    /** The key the state is persisted under, empty when the host cannot be identified. */
    private get storageKey(): string {
        const key = this.config.key();

        if (key) return key;

        // Memoized: `write()` asks for the key on every change, and resolving walks the document. A host
        // that moved would also resolve a different key and trip the key-change guard above. `||=` rather
        // than `??=`, so a host asked before it was in the document is not stuck with the empty key it
        // resolved to then — resolving a detached host returns immediately, so retrying costs nothing.
        this.resolvedKey ||= this.resolveKey(this.host);

        return this.resolvedKey;
    }
}

/**
 * Binds a component's state to the store behind `KBQ_STATE_STORE`.
 *
 * Call it in an injection context — a field initializer, declared after the inputs it reads. Call `read()`
 * once while initializing: writes before that are suppressed, so the component cannot overwrite state it
 * has not seen.
 *
 * While `key` is empty the storage key is derived from where the host sits in the document
 * (`KBQ_STATE_SAVING_KEY_RESOLVER`), so a component persists without being configured. That key moves
 * when the surrounding markup is restructured; a `stateSavingKey`, or an `id` on the component or any
 * ancestor, pins it.
 *
 * @example
 * ```ts
 * readonly useStateSaving = input(true, { transform: booleanAttribute });
 * readonly stateSavingKey = input<string>('');
 *
 * private readonly stateSaving = kbqStateSaving<string[]>({
 *     name: 'KbqExample',
 *     enabled: this.useStateSaving,
 *     key: this.stateSavingKey,
 *     normalize: (parsed) => (Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : null)
 * });
 * ```
 */
export const kbqStateSaving = <T>(config: KbqStateSavingConfig<T>): KbqStateSaving<T> => new KbqStateSaving(config);
