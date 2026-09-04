import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { kbqStateSaving, KbqStateSaving } from './state-saving';
import { KbqStateSavingService } from './state-saving-service';
import { KBQ_STATE_STORE, KbqStateStore } from './state-store';

/** In-memory `KbqStateStore` that can enumerate, the way the web-storage ones can. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();
    readonly changed = new Subject<void>();

    readonly changes = this.changed.asObservable();

    getState(key: string): unknown {
        return this.store.has(key) ? JSON.parse(JSON.stringify(this.store.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.store.delete(key);
    }

    keys(): string[] {
        return [...this.store.keys()];
    }
}

/** A store that can neither enumerate nor report changes — what a backend-backed one looks like. */
class OpaqueStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    getState(key: string): unknown {
        return this.store.get(key) ?? null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, state);
    }

    removeState(key: string): void {
        this.store.delete(key);
    }
}

describe('KbqStateSavingService', () => {
    let store: InMemoryStateStore;

    /** Configures the root store and returns the service under test. */
    const setup = (rootStore: KbqStateStore = store): KbqStateSavingService => {
        TestBed.configureTestingModule({ providers: [{ provide: KBQ_STATE_STORE, useValue: rootStore }] });

        return TestBed.inject(KbqStateSavingService);
    };

    /**
     * Creates a controller in an injector of its own, so it can be destroyed independently — and so a
     * store can be scoped to it, the way a component's own `providers` would.
     */
    const createSaving = (
        options: { key?: string; enabled?: boolean; name?: string; store?: KbqStateStore } = {}
    ): { saving: KbqStateSaving<string[]>; destroy: () => void } => {
        const injector = createEnvironmentInjector(
            options.store ? [{ provide: KBQ_STATE_STORE, useValue: options.store }] : [],
            TestBed.inject(EnvironmentInjector)
        );

        const saving = runInInjectionContext(injector, () =>
            kbqStateSaving<string[]>({
                name: options.name ?? 'KbqExample',
                enabled: signal(options.enabled ?? true),
                key: signal(options.key ?? 'example-key'),
                normalize: (parsed) =>
                    Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : null
            })
        );

        return { saving, destroy: () => injector.destroy() };
    };

    beforeEach(() => {
        store = new InMemoryStateStore();
    });

    describe('registry', () => {
        it('reports a component that registered', () => {
            const service = setup();

            createSaving({ name: 'KbqAccordion' });

            expect(service.components().map(({ name }) => name)).toEqual(['KbqAccordion']);
        });

        it('drops a component when its injector is destroyed', () => {
            const service = setup();
            const { destroy } = createSaving();

            expect(service.components()).toHaveLength(1);

            destroy();

            expect(service.components()).toEqual([]);
        });

        it('reports a snapshot, not a live view', () => {
            const service = setup();

            createSaving();

            const before = service.components();

            createSaving();

            expect(before).toHaveLength(1);
            expect(service.components()).toHaveLength(2);
        });

        it('exposes what a component persists', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            store.setState('settings', ['a']);
            saving.read();

            expect(service.components()).toEqual([
                expect.objectContaining({ name: 'KbqExample', key: 'settings', enabled: true, state: ['a'] })
            ]);
        });

        // Resolving a key needs the host to be in the document, so asking before then would report a key
        // nothing uses.
        it('reports an empty key until the component has read', () => {
            const service = setup();

            createSaving({ key: 'settings' });

            expect(service.components()[0].key).toBe('');
        });
    });

    describe('store', () => {
        it('lists the keys the store holds', () => {
            const service = setup();

            store.setState('a', [1]);
            store.setState('b', [2]);

            expect(service.keys()).toEqual(['a', 'b']);
        });

        // `KbqStateStore.keys` is optional exactly so a backend-backed store can leave it out.
        it('lists nothing when the store cannot enumerate', () => {
            const service = setup(new OpaqueStateStore());

            expect(service.keys()).toEqual([]);
            expect(service.orphans()).toEqual([]);
        });

        it('reads a raw payload', () => {
            const service = setup();

            store.setState('a', ['x']);

            expect(service.read('a')).toEqual(['x']);
        });

        it('overwrites a payload', () => {
            const service = setup();

            service.write('a', ['x']);

            expect(store.getState('a')).toEqual(['x']);
        });
    });

    describe('orphans', () => {
        it('reports the entries no live component claims', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'claimed' });

            saving.read();
            store.setState('claimed', ['a']);
            store.setState('stranded', ['b']);

            expect(service.orphans()).toEqual(['stranded']);
        });

        it('stops claiming an entry once the component is destroyed', () => {
            const service = setup();
            const { saving, destroy } = createSaving({ key: 'claimed' });

            saving.read();
            store.setState('claimed', ['a']);

            expect(service.orphans()).toEqual([]);

            destroy();

            expect(service.orphans()).toEqual(['claimed']);
        });

        it('removes only the unclaimed entries', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'claimed' });

            saving.read();
            store.setState('claimed', ['a']);
            store.setState('stranded', ['b']);

            service.clearOrphans();

            expect(service.keys()).toEqual(['claimed']);
        });
    });

    describe('removal', () => {
        it('removes one entry', () => {
            const service = setup();

            store.setState('a', ['x']);
            service.remove('a');

            expect(store.getState('a')).toBeNull();
        });

        // A component can be given its own store through its `providers`, which the root store knows
        // nothing about — going through the component reaches that one too.
        it('reaches a component that persists into its own store', () => {
            const scoped = new InMemoryStateStore();
            const service = setup();
            const { saving } = createSaving({ key: 'scoped-key', store: scoped });

            saving.read();
            saving.write(['a']);

            expect(scoped.getState('scoped-key')).toEqual(['a']);

            service.remove('scoped-key');

            expect(scoped.getState('scoped-key')).toBeNull();
        });

        it('removes everything', () => {
            const service = setup();

            store.setState('a', ['x']);
            store.setState('b', ['y']);

            service.clear();

            expect(service.keys()).toEqual([]);
        });
    });

    describe('application-wide switch', () => {
        it('is on by default', () => {
            expect(setup().isEnabled()).toBe(true);
        });

        it('stops a component reading and writing', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            store.setState('settings', ['a']);
            service.setEnabled(false);

            expect(saving.read()).toBeNull();

            saving.write(['b']);

            expect(store.getState('settings')).toEqual(['a']);
        });

        it('lets a component read and write again once it is back on', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            service.setEnabled(false);
            service.setEnabled(true);
            saving.read();
            saving.write(['b']);

            expect(store.getState('settings')).toEqual(['b']);
        });

        // The switch means "stop remembering" — removing what was already remembered carries that out
        // rather than being something it should block.
        it('does not stop a component clearing what it already persisted', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            saving.read();
            saving.write(['a']);
            service.setEnabled(false);
            saving.clear();

            expect(store.getState('settings')).toBeNull();
        });
    });

    describe('changes', () => {
        /** Counts emissions from the moment it is called. */
        const count = (service: KbqStateSavingService): { calls: number } => {
            const counter = { calls: 0 };

            service.changes.subscribe(() => counter.calls++);

            return counter;
        };

        it('emits when a component registers and when it is destroyed', () => {
            const service = setup();
            const emissions = count(service);
            const { destroy } = createSaving();

            expect(emissions.calls).toBe(1);

            destroy();

            expect(emissions.calls).toBe(2);
        });

        it('does not emit for a component it is not holding', () => {
            const service = setup();
            const { saving, destroy } = createSaving();

            destroy();

            const emissions = count(service);

            service.unregister(saving);

            expect(emissions.calls).toBe(0);
        });

        // A component persisting does not pass through the service, and it is the change a panel most
        // often needs to hear about.
        it('emits when a component persists or clears its own state', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            saving.read();

            const emissions = count(service);

            saving.write(['a']);
            saving.clear();

            expect(emissions.calls).toBe(2);
        });

        it('reports a compound removal once, not once per component it reaches', () => {
            const service = setup();
            const { saving } = createSaving({ key: 'settings' });

            saving.read();
            saving.write(['a']);

            const emissions = count(service);

            service.clear();

            expect(emissions.calls).toBe(1);
        });

        it('emits on its own writes and removals', () => {
            const service = setup();
            const emissions = count(service);

            service.write('a', ['x']);
            service.remove('a');
            service.clear();
            service.clearOrphans();

            expect(emissions.calls).toBe(4);
        });

        it('emits when the switch is flipped, and not when it is set to what it already is', () => {
            const service = setup();
            const emissions = count(service);

            service.setEnabled(false);
            service.setEnabled(false);

            expect(emissions.calls).toBe(1);
        });

        // Another tab wrote: the store reports it, and a panel listing entries has to hear about it.
        it('re-emits what the store reports', () => {
            const service = setup();
            const emissions = count(service);

            store.changed.next();

            expect(emissions.calls).toBe(1);
        });

        it('survives a store that cannot report changes', () => {
            const service = setup(new OpaqueStateStore());
            const emissions = count(service);

            service.write('a', ['x']);

            expect(emissions.calls).toBe(1);
        });
    });
});
