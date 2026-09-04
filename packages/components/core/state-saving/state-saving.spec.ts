import { Platform } from '@angular/cdk/platform';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '../tokens';
import { kbqStateSaving, KbqStateSaving } from './state-saving';
import { KBQ_STATE_SAVING_KEY_RESOLVER } from './state-saving-key';
import {
    KBQ_STATE_SAVING_TTL,
    KBQ_STATE_STORE,
    KbqLocalStorageStateStore,
    KbqSessionStorageStateStore,
    KbqStateStore
} from './state-store';

/** In-memory `KbqStateStore` used to make state-saving tests deterministic. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    getState(key: string): unknown {
        return this.store.has(key) ? JSON.parse(JSON.stringify(this.store.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.store.delete(key);
    }
}

describe('KbqWebStorageStateStore', () => {
    const key = 'kbq-state-store-test';
    const prefixed = `kbq.state.${key}`;
    /** A TTL short enough to reason about, provided by the tests that exercise expiry. */
    const ttl = 1000;

    /** Writes an entry the way the store does, with an explicit age. */
    const seed = (state: unknown, savedAt = Date.now()): void =>
        window.localStorage.setItem(prefixed, JSON.stringify({ savedAt, state }));

    beforeEach(() => TestBed.configureTestingModule({}));

    afterEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    it('round-trips a payload through localStorage', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);

        store.setState(key, ['a', 'b']);

        expect(store.getState(key)).toEqual(['a', 'b']);
    });

    it('returns null when nothing is stored', () => {
        expect(TestBed.inject(KbqLocalStorageStateStore).getState(key)).toBeNull();
    });

    it('removes the persisted payload', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);

        store.setState(key, ['a']);
        store.removeState(key);

        expect(store.getState(key)).toBeNull();
    });

    it('returns null for corrupt JSON without throwing', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);

        window.localStorage.setItem(prefixed, '{ not valid json');

        expect(() => store.getState(key)).not.toThrow();
        expect(store.getState(key)).toBeNull();
    });

    // The store does not judge the shape — that is the consumer's normalizer's job. It only has to hand
    // back whatever parsed, so a consumer sees the real payload rather than a silently swallowed one.
    it('returns a payload of any shape as parsed', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);

        seed({ a: null, b: 1 });

        expect(store.getState(key)).toEqual({ a: null, b: 1 });
    });

    it('is a no-op when the storage is unavailable', () => {
        // Mirrors the server-provided `KBQ_WINDOW` in apps/docs/src/config.server.ts, which has no
        // `localStorage` at all — reaching it throws, which the store must swallow.
        TestBed.overrideProvider(KBQ_WINDOW, { useValue: { ...window, localStorage: undefined } });

        const store = TestBed.inject(KbqLocalStorageStateStore);

        store.setState(key, ['a']);

        expect(store.getState(key)).toBeNull();
        expect(window.localStorage.getItem(prefixed)).toBeNull();
    });

    // `KBQ_WINDOW`'s factory throws where there is no `window`, and a component injects its store whether
    // or not it persists anything — so the store must not reach for the token on the server.
    it('does not inject KBQ_WINDOW outside the browser', () => {
        TestBed.overrideProvider(Platform, { useValue: { isBrowser: false } });
        TestBed.overrideProvider(KBQ_WINDOW, {
            useFactory: () => {
                throw new Error('[KBQ_WINDOW] window is not available.');
            }
        });

        expect(() => TestBed.inject(KbqLocalStorageStateStore)).not.toThrow();
        expect(TestBed.inject(KbqLocalStorageStateStore).getState(key)).toBeNull();
    });

    it('persists into sessionStorage when the session store is used', () => {
        const store = TestBed.inject(KbqSessionStorageStateStore);

        store.setState(key, ['a']);

        expect(JSON.parse(window.sessionStorage.getItem(prefixed)!).state).toEqual(['a']);
        expect(window.localStorage.getItem(prefixed)).toBeNull();
    });

    it('writes under a prefix, so an entry cannot collide with the application own keys', () => {
        window.localStorage.setItem(key, 'the application own value');

        TestBed.inject(KbqLocalStorageStateStore).setState(key, ['a']);

        expect(window.localStorage.getItem(key)).toBe('the application own value');
        expect(JSON.parse(window.localStorage.getItem(prefixed)!)).toEqual({
            savedAt: expect.any(Number),
            state: ['a']
        });
    });

    it('drops an entry that outlived the TTL', () => {
        TestBed.overrideProvider(KBQ_STATE_SAVING_TTL, { useValue: ttl });
        seed(['a'], Date.now() - ttl - 1);

        const store = TestBed.inject(KbqLocalStorageStateStore);

        expect(store.getState(key)).toBeNull();
        expect(window.localStorage.getItem(prefixed)).toBeNull();
    });

    // Keys derived from the document strand an entry whenever the surrounding markup changes, and
    // nothing else would ever collect it.
    it('sweeps expired entries when it is constructed', () => {
        TestBed.overrideProvider(KBQ_STATE_SAVING_TTL, { useValue: ttl });
        seed(['stale'], Date.now() - ttl - 1);
        window.localStorage.setItem('kbq.state.fresh', JSON.stringify({ savedAt: Date.now(), state: ['b'] }));
        window.localStorage.setItem('kbq.state.corrupt', '{ not valid json');
        window.localStorage.setItem('not-ours', 'left alone');

        TestBed.inject(KbqLocalStorageStateStore);

        expect(window.localStorage.getItem(prefixed)).toBeNull();
        expect(window.localStorage.getItem('kbq.state.corrupt')).toBeNull();
        expect(window.localStorage.getItem('kbq.state.fresh')).not.toBeNull();
        expect(window.localStorage.getItem('not-ours')).toBe('left alone');
    });

    // Without this, state that is read on every visit but never changed would expire under an active
    // user.
    it('refreshes an entry read past half the TTL', () => {
        TestBed.overrideProvider(KBQ_STATE_SAVING_TTL, { useValue: ttl });

        const savedAt = Date.now() - ttl / 2 - 1;

        seed(['a'], savedAt);

        expect(TestBed.inject(KbqLocalStorageStateStore).getState(key)).toEqual(['a']);
        expect(JSON.parse(window.localStorage.getItem(prefixed)!).savedAt).toBeGreaterThan(savedAt);
    });

    it('does not rewrite an entry read before half the TTL', () => {
        TestBed.overrideProvider(KBQ_STATE_SAVING_TTL, { useValue: ttl });

        const savedAt = Date.now();

        seed(['a'], savedAt);

        expect(TestBed.inject(KbqLocalStorageStateStore).getState(key)).toEqual(['a']);
        expect(JSON.parse(window.localStorage.getItem(prefixed)!).savedAt).toBe(savedAt);
    });

    // Entries written before the prefix existed (20.2.0), so an upgrade does not reset what users had.
    it('reads an unprefixed entry left by an earlier version', () => {
        window.localStorage.setItem(key, '["a"]');

        expect(TestBed.inject(KbqLocalStorageStateStore).getState(key)).toEqual(['a']);
    });

    // An unprefixed key is not necessarily ours — an application storing its own `settings` must not
    // lose it to a component keyed `stateSavingKey="settings"`.
    it('neither rewrites nor removes the unprefixed entry it read', () => {
        window.localStorage.setItem(key, '["a"]');

        TestBed.inject(KbqLocalStorageStateStore).getState(key);

        expect(window.localStorage.getItem(key)).toBe('["a"]');
        expect(window.localStorage.getItem(prefixed)).toBeNull();
    });

    it('keeps a removal from being undone by the unprefixed entry behind it', () => {
        window.localStorage.setItem(key, '["a"]');

        const store = TestBed.inject(KbqLocalStorageStateStore);

        store.setState(key, ['b']);
        store.removeState(key);

        expect(store.getState(key)).toBeNull();
        expect(window.localStorage.getItem(key)).toBe('["a"]');
    });

    it('resolves the localStorage store through KBQ_STATE_STORE by default', () => {
        expect(TestBed.inject(KBQ_STATE_STORE)).toBe(TestBed.inject(KbqLocalStorageStateStore));
    });

    // A component persists a whole snapshot on every change, and one interaction routinely produces the
    // same snapshot twice. `setItem` is synchronous, so the repeat is worth skipping.
    it('skips the write when the payload is unchanged', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);
        const setItem = jest.spyOn(Storage.prototype, 'setItem');

        store.setState(key, ['a']);
        store.setState(key, ['a']);

        expect(setItem).toHaveBeenCalledTimes(1);

        store.setState(key, ['a', 'b']);

        expect(setItem).toHaveBeenCalledTimes(2);
        expect(store.getState(key)).toEqual(['a', 'b']);

        setItem.mockRestore();
    });
});

