import {
    booleanAttribute,
    DestroyRef,
    Directive,
    effect,
    inject,
    InjectionToken,
    input,
    isDevMode,
    output
} from '@angular/core';
import { kbqInjectNativeElement } from '../utils';
import { KBQ_STATE_SAVING_KEY_RESOLVER } from './state-saving-key';
import { KbqStateSavingRef, KbqStateSavingService } from './state-saving-service';
import { KBQ_STATE_STORE } from './state-store';

/**
 * What `useStateSaving` defaults to, for every component that persists.
 *
 * The only switch that is in place before the first component reads: `KbqStateSavingService.setEnabled()`
 * runs later than that, so a setting arriving at runtime reaches the next render rather than this one.
 * Provide `false` to turn state saving off across an application — a test app, or a page rendering
 * examples — and a component still opts back in with an explicit `[useStateSaving]="true"`, because a
 * binding wins over a default.
 */
export const KBQ_STATE_SAVING_ENABLED = new InjectionToken<boolean>('KBQ_STATE_SAVING_ENABLED', {
    providedIn: 'root',
    factory: () => true
});

/**
 * Persists one component's state through `KBQ_STATE_STORE`.
 *
 * Apply it with `hostDirectives`, forwarding both inputs, and inject it to drive it:
 *
 * ```ts
 * @Component({
 *     selector: 'my-panel',
 *     hostDirectives: [{ directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }]
 * })
 * export class MyPanel {
 *     private readonly stateSaving = inject(KbqStateSaving);
 *
 *     ngAfterContentInit(): void {
 *         const saved = this.stateSaving.read(normalizeMyState);
 *
 *         this.stateSaving.applying(() => this.apply(saved ?? this.defaultState()));
 *     }
 * }
 * ```
 *
 * It owns the storage plumbing only — which key to use, when writing is allowed, and turning a raw
 * payload into state. What to persist, and when to read it, stays with the component: `read()` once
 * while initializing, `write()` whenever the state changes.
 *
 * The storage key comes from `stateSavingKey`. While that is empty it is derived from where the host
 * sits in the document (`KBQ_STATE_SAVING_KEY_RESOLVER`), so a component persists without being
 * configured. That key moves when the surrounding markup is restructured; a `stateSavingKey`, or an
 * `id` on the component or any ancestor, pins it.
 */
@Directive({
    selector: '[kbqStateSaving]',
    exportAs: 'kbqStateSaving'
})
export class KbqStateSaving implements KbqStateSavingRef {
    /**
     * The host element the key is derived from, and by which `KbqStateSavingService` locates it.
     *
     * Typed nullable for `KbqStateSavingRef`, whose other implementation has no element of its own —
     * `KbqSidepanelService` persists on behalf of a panel that lives in an overlay.
     */
    readonly host: Element | null = kbqInjectNativeElement<Element>();

    // These two are what a host forwards, so their documentation is read on the host's own page — it
    // describes the component a consumer is configuring, not the directive behind it.

    /**
     * Whether the component remembers its state across reloads and restores it on the next render.
     * Defaults to `true`, or to whatever `KBQ_STATE_SAVING_ENABLED` is provided as.
     */
    readonly useStateSaving = input(inject(KBQ_STATE_SAVING_ENABLED), { transform: booleanAttribute });

    /**
     * The key the state is persisted under. While it is empty the key is derived from where the
     * component sits in the document, which moves when the surrounding markup is restructured — an `id`
     * on the component or any ancestor pins it just as well as this input does.
     */
    readonly stateSavingKey = input<string>('');

    /**
     * Emits when the key changes after the state was read, so the owner can restore from the new one.
     *
     * The key is read once, while the owner restores, and `write()` refuses a key it has not read —
     * without this, moving a component to another key would stop its writes for good instead of moving
     * its state. Not forwarded from a host: the component that injects the directive is the one that
     * knows how to restore itself.
     */
    readonly keyChanges = output<void>();

    /** The state last read from or written to the store, or `null` when there is none. */
    get state(): unknown {
        return this.useStateSaving() ? this._state : null;
    }

