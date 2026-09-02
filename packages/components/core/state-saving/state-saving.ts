import { inject, isDevMode, Signal } from '@angular/core';
import { KBQ_STATE_STORE, KbqStateStore } from './state-store';

/** Configuration for `kbqStateSaving()`. */
export interface KbqStateSavingConfig<T> {
    /** The component's class name, used in the dev-mode warning about a missing key. */
    name: string;
    /** Whether persistence is enabled — typically the component's `useStateSaving` input. */
    enabled: Signal<boolean>;
    /** The consumer-provided key — typically the component's `stateSavingKey` input. */
    key: Signal<string>;
    /**
     * Key used while `key` is empty. Should be the host's own unique id — unreliable by nature, since
     * it depends on instantiation order, which is what the dev-mode warning is about.
     */
    fallbackKey: () => string;
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
export class KbqStateSaving<T> {
    /** The state last read from or written to the store, or `null` when there is none. */
    get state(): T | null {
        return this._state;
    }

    private _state: T | null = null;

    /** Whether `applying()` is running, during which the component's own changes must not be persisted. */
    private isApplying = false;

    constructor(
        private readonly config: KbqStateSavingConfig<T>,
        private readonly store: KbqStateStore
    ) {}

    /** Reads and normalizes the persisted state. Returns `null` while persistence is disabled. */
    read(): T | null {
        if (!this.config.enabled()) return null;

        if (isDevMode() && !this.config.key()) {
            // eslint-disable-next-line no-console
            console.warn(
                `${this.config.name}: \`useStateSaving\` is enabled without a \`stateSavingKey\`. Falling ` +
                    'back to an auto-generated id, which is unreliable across lazy/conditional/reordered ' +
                    'rendering. Provide a stable `stateSavingKey`.'
            );
        }

        this._state = this.config.normalize(this.store.getState(this.storageKey));

        return this._state;
    }

    /**
     * Persists the state. A no-op while persistence is disabled or while `applying()` runs.
     *
     * Pass the component's whole state, not a change to it: a full snapshot drops values that no longer
     * exist on its own, where an incremental write leaves them behind to be restored forever.
     */
    write(state: T): void {
        if (!this.config.enabled() || this.isApplying) return;

        this._state = state;

        this.store.setState(this.storageKey, state);
    }

    /**
     * Removes the persisted state.
     *
     * Persistence itself stays on — the next `write()` records the state again.
     */
    clear(): void {
        this._state = null;

        this.store.removeState(this.storageKey);
    }

    /**
     * Runs `apply` with `write()` suppressed.
     *
     * Restored state is applied through the component's own setters, which persist as they go — without
     * this, restoring would immediately write the state straight back.
     */
    applying<R>(apply: () => R): R {
        this.isApplying = true;

        try {
            return apply();
        } finally {
            this.isApplying = false;
        }
    }

    /** The key the state is persisted under. */
    private get storageKey(): string {
        return this.config.key() || this.config.fallbackKey();
    }
}

/**
 * Binds a component's state to the store behind `KBQ_STATE_STORE`.
 *
 * Call it in an injection context — a field initializer, declared after the inputs it reads.
 *
 * @example
 * ```ts
 * readonly useStateSaving = input(false, { transform: booleanAttribute });
 * readonly stateSavingKey = input<string>('');
 *
 * private readonly stateSaving = kbqStateSaving<string[]>({
 *     name: 'KbqExample',
 *     enabled: this.useStateSaving,
 *     key: this.stateSavingKey,
 *     fallbackKey: () => this.id,
 *     normalize: (parsed) => (Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : null)
 * });
 * ```
 */
export const kbqStateSaving = <T>(config: KbqStateSavingConfig<T>): KbqStateSaving<T> =>
    new KbqStateSaving(config, inject(KBQ_STATE_STORE));