describe('kbqStateSaving', () => {
    let store: InMemoryStateStore;
    let enabled: WritableSignal<boolean>;
    let key: WritableSignal<string>;
    /** What the key resolver returns — the key used while `stateSavingKey` is empty. */
    let resolvedKey: string;
    /** How many times the resolver ran, to pin down that the resolved key is memoized. */
    let resolverCalls: number;

    /** Creates the controller under test: `string[]` state, with a normalizer that rejects non-arrays. */
    const setup = (): KbqStateSaving<string[]> => {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_STATE_STORE, useValue: store },
                {
                    provide: KBQ_STATE_SAVING_KEY_RESOLVER,
                    useValue: () => {
                        resolverCalls++;

                        return resolvedKey;
                    }
                }
            ]
        });

        return TestBed.runInInjectionContext(() =>
            kbqStateSaving<string[]>({
                name: 'KbqExample',
                enabled,
                key,
                normalize: (parsed) =>
                    Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : null
            })
        );
    };

    /** The controller after the initial `read()`, which is what unlocks writing. */
    const initialized = (): KbqStateSaving<string[]> => {
        const stateSaving = setup();

        stateSaving.read();

        return stateSaving;
    };

    beforeEach(() => {
        store = new InMemoryStateStore();
        enabled = signal(true);
        key = signal('example-key');
        resolvedKey = 'resolved-key';
        resolverCalls = 0;
    });

    it('reads and normalizes the persisted state', () => {
        store.setState('example-key', ['a', 'b']);

        expect(setup().read()).toEqual(['a', 'b']);
    });

    it('normalizes away a payload it cannot use', () => {
        store.setState('example-key', { nonsense: true });

        expect(setup().read()).toBeNull();
    });

    it('drops entries the normalizer rejects', () => {
        store.setState('example-key', ['a', 1, null]);

        expect(setup().read()).toEqual(['a']);
    });

    it('writes under the provided key', () => {
        initialized().write(['a']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    it('falls back to the resolved key when none is provided', () => {
        key.set('');

        initialized().write(['a']);

        expect(store.getState('resolved-key')).toEqual(['a']);
    });

    // `write()` asks for the key on every change, and resolving walks the document. A host that moved
    // would also resolve a different key and trip the key-change guard, silently ending persistence.
    it('resolves the key once', () => {
        key.set('');

        const stateSaving = initialized();

        stateSaving.write(['a']);
        stateSaving.write(['b']);

        expect(resolverCalls).toBe(1);
        expect(store.getState('resolved-key')).toEqual(['b']);
    });

    it('does not resolve a key while one is provided', () => {
        initialized().write(['a']);

        expect(resolverCalls).toBe(0);
    });

    it('persists nothing when no key can be resolved for the host', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

        key.set('');
        resolvedKey = '';

        const stateSaving = setup();

        expect(stateSaving.read()).toBeNull();

        stateSaving.write(['a']);

        expect(store.store.size).toBe(0);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('KbqExample'));

        warn.mockRestore();
    });

    // An input binding can put the host into an expanded state during the parent's update pass, before the
    // host's initialization hook reads — persisting then would overwrite the very state about to be read.
    it('suppresses writes until the state has been read', () => {
        store.setState('example-key', ['a']);

        const stateSaving = setup();

        stateSaving.write(['b']);

        expect(store.getState('example-key')).toEqual(['a']);
        expect(stateSaving.read()).toEqual(['a']);

        stateSaving.write(['b']);

        expect(store.getState('example-key')).toEqual(['b']);
    });

    // Persistence is on by default, so a component nobody configured is the ordinary case — warning about a
    // missing `stateSavingKey` would fire in every application, on every instance.
    it('does not warn when no key is provided', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

        key.set('');
        setup().read();

        expect(warn).not.toHaveBeenCalled();

        warn.mockRestore();
    });

    it('neither reads nor writes while disabled', () => {
        store.setState('example-key', ['a']);
        enabled.set(false);

        const stateSaving = setup();

        expect(stateSaving.read()).toBeNull();

        stateSaving.write(['b']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    // Restored state is applied through the component's own setters, which persist as they go.
    it('suppresses writes while applying', () => {
        const stateSaving = initialized();

        stateSaving.applying(() => stateSaving.write(['a']));

        expect(store.getState('example-key')).toBeNull();
    });

    // A flag rather than a counter would be released by the inner `finally`, letting the rest of the outer
    // restore write.
    it('keeps writes suppressed after a nested applying returns', () => {
        const stateSaving = initialized();

        stateSaving.applying(() => {
            stateSaving.applying(() => stateSaving.write(['inner']));
            stateSaving.write(['outer']);
        });

        expect(store.getState('example-key')).toBeNull();
    });

    it('resumes writing after applying, even when it throws', () => {
        const stateSaving = initialized();

        expect(() =>
            stateSaving.applying(() => {
                throw new Error('restore failed');
            })
        ).toThrow('restore failed');

        stateSaving.write(['a']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    it('tracks the state it last read or wrote', () => {
        const stateSaving = initialized();

        expect(stateSaving.state).toBeNull();

        stateSaving.write(['a']);

        expect(stateSaving.state).toEqual(['a']);

        stateSaving.clear();

        expect(stateSaving.state).toBeNull();
    });

    it('stops reporting a state once persistence is switched off', () => {
        store.setState('example-key', ['a']);

        const stateSaving = initialized();

        expect(stateSaving.state).toEqual(['a']);

        enabled.set(false);

        expect(stateSaving.state).toBeNull();
        expect(stateSaving.read()).toBeNull();
    });

    // A read taken while disabled must not arm writing: nothing was read, so a later write would still be
    // overwriting a state the component has never seen.
    it('keeps writes suppressed after a read taken while disabled', () => {
        store.setState('example-key', ['a']);
        enabled.set(false);

        const stateSaving = setup();

        stateSaving.read();
        enabled.set(true);
        stateSaving.write(['b']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    // Writing to a key whose contents were never read would overwrite whatever the new key holds.
    it('suppresses writes after the key changes, until the new key is read', () => {
        store.setState('example-key', ['a']);
        store.setState('other-key', ['b']);

        const warn = jest.spyOn(console, 'warn').mockImplementation();
        const stateSaving = initialized();

        key.set('other-key');
        stateSaving.write(['c']);

        expect(store.getState('other-key')).toEqual(['b']);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('other-key'));

        expect(stateSaving.read()).toEqual(['b']);

        stateSaving.write(['c']);

        expect(store.getState('other-key')).toEqual(['c']);
        expect(store.getState('example-key')).toEqual(['a']);

        warn.mockRestore();
    });

    it('clears the persisted state', () => {
        store.setState('example-key', ['a']);

        initialized().clear();

        expect(store.getState('example-key')).toBeNull();
    });

    // The key can be shared with a component that does persist, so a disabled one must not delete it.
    it('does not clear the persisted state while disabled', () => {
        store.setState('example-key', ['a']);
        enabled.set(false);

        setup().clear();

        expect(store.getState('example-key')).toEqual(['a']);
    });
});
