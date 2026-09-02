import { Platform } from '@angular/cdk/platform';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '../tokens';
import { kbqStateSaving, KbqStateSaving } from './state-saving';
import { KBQ_STATE_STORE, KbqLocalStorageStateStore, KbqSessionStorageStateStore, KbqStateStore } from './state-store';

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

        window.localStorage.setItem(key, '{ not valid json');

        expect(() => store.getState(key)).not.toThrow();
        expect(store.getState(key)).toBeNull();
    });

    // The store does not judge the shape — that is the consumer's normalizer's job. It only has to hand
    // back whatever parsed, so a consumer sees the real payload rather than a silently swallowed one.
    it('returns a payload of any shape as parsed', () => {
        const store = TestBed.inject(KbqLocalStorageStateStore);

        window.localStorage.setItem(key, '{"a": null, "b": 1}');

        expect(store.getState(key)).toEqual({ a: null, b: 1 });
    });

    it('is a no-op when the storage is unavailable', () => {
        // Mirrors the server-provided `KBQ_WINDOW` in apps/docs/src/config.server.ts, which has no
        // `localStorage` at all — reaching it throws, which the store must swallow.
        TestBed.overrideProvider(KBQ_WINDOW, { useValue: { ...window, localStorage: undefined } });

        const store = TestBed.inject(KbqLocalStorageStateStore);

        store.setState(key, ['a']);

        expect(store.getState(key)).toBeNull();
        expect(window.localStorage.getItem(key)).toBeNull();
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

        expect(window.sessionStorage.getItem(key)).toBe('["a"]');
        expect(window.localStorage.getItem(key)).toBeNull();
    });

    it('resolves the localStorage store through KBQ_STATE_STORE by default', () => {
        expect(TestBed.inject(KBQ_STATE_STORE)).toBe(TestBed.inject(KbqLocalStorageStateStore));
    });
});

describe('kbqStateSaving', () => {
    let store: InMemoryStateStore;
    let enabled: WritableSignal<boolean>;
    let key: WritableSignal<string>;

    /** Creates the controller under test: `string[]` state, with a normalizer that rejects non-arrays. */
    const setup = (): KbqStateSaving<string[]> => {
        TestBed.configureTestingModule({ providers: [{ provide: KBQ_STATE_STORE, useValue: store }] });

        return TestBed.runInInjectionContext(() =>
            kbqStateSaving<string[]>({
                name: 'KbqExample',
                enabled,
                key,
                fallbackKey: () => 'fallback-key',
                normalize: (parsed) =>
                    Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : null
            })
        );
    };

    beforeEach(() => {
        store = new InMemoryStateStore();
        enabled = signal(true);
        key = signal('example-key');
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
        setup().write(['a']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    it('falls back to the host id when no key is provided', () => {
        key.set('');

        setup().write(['a']);

        expect(store.getState('fallback-key')).toEqual(['a']);
    });

    it('warns in dev mode when reading without a key', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

        key.set('');
        setup().read();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('KbqExample'));

        warn.mockRestore();
    });

    it('does not warn when a key is provided', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

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
        const stateSaving = setup();

        stateSaving.applying(() => stateSaving.write(['a']));

        expect(store.getState('example-key')).toBeNull();
    });

    it('resumes writing after applying, even when it throws', () => {
        const stateSaving = setup();

        expect(() =>
            stateSaving.applying(() => {
                throw new Error('restore failed');
            })
        ).toThrow('restore failed');

        stateSaving.write(['a']);

        expect(store.getState('example-key')).toEqual(['a']);
    });

    it('tracks the state it last read or wrote', () => {
        const stateSaving = setup();

        expect(stateSaving.state).toBeNull();

        stateSaving.write(['a']);

        expect(stateSaving.state).toEqual(['a']);

        stateSaving.clear();

        expect(stateSaving.state).toBeNull();
    });

    it('clears the persisted state', () => {
        store.setState('example-key', ['a']);

        setup().clear();

        expect(store.getState('example-key')).toBeNull();
    });
});
