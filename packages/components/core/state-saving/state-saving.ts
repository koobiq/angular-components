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
 * What `useStateSaving` defaults to. Provide `false` to turn state saving off across an application;
 * a component opts back in with `[useStateSaving]="true"`.
 *
 * The only switch in place before the first component reads — `KbqStateSavingService.setEnabled()` runs
 * later than that.
 */
export const KBQ_STATE_SAVING_ENABLED = new InjectionToken<boolean>('KBQ_STATE_SAVING_ENABLED', {
    providedIn: 'root',
    factory: () => true
});

/**
 * Persists one component's state through `KBQ_STATE_STORE`.
 *
 * Applied with `hostDirectives`, forwarding both inputs, and injected to drive it. What to persist and
 * when to read it stays with the component: `read()` once while initializing, `write()` on every change.
 * The Core page carries the worked example and the rules.
 *
 * The key comes from `stateSavingKey`, or is derived from where the host sits in the document
 * (`KBQ_STATE_SAVING_KEY_RESOLVER`) — see the Core page for the rules that come with that.
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

    /** How the host is named in dev-mode warnings: its tag, which is what the author sees in the markup. */
    get name(): string {
        return this.host?.tagName.toLowerCase() ?? 'kbqStateSaving';
    }

    /**
     * The key the state is persisted under, empty until `read()` has run. Deliberately the key that was
     * read: resolving one now needs the host to be in the document.
     */
    get key(): string {
        return this.readKey ?? '';
    }

    /** Whether this host persists — its own `useStateSaving`, not the application-wide switch. */
    get enabled(): boolean {
        return this.useStateSaving();
    }

    private readonly store = inject(KBQ_STATE_STORE);
    private readonly resolveKey = inject(KBQ_STATE_SAVING_KEY_RESOLVER);
    private readonly service = inject(KbqStateSavingService);
    private readonly destroyRef = inject(DestroyRef);

    private _state: unknown = null;

    /** A counter, not a flag: a nested `applying()` would otherwise release the guard on the way out. */
    private applyingDepth = 0;

    /**
     * The key `read()` last read, `null` until it has. Until then a write would overwrite what is stored
     * blind; holding the key rather than a flag also stops a write landing on one never read.
     */
    private readKey: string | null = null;

    private resolvedKey: string | undefined;

    constructor() {
        this.service.register(this);
        this.destroyRef.onDestroy(() => this.service.unregister(this));

        effect(() => {
            // Tracked directly, not through `storageKey`: that resolves a derived key by walking the
            // document, and this effect first runs while the host is still detached.
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
     * `normalize` turns a raw payload into state and returns `null` when it cannot. Storage is
     * user-writable, so nothing is trusted; this is also where an older payload is migrated.
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
     * `read()` has run.
     *
     * Pass the whole state, not a change to it: a full snapshot drops values that no longer exist.
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
     * Removes the persisted state. Persistence itself stays on — the next `write()` records it again.
     *
     * Deliberately not gated on the application-wide switch, unlike `read()` and `write()`: that switch
     * means "stop remembering", and removing what was remembered carries it out.
     */
    clear(): void {
        if (!this.useStateSaving()) return;

        this._state = null;

        const key = this.readKey ?? this.storageKey;

        if (key) this.store.removeState(key);

        this.service.notify();
    }

    /**
     * Runs `apply` with `write()` suppressed, and nests safely. Restored state goes through the
     * component's own setters, which persist as they go.
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
     * Warns when another live component already persists under this key: a key is a whole entry, not a
     * namespace, so the two overwrite each other. Only an explicit `stateSavingKey` can collide.
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

        // Memoized because `write()` asks on every change and resolving walks the document. `||=` rather
        // than `??=`, so a host asked before it was in the document is not stuck with the empty key.
        this.resolvedKey ||= this.resolveKey(this.host);

        return this.resolvedKey;
    }
}
