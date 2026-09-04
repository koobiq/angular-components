import { inject, Injectable } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { KBQ_STATE_STORE } from './state-store';

/**
 * A live component that persists state, as `KbqStateSavingService` reports it.
 *
 * Every `kbqStateSaving()` controller satisfies this and registers itself, so the service sees a
 * component even when it was given its own `KBQ_STATE_STORE` — one the root store knows nothing about.
 */
export interface KbqStateSavingRef {
    /** The component's class name, as passed to `kbqStateSaving()`. */
    readonly name: string;
    /**
     * The key the state is persisted under. Empty until the component has read, and for a host no key
     * could be derived from.
     */
    readonly key: string;
    /** Whether this component persists — its own `useStateSaving`, not the service-wide switch. */
    readonly enabled: boolean;
    /** The state it last read or wrote, or `null`. Raw, in the shape the component persists. */
    readonly state: unknown;
    /** The host element, for locating the component on the page. */
    readonly host: Element | null;
    /** Removes this component's persisted state, through its own store. */
    clear(): void;
}

/**
 * Reports and manages what components have persisted through `kbqStateSaving()`.
 *
 * Two sources, because neither covers the other. The registry of live components says who persists,
 * under which key, and what they currently hold — including a component given its own
 * `KBQ_STATE_STORE`, which the root store cannot see. The root store says what is actually stored,
 * including entries no live component claims: a component whose surrounding markup changed writes under
 * a new key and strands the old entry, and only the store knows it is still there.
 *
 * Everything is reported as a snapshot rather than a signal. Components register while their host is
 * being created, which happens during change detection, and a signal written then is read back by a
 * view that has already been checked (`NG0100`). Subscribe to `changes` to know when to take a new
 * snapshot.
 *
 * @example
 * ```ts
 * const stateSaving = inject(KbqStateSavingService);
 *
 * stateSaving.clearOrphans();
 * stateSaving.setEnabled(false);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class KbqStateSavingService {
    private readonly store = inject(KBQ_STATE_STORE);
    private readonly changed = new Subject<void>();

    /** Live components, in registration order. A `Set`, so a double registration cannot duplicate one. */
    private readonly registry = new Set<KbqStateSavingRef>();

    /**
     * Emits whenever this picture changes: a component registered, persisted, cleared or was destroyed,
     * this service wrote or removed something, or the store reported a change made outside this tab.
     *
     * It says *that* something changed, never what — take a fresh snapshot in response. Expect it to be
     * chatty: the initial render of a page full of persisting components emits once per component, and
     * a component that persists on every interaction emits on every interaction.
     */
    readonly changes: Observable<void> = this.store.changes ? merge(this.changed, this.store.changes) : this.changed;

    private enabled = true;

    /** How deep the current `batch()` nesting is — a counter for the same reason `applying()` uses one. */
    private batchDepth = 0;

    /** Whether components are allowed to persist. */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Turns persistence off, or back on, for every component at once — the switch behind a "do not
     * remember my interface" setting. A component's own `useStateSaving` still has to be set for it to
     * persist; this only takes that away.
     *
     * Turning it off stops reading and writing. It does not remove what is already stored, and does not
     * collapse what was already restored — call `clear()` for the first, reload for the second.
     */
    setEnabled(enabled: boolean): void {
        if (this.enabled === enabled) return;

        this.enabled = enabled;
        this.changed.next();
    }

    /** Every live component that persists state, in registration order. */
    components(): readonly KbqStateSavingRef[] {
        return [...this.registry];
    }

    /**
     * Every key the root store holds. Empty when the store cannot enumerate — see `KbqStateStore.keys`,
     * which a backend-backed store is expected to leave out.
     */
    keys(): string[] {
        return this.store.keys?.() ?? [];
    }

    /**
     * The keys the root store holds that no live component claims — what a markup change leaves behind.
     *
     * A component that has not read yet claims nothing, so a page still initializing can report a key as
     * orphaned for as long as that takes.
     */
    orphans(): string[] {
        const claimed = new Set(this.components().map(({ key }) => key));

        return this.keys().filter((key) => !claimed.has(key));
    }

    /**
     * The raw payload stored under the key, or `null`.
     *
     * Raw: normalizing a payload into state belongs to the component that wrote it (see
     * `KbqStateSavingConfig.normalize`), and the service does not know which component that is.
     */
    read(key: string): unknown {
        return this.store.getState(key);
    }

    /**
     * Overwrites the payload stored under the key. It has to be JSON-serializable, and in the shape the
     * owning component's `normalize` accepts — anything else is rejected on read and the component falls
     * back to its default.
     *
     * A component restores once, while initializing, so this reaches a component that is already on
     * screen only after a reload.
     */
    write(key: string, state: unknown): void {
        this.batch(() => this.store.setState(key, state));
    }

    /** Removes the entry stored under the key, in the root store and in any live component's own. */
    remove(key: string): void {
        this.batch(() => {
            this.store.removeState(key);

            // A component can be given its own `KBQ_STATE_STORE` through its `providers`, and the root
            // store knows nothing about that one. Going through the component itself reaches it.
            this.components()
                .filter((ref) => ref.key === key)
                .forEach((ref) => ref.clear());
        });
    }

    /** Removes every entry, claimed and orphaned alike. */
    clear(): void {
        this.batch(() => {
            this.keys().forEach((key) => this.store.removeState(key));
            this.components().forEach((ref) => ref.clear());
        });
    }

    /** Removes only the entries no live component claims, leaving what is in use alone. */
    clearOrphans(): void {
        this.batch(() => this.orphans().forEach((key) => this.store.removeState(key)));
    }

    /**
     * Called by `kbqStateSaving()` when a component persisted or removed its own state, which does not
     * pass through this service and would otherwise go unreported. @docs-private
     */
    notify(): void {
        if (this.batchDepth > 0) return;

        this.changed.next();
    }

    /**
     * Runs a compound operation and reports it once. Without this, `clear()` would emit once per
     * component it clears on top of its own emission, since a cleared component reports for itself.
     */
    private batch(operation: () => void): void {
        this.batchDepth++;

        try {
            operation();
        } finally {
            this.batchDepth--;
        }

        this.changed.next();
    }

    /** Called by `kbqStateSaving()`. @docs-private */
    register(ref: KbqStateSavingRef): void {
        this.registry.add(ref);
        this.changed.next();
    }

    /** Called when the component that owns the controller is destroyed. @docs-private */
    unregister(ref: KbqStateSavingRef): void {
        if (!this.registry.delete(ref)) return;

        this.changed.next();
    }
}