    /**
     * How the host is named in dev-mode warnings — its tag, which is what the author sees in the markup,
     * rather than a class name this directive has no way to know.
     */
    get name(): string {
        return this.host?.tagName.toLowerCase() ?? 'kbqStateSaving';
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
     * Whether this host persists — its own `useStateSaving`, not `KbqStateSavingService`'s
     * application-wide switch, which is uniform and readable from the service itself.
     */
    get enabled(): boolean {
        return this.useStateSaving();
    }

    private readonly store = inject(KBQ_STATE_STORE);
    private readonly resolveKey = inject(KBQ_STATE_SAVING_KEY_RESOLVER);
    private readonly service = inject(KbqStateSavingService);
    private readonly destroyRef = inject(DestroyRef);

    private _state: unknown = null;

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

    constructor() {
        this.service.register(this);
        this.destroyRef.onDestroy(() => this.service.unregister(this));

        effect(() => {
            // Tracks the input. Read before the guard below, because an effect only re-runs for what it
            // read — and deliberately not through `storageKey`, which resolves a derived key by walking
            // the document: this effect first runs while the host is still detached, where that walk
            // reaches for `getRootNode()` and the server DOM has none.
            this.stateSavingKey();

            // Nothing has been read, so nothing can have moved.
            if (this.readKey === null) return;

            if (this.storageKey !== this.readKey) this.keyChanges.emit();
        });
    }

    /**
     * Reads the persisted state, coerced by `normalize`. Returns `null` while persistence is disabled,
     * and while no key can be resolved for the host.
     *
     * `normalize` turns a raw payload into the component's state and returns `null` when it cannot.
     * Storage is origin-wide and user-writable, so a payload is never trusted; this is also where one
     * written by an earlier version is migrated.
     */
    read<T>(normalize: (parsed: unknown) => T | null): T | null {
        this._state = null;

        if (!this.persists) return null;

        const key = this.storageKey;

        if (!key) {
            if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn(
                    `${this.name}: state saving is enabled, but no key could be derived from the host ` +
                        'element — it is not in the document when the state is read. Nothing is persisted. ' +
                        'Provide a `stateSavingKey` to persist anyway.'
                );
            }

            return null;
        }

        if (isDevMode()) this.warnAboutCollision(key);

        this.readKey = key;

        const raw = this.store.getState(key);

        if (isDevMode() && typeof (raw as { then?: unknown } | null)?.then === 'function') {
            // eslint-disable-next-line no-console
            console.warn(
                `${this.name}: the state store returned a promise. \`KbqStateStore\` is read synchronously, ` +
                    'so an asynchronous store never restores anything — the payload reaches `normalize` ' +
                    'unresolved and is rejected. Load the state before the application renders (for ' +
                    'example in `provideAppInitializer`) and serve it from memory.'
            );
        }

        const state = normalize(raw);

        this._state = state;

        return state;
    }

    /**
     * Persists the state. A no-op while persistence is disabled, while `applying()` runs, and before
     * `read()` has run — a component must not overwrite state it has not looked at yet.
     *
     * Pass the component's whole state, not a change to it: a full snapshot drops values that no longer
     * exist on its own, where an incremental write leaves them behind to be restored forever.
     */
    write(state: unknown): void {
        if (!this.persists || this.applyingDepth > 0) return;

        const key = this.storageKey;

        if (key !== this.readKey) {
            if (isDevMode() && this.readKey !== null) {
                // eslint-disable-next-line no-console
                console.warn(
                    `${this.name}: the state saving key changed from \`${this.readKey}\` to \`${key}\` ` +
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
     * Removes the persisted state. A no-op while the host's own persistence is disabled, so a component
     * that persists nothing cannot delete an entry another one owns.
     *
     * Deliberately not gated on `KbqStateSavingService`'s application-wide switch, unlike `read()` and
     * `write()`: that switch means "stop remembering", and removing what was already remembered carries
     * it out rather than being something it should block.
     *
     * Persistence itself stays on — the next `write()` records the state again.
     */
    clear(): void {
        if (!this.useStateSaving()) return;

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

    /** Whether this directive reads and writes at all. */
    private get persists(): boolean {
        return this.service.isEnabled() && this.useStateSaving();
    }

    /**
     * Warns when another live component already persists under this key.
     *
     * A key is a whole entry, not a namespace: two components sharing one overwrite each other, and the
     * one that reads first restores what the other wrote. Only an explicit `stateSavingKey` can collide
     * — a derived key describes a position in the document, and two components cannot share one.
     */
    private warnAboutCollision(key: string): void {
        const claimedBy = this.service.components().find((ref) => ref !== this && ref.key === key);

        if (!claimedBy) return;

        // eslint-disable-next-line no-console
        console.warn(
            `${this.name}: \`${claimedBy.name}\` already persists under the state saving key \`${key}\`. ` +
                'They share one entry and overwrite each other. Give each component its own key.'
        );
    }

    /** The key the state is persisted under, empty when the host cannot be identified. */
    private get storageKey(): string {
        const key = this.stateSavingKey();

        if (key) return key;

        // Memoized: `write()` asks for the key on every change, and resolving walks the document. A host
        // that moved would also resolve a different key and trip the key-change guard above. `||=` rather
        // than `??=`, so a host asked before it was in the document is not stuck with the empty key it
        // resolved to then — resolving a detached host returns immediately, so retrying costs nothing.
        this.resolvedKey ||= this.resolveKey(this.host);

        return this.resolvedKey;
    }
}
