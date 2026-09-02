import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { KBQ_WINDOW } from '../tokens/window';
import {
    KBQ_DEFAULT_THEMES,
    KBQ_THEME_CONFIG,
    KBQ_THEME_STORE,
    KbqThemeCookieStore,
    KbqThemeLocalStorageStore,
    KbqThemeMode,
    kbqThemeProvider,
    KbqThemeService,
    KbqThemeStore,
    ThemeService
} from './theme.service';

/** Minimal fake `MediaQueryList` that lets tests flip `matches` and trigger the `change` listener. */
function fakeMediaQueryList(matches: boolean) {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;

    const mql = {
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => {
            listener = cb;
        },
        removeEventListener: () => {
            listener = undefined;
        },
        dispatchEvent: () => true
    } as unknown as MediaQueryList;

    return {
        mql,
        emit(newMatches: boolean) {
            (mql as { matches: boolean }).matches = newMatches;
            listener?.({ matches: newMatches } as MediaQueryListEvent);
        }
    };
}

/**
 * `KBQ_WINDOW` for a browser test. Spreading `window` copies only own enumerable properties, so the
 * listener pair — which lives on `EventTarget.prototype` — has to be restored explicitly; without it every
 * consumer of `KBQ_WINDOW` would silently see a window that cannot register listeners.
 */
function fakeWindow(overrides: Partial<Window> = {}) {
    return {
        ...window,
        addEventListener: window.addEventListener.bind(window),
        removeEventListener: window.removeEventListener.bind(window),
        ...overrides
    };
}

/** Mirrors the server-side `KBQ_WINDOW` from apps/docs/src/config.server.ts. */
function fakeServerWindow(matches: boolean) {
    return {
        matchMedia: () => ({
            addEventListener: () => {},
            dispatchEvent: () => false,
            removeEventListener: () => {},
            matches,
            media: '',
            onchange: null,
            addListener: () => {},
            removeListener: () => {}
        })
    };
}

/** Runs the injector on the server platform, the way `@angular/platform-server` does. */
const serverPlatform = { provide: PLATFORM_ID, useValue: 'server' };

/** Minimal fake of the `storage` event plumbing on `KBQ_WINDOW`, so tests can play another tab. */
function fakeStorageEvents() {
    let listener: ((event: StorageEvent) => void) | undefined;

    return {
        overrides: {
            addEventListener: (type: string, callback: (event: StorageEvent) => void) => {
                if (type === 'storage') listener = callback;
            },
            removeEventListener: () => {
                listener = undefined;
            }
        } as unknown as Partial<Window>,
        emit(key: string | null) {
            listener?.({ key } as StorageEvent);
        }
    };
}

describe('KbqThemeService', () => {
    let store: jest.Mocked<KbqThemeStore>;

    function setup(matches = false, render = true) {
        const media = fakeMediaQueryList(matches);
        const matchMedia = jest.fn().mockReturnValue(media.mql);

        store = {
            getMode: jest.fn().mockReturnValue(null),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue(null),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia }) },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        if (render) TestBed.tick();

        return { service, media, matchMedia };
    }

    afterEach(() => {
        document.body.className = '';
        localStorage.clear();
    });

    it('defaults to auto mode, resolving dark when the OS prefers dark', () => {
        const { service } = setup(true);

        expect(service.mode()).toBe('auto');
        expect(service.currentTheme()?.name).toBe('dark');
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
    });

    it('defaults to auto mode, resolving light when the OS prefers light', () => {
        const { service } = setup(false);

        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it('defaults to light when matchMedia is unavailable during server-side rendering', () => {
        TestBed.configureTestingModule({
            providers: [serverPlatform, { provide: KBQ_WINDOW, useValue: {} }]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.mode()).toBe('auto');
        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it('does not crash with a server-window `matchMedia` stub shaped like provideServerWindow in apps/docs/src/config.server.ts', () => {
        // Unlike the `{}` above, a real SSR `KBQ_WINDOW` (see `provideServerWindow`) provides `matchMedia` as
        // an actual function returning a stub `MediaQueryList` that never matches — exercises the code path
        // where the `typeof matchMedia === 'function'` guard passes, but the returned list carries no
        // `matches: true` and only legacy `addListener`/`removeListener`, not real events.
        TestBed.configureTestingModule({
            providers: [serverPlatform, { provide: KBQ_WINDOW, useValue: fakeServerWindow(false) }]
        });

        const service = TestBed.inject(KbqThemeService);

        expect(() => TestBed.tick()).not.toThrow();
        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it('resolves dark synchronously when a server-window matchMedia stub reports a dark preference', () => {
        // A consumer overriding `provideServerWindow` to reflect e.g. a `Sec-CH-Prefers-Color-Scheme` request
        // header would reassign `matches` to `true` on this same stub shape, so the server renders dark
        // straight away. Asserted without `TestBed.tick()` — the resolution must be synchronous, since a
        // server render never gets an `afterNextRender`-style follow-up pass to correct a wrong first guess.
        TestBed.configureTestingModule({
            providers: [serverPlatform, { provide: KBQ_WINDOW, useValue: fakeServerWindow(true) }]
        });

        const service = TestBed.inject(KbqThemeService);

        // No `TestBed.tick()` before this — `currentTheme()` must already resolve to dark from construction.
        expect(service.currentTheme()?.name).toBe('dark');

        TestBed.tick();
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
    });

    it('resolves the system preference synchronously, before the first render, and observes later changes', () => {
        const { service, media } = setup(true, false);

        // No `TestBed.tick()` yet — the initial value must already be correct to avoid a light→dark flash.
        expect(service.currentTheme()?.name).toBe('dark');

        media.emit(false);
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('defaults to light when matchMedia throws (e.g. a sandboxed iframe or restrictive CSP)', () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: KBQ_WINDOW,
                    useValue: fakeWindow({
                        matchMedia: () => {
                            throw new Error('SecurityError');
                        }
                    })
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('light');
    });

    it('follows OS color scheme changes while in auto mode', () => {
        const { service, media } = setup(false);

        expect(service.currentTheme()?.name).toBe('light');

        media.emit(true);
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('dark');
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
        expect(document.body.classList.contains('kbq-light')).toBe(false);
    });

    it('survives a MediaQueryList carrying addEventListener and nothing else', () => {
        // `fromEvent()` rejects a target missing either half of the listener pair, and rejects it by
        // throwing synchronously — which used to fail the constructor rather than just the subscription.
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: KBQ_WINDOW,
                    useValue: { matchMedia: () => ({ matches: false, media: '', addEventListener: () => {} }) }
                }
            ]
        });

        expect(() => TestBed.inject(KbqThemeService)).not.toThrow();
        expect(TestBed.inject(KbqThemeService).currentTheme()?.name).toBe('light');
        expect(() => TestBed.resetTestingModule()).not.toThrow();
    });

    it('queries matchMedia once, so the initial read and the subscription share one MediaQueryList', () => {
        const { matchMedia } = setup(false);

        expect(matchMedia).toHaveBeenCalledTimes(1);
        expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('ignores OS color scheme changes while a fixed mode is selected', () => {
        const { service, media } = setup(false);

        service.setMode('light');
        TestBed.tick();

        media.emit(true);
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it('ignores OS color scheme changes while a static theme is pinned', () => {
        const { service, media } = setup(false);

        service.selectTheme('light');
        TestBed.tick();

        media.emit(true);
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('light');
    });

    it('applies an OS change that happened while a fixed mode was selected, once auto is restored', () => {
        const { service, media } = setup(false);

        service.setMode('light');
        TestBed.tick();

        // The OS flips while the app is pinned to light: nothing may change now, but the new preference
        // has to be the one `auto` resolves against afterwards - not the one read at construction.
        media.emit(true);
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');

        service.setMode('auto');
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('dark');
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
    });

    it('stops following the OS preference once the injector is destroyed', () => {
        const { service, media } = setup(false);

        TestBed.resetTestingModule();

        media.emit(true);

        expect(service.currentTheme()?.name).toBe('light');
    });

    it('setMode selects a fixed mode or falls back to the OS preference', () => {
        const { service } = setup(true);

        service.setMode('light');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');

        service.setMode('dark');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        service.setMode('auto');
        TestBed.tick();
        expect(service.mode()).toBe('auto');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('persists the mode before clearing the pin, so another tab never sees the old mode unpinned', () => {
        const { service } = setup(false);
        const writes: string[] = [];

        store.setMode.mockImplementation(() => void writes.push('mode'));
        store.setStaticTheme.mockImplementation(() => void writes.push('static'));

        service.setMode('dark');

        expect(writes).toEqual(['mode', 'static']);
    });

    it('setMode clears an active static theme', () => {
        const { service } = setup(false);

        service.selectTheme('dark');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        service.setMode('dark');
        TestBed.tick();

        expect(service.staticTheme()).toBeNull();
        expect(service.mode()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('toggle switches between light and dark', () => {
        const { service } = setup(false);

        service.toggle();
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        service.toggle();
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('supports registering a fully custom set of themes, resolved by colorScheme', () => {
        const { service } = setup(false);

        service.setThemes([
            { name: 'acme-light', className: 'kbq-acme-light', colorScheme: 'light' },
            { name: 'acme-dark', className: 'kbq-acme-dark', colorScheme: 'dark' }
        ]);
        service.setMode('dark');
        TestBed.tick();

        expect(service.currentTheme()?.className).toBe('kbq-acme-dark');
        expect(document.body.classList.contains('kbq-acme-dark')).toBe(true);
    });

    it('keeps the class applied when two registered themes share a className, regardless of array order', () => {
        const { service } = setup(false);

        // A named theme layered onto the same class as an existing entry — e.g. a custom name pinned to
        // the built-in light class, appended after it, exactly as a consumer registering extra named
        // pins onto the default set would do.
        service.setThemes([
            { name: 'light', className: 'kbq-light', colorScheme: 'light' },
            { name: 'dark', className: 'kbq-dark', colorScheme: 'dark' },
            { name: 'Day', className: 'kbq-light', colorScheme: 'light' }
        ]);
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it("exposes colorScheme as the current theme's own polarity, independent of its name", () => {
        const { service } = setup(false);

        service.setThemes([
            { name: 'acme-light', className: 'kbq-acme-light', colorScheme: 'light' },
            { name: 'acme-dark', className: 'kbq-acme-dark', colorScheme: 'dark' }
        ]);
        service.setMode('dark');
        TestBed.tick();

        expect(service.colorScheme()).toBe('dark');
    });

    it('resolves auto mode against a custom theme set via colorScheme', () => {
        const media = fakeMediaQueryList(true);

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                kbqThemeProvider({
                    themes: [
                        { name: 'sunrise', className: 'kbq-sunrise', colorScheme: 'light' },
                        { name: 'midnight', className: 'kbq-midnight', colorScheme: 'dark' }
                    ]
                }),
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => null,
                        setMode: () => {},
                        getStaticTheme: () => null,
                        setStaticTheme: () => {}
                    }
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.mode()).toBe('auto');
        expect(service.currentTheme()?.name).toBe('midnight');
        expect(document.body.classList.contains('kbq-midnight')).toBe(true);

        service.toggle();
        TestBed.tick();

        expect(service.mode()).toBe('light');
        expect(service.currentTheme()?.name).toBe('sunrise');
        expect(document.body.classList.contains('kbq-sunrise')).toBe(true);
    });

    it('persists the selected mode via KBQ_THEME_STORE', () => {
        const { service } = setup(false);

        service.setMode('dark');
        TestBed.tick();

        expect(store.setMode).toHaveBeenCalledWith('dark');
    });

    it('writes nothing to the store until a selection is actually made', () => {
        setup(false);

        // Persisting the initial value would freeze it: a later change to `config.mode` would then be
        // overridden by what the very first visit happened to write.
        expect(store.setMode).not.toHaveBeenCalled();
        expect(store.setStaticTheme).not.toHaveBeenCalled();
    });

    it('picks up a mode selected in another tab, without writing it back', () => {
        const media = fakeMediaQueryList(false);
        const changes = new Subject<void>();
        let storedMode: KbqThemeMode | null = null;

        store = {
            getMode: jest.fn(() => storedMode),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue(null),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                { provide: KBQ_THEME_STORE, useValue: { ...store, changes } }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');

        storedMode = 'dark';
        changes.next();
        TestBed.tick();

        expect(service.mode()).toBe('dark');
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
        // The tab that made the change already persisted it; echoing it back would only rewrite the
        // same value - and, with a cookie store, reset its expiry on every tab that heard about it.
        expect(store.setMode).not.toHaveBeenCalled();
    });

    it('ignores a theme name pinned in another tab that is not registered here', () => {
        // `setThemes()` is per-instance — the docs' own `ThemeStaticSelectionExample` registers `Day`/`Night`
        // only while it is mounted, then persists one of those names for every other tab to read.
        const media = fakeMediaQueryList(false);
        const changes = new Subject<void>();
        let storedStaticTheme: string | null = null;

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => 'light',
                        setMode: () => {},
                        getStaticTheme: () => storedStaticTheme,
                        setStaticTheme: () => {},
                        changes
                    } satisfies KbqThemeStore
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        storedStaticTheme = 'Night';
        changes.next();
        TestBed.tick();

        // An unknown name must degrade to "no change", not to `currentTheme() === null`, which would
        // strip every theme class off the body and leave the page with no theme at all.
        expect(service.staticTheme()).toBeNull();
        expect(service.currentTheme()?.name).toBe('light');
        expect(document.body.classList.contains('kbq-light')).toBe(true);
    });

    it('picks up a static theme pinned in another tab', () => {
        const media = fakeMediaQueryList(true);
        const changes = new Subject<void>();

        store = {
            getMode: jest.fn().mockReturnValue(null),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue(null),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                { provide: KBQ_THEME_STORE, useValue: { ...store, changes } }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        store.getStaticTheme.mockReturnValue('light');
        changes.next();
        TestBed.tick();

        expect(service.staticTheme()).toBe('light');
        expect(service.currentTheme()?.name).toBe('light');
        expect(store.setStaticTheme).not.toHaveBeenCalled();
    });

    it('clears the pin when another tab cleared it, rather than falling back to config.theme', () => {
        const media = fakeMediaQueryList(false);
        const changes = new Subject<void>();
        let storedStaticTheme: string | null = 'dark';

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                kbqThemeProvider({ theme: 'dark' }),
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => 'light',
                        setMode: () => {},
                        getStaticTheme: () => storedStaticTheme,
                        setStaticTheme: () => {},
                        changes
                    } satisfies KbqThemeStore
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();
        expect(service.staticTheme()).toBe('dark');

        // `setMode()` in another tab clears the pin, so the store now reports nothing pinned. Re-applying
        // `config.theme` here would re-pin it in this tab and leave the two tabs on different themes.
        storedStaticTheme = null;
        changes.next();
        TestBed.tick();

        expect(service.staticTheme()).toBeNull();
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('restores the mode persisted in KBQ_THEME_STORE on init', () => {
        const media = fakeMediaQueryList(false);

        store = {
            getMode: jest.fn().mockReturnValue('dark'),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue('dark'),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.mode()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('falls back to config.mode when the persisted value is not a valid mode', () => {
        const media = fakeMediaQueryList(false);

        // Mimics a value persisted before mode-only selection existed (an arbitrary theme name), or any
        // other foreign/stale value - `mode` is strictly closed now, so it can't be trusted as-is.
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => 'solarized',
                        setMode: () => {},
                        getStaticTheme: () => null,
                        setStaticTheme: () => {}
                    }
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.mode()).toBe('auto');
    });

    it('staticTheme defaults to null, resolving currentTheme via mode as usual', () => {
        const { service } = setup(true);

        expect(service.staticTheme()).toBeNull();
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('selecting a static theme overrides mode-based resolution, even against a mismatched colorScheme', () => {
        const { service } = setup(false);

        service.setThemes([
            { name: 'acme-light', className: 'kbq-acme-light', colorScheme: 'light' },
            { name: 'acme-dark', className: 'kbq-acme-dark', colorScheme: 'dark' }
        ]);
        service.selectTheme('acme-dark');
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('acme-dark');
        expect(service.colorScheme()).toBe('dark');
        expect(document.body.classList.contains('kbq-acme-dark')).toBe(true);
        expect(document.body.classList.contains('kbq-acme-light')).toBe(false);
    });

    it('clearing the static theme returns resolution to mode()', () => {
        const { service } = setup(false);

        service.selectTheme('dark');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        service.selectTheme(null);
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('toggle clears an active static theme and flips relative to its actual colorScheme', () => {
        const { service } = setup(false);

        service.setMode('light');
        service.selectTheme('dark');
        TestBed.tick();
        expect(service.colorScheme()).toBe('dark');

        service.toggle();
        TestBed.tick();

        expect(service.staticTheme()).toBeNull();
        expect(service.mode()).toBe('light');
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('currentTheme is null when the static theme name has no matching registered theme', () => {
        const { service } = setup(false);

        expect(service.currentTheme()?.name).toBe('light');

        service.selectTheme('unknown');
        TestBed.tick();

        expect(service.currentTheme()).toBeNull();
        expect(document.body.classList.contains('kbq-light')).toBe(false);
    });

    it('persists the static theme via KBQ_THEME_STORE', () => {
        const { service } = setup(false);

        service.selectTheme('dark');
        TestBed.tick();

        expect(store.setStaticTheme).toHaveBeenCalledWith('dark');
    });

    it('restores the static theme persisted in KBQ_THEME_STORE on init, taking priority over config.mode', () => {
        const media = fakeMediaQueryList(false);

        store = {
            getMode: jest.fn().mockReturnValue(null),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue('dark'),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.staticTheme()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('does not re-apply config.theme on a later load, once the user has picked a mode', () => {
        // The second page load after `setMode('light')`: the store holds a mode, and the pin it cleared
        // reads back as `null` — indistinguishable from "never pinned" through the store interface.
        const media = fakeMediaQueryList(true);

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                kbqThemeProvider({ theme: 'dark' }),
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => 'light',
                        setMode: () => {},
                        getStaticTheme: () => null,
                        setStaticTheme: () => {}
                    } satisfies KbqThemeStore
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.staticTheme()).toBeNull();
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('falls back to config.theme when nothing is persisted yet', () => {
        const media = fakeMediaQueryList(false);

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) },
                kbqThemeProvider({ theme: 'dark' }),
                {
                    provide: KBQ_THEME_STORE,
                    useValue: {
                        getMode: () => null,
                        setMode: () => {},
                        getStaticTheme: () => null,
                        setStaticTheme: () => {}
                    }
                }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.staticTheme()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });
});

describe('ThemeService', () => {
    function setup(matches = false) {
        const media = fakeMediaQueryList(matches);

        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_WINDOW, useValue: fakeWindow({ matchMedia: () => media.mql }) }]
        });

        const service = TestBed.inject(ThemeService);

        TestBed.tick();

        return { service, media };
    }

    afterEach(() => {
        document.body.className = '';
        localStorage.clear();
    });

    it('shares state with the injected KbqThemeService (single source of truth)', () => {
        const { service } = setup(false);
        const kbqThemeService = TestBed.inject(KbqThemeService);

        kbqThemeService.setMode('dark');
        TestBed.tick();

        expect(service.current.value?.name).toBe('dark');
    });

    it('keeps the deprecated `selected` field in sync for backward compatibility', () => {
        const { service } = setup(true);

        const themes = service.themes;

        expect(themes.find((theme) => theme.name === 'dark')?.selected).toBe(true);
        expect(themes.find((theme) => theme.name === 'light')?.selected).toBe(false);
    });

    it('exposes the deprecated `setTheme`/`getTheme` shims', () => {
        const { service } = setup(false);

        service.setTheme(1);
        TestBed.tick();
        expect(service.getTheme()?.name).toBe('dark');

        service.setTheme(KBQ_DEFAULT_THEMES[0]);
        TestBed.tick();
        expect(service.getTheme()?.name).toBe('light');
    });

    it('keeps the deprecated `current` BehaviorSubject in sync with `getTheme()`', () => {
        const { service } = setup(false);

        expect(service.current.value?.name).toBe('light');

        service.setTheme(KBQ_DEFAULT_THEMES[1]);
        TestBed.tick();

        expect(service.current.value?.name).toBe('dark');
        expect(service.current.value).toBe(service.getTheme());
    });
});

describe('KbqThemeLocalStorageStore', () => {
    function setup(config: { storageKey?: string } = {}, windowOverrides: Partial<Window> = {}, onServer = false) {
        TestBed.configureTestingModule({
            providers: [
                ...(onServer ? [serverPlatform] : []),
                { provide: KBQ_WINDOW, useValue: fakeWindow(windowOverrides) },
                kbqThemeProvider(config)
            ]
        });

        return TestBed.inject(KbqThemeLocalStorageStore);
    }

    afterEach(() => localStorage.clear());

    it('persists and restores the mode via localStorage in the browser', () => {
        const store = setup();

        expect(store.getMode()).toBeNull();

        store.setMode('dark');

        expect(store.getMode()).toBe('dark');
    });

    it('is a no-op when `localStorage` is unavailable (e.g. on the server)', () => {
        // Mirrors the server-provided `KBQ_WINDOW` in apps/docs/src/config.server.ts, which has no
        // `localStorage` at all — accessing it throws, which the store must swallow.
        const store = setup({}, { localStorage: undefined });

        store.setMode('dark');

        expect(store.getMode()).toBeNull();
        expect(localStorage.getItem('kbq-theme-mode')).toBeNull();
    });

    it('uses the storage key configured via KBQ_THEME_CONFIG', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setMode('dark');

        expect(localStorage.getItem('docs_theme')).toBe('dark');
        expect(localStorage.getItem('kbq-theme-mode')).toBeNull();
    });

    it('persists and restores the static theme name via localStorage', () => {
        const store = setup();

        expect(store.getStaticTheme()).toBeNull();

        store.setStaticTheme('acme-dark');

        expect(store.getStaticTheme()).toBe('acme-dark');
    });

    it('stores the static theme under a key derived from storageKey, distinct from the mode key', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setStaticTheme('acme-dark');

        expect(localStorage.getItem('docs_theme-static')).toBe('acme-dark');
        expect(localStorage.getItem('docs_theme')).toBeNull();
    });

    it('clears the persisted static theme when setStaticTheme is called with null, by storing an empty string', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setStaticTheme('acme-dark');
        store.setStaticTheme(null);

        expect(store.getStaticTheme()).toBeNull();
        // Empty, not absent — `setStaticTheme(null)` never removes the key, it stores `''` (see the store's
        // own comment for why: `''` is unambiguous, since no real theme has an empty `name`).
        expect(localStorage.getItem('docs_theme-static')).toBe('');
    });

    it('is a no-op for the static theme when localStorage is unavailable (e.g. on the server)', () => {
        const store = setup({}, { localStorage: undefined });

        store.setStaticTheme('acme-dark');

        expect(store.getStaticTheme()).toBeNull();
    });

    it('reports the keys it owns changing in another tab', () => {
        const events = fakeStorageEvents();
        const store = setup({}, events.overrides);
        let emitted = 0;

        store.changes.subscribe(() => emitted++);

        events.emit('kbq-theme-mode');
        events.emit('kbq-theme-mode-static');
        // `null` is `localStorage.clear()` - every key at once, this store's included.
        events.emit(null);

        expect(emitted).toBe(3);
    });

    it('ignores storage events for keys it does not own', () => {
        const events = fakeStorageEvents();
        const store = setup({ storageKey: 'docs_theme' }, events.overrides);
        let emitted = 0;

        store.changes.subscribe(() => emitted++);

        events.emit('kbq-theme-mode');
        events.emit('some-unrelated-key');

        expect(emitted).toBe(0);
    });

    it('releases the storage listener when the subscription ends', () => {
        const events = fakeStorageEvents();
        const store = setup({}, events.overrides);
        let emitted = 0;

        const subscription = store.changes.subscribe(() => emitted++);

        events.emit('kbq-theme-mode');
        subscription.unsubscribe();
        events.emit('kbq-theme-mode');

        expect(emitted).toBe(1);
    });

    it('survives a window carrying addEventListener and nothing else', () => {
        // A bare object, not `fakeWindow()`: a spread of `window` keeps its numeric `length`, which makes
        // `fromEvent()` treat it as a list of targets and quietly listen to none of them instead of
        // rejecting it. `fromEvent()` rejects a target missing either half of the listener pair by
        // throwing synchronously — from this store's field initializer, failing the injector itself.
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { addEventListener: () => {} } },
                kbqThemeProvider({})
            ]
        });

        expect(() => TestBed.inject(KbqThemeLocalStorageStore)).not.toThrow();
        expect(() => TestBed.inject(KbqThemeLocalStorageStore).changes.subscribe().unsubscribe()).not.toThrow();
    });

    it('has an empty changes stream on the server, which has no other tabs to hear from', () => {
        const store = setup({}, {}, true);
        let completed = false;

        store.changes.subscribe({ complete: () => (completed = true) });

        expect(completed).toBe(true);
    });
});

describe('KbqThemeCookieStore', () => {
    /** Stands in for the SSR request, of which only the `Cookie` header matters here. */
    function requestWith(cookieHeader: string): Request {
        return {
            headers: { get: (name: string) => (name.toLowerCase() === 'cookie' ? cookieHeader : null) }
        } as unknown as Request;
    }

    function setup(config: { storageKey?: string } = {}, requestCookieHeader?: string) {
        TestBed.configureTestingModule({
            providers: [
                // A request only ever reaches this store on the server; in the browser `REQUEST` is `null`.
                ...(requestCookieHeader === undefined ? [] : [serverPlatform]),
                kbqThemeProvider(config),
                {
                    provide: REQUEST,
                    useValue: requestCookieHeader === undefined ? null : requestWith(requestCookieHeader)
                }
            ]
        });

        return TestBed.inject(KbqThemeCookieStore);
    }

    function clearCookies() {
        for (const cookie of document.cookie.split('; ')) {
            const name = cookie.split('=')[0];

            if (name) document.cookie = `${name}=; path=/; max-age=0`;
        }
    }

    afterEach(() => clearCookies());

    it('persists and restores the mode via a cookie', () => {
        const store = setup();

        expect(store.getMode()).toBeNull();

        store.setMode('dark');

        expect(store.getMode()).toBe('dark');
        expect(document.cookie).toContain('kbq-theme-mode=dark');
    });

    it('uses the storage key configured via KBQ_THEME_CONFIG', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setMode('dark');

        expect(document.cookie).toContain('docs_theme=dark');
        expect(document.cookie).not.toContain('kbq-theme-mode=');
    });

    it('does not confuse cookies whose name is a suffix of the storage key', () => {
        document.cookie = 'other-kbq-theme-mode=dark; path=/';

        const store = setup();

        expect(store.getMode()).toBeNull();
    });

    it('reads the request cookies during a server render', () => {
        const store = setup({ storageKey: 'docs_theme' }, 'foo=1; docs_theme=dark; docs_theme-static=acme-dark');

        expect(store.getMode()).toBe('dark');
        expect(store.getStaticTheme()).toBe('acme-dark');
    });

    it('ignores the request in the browser, where document.cookie is the live source', () => {
        document.cookie = 'docs_theme=light; path=/';

        TestBed.configureTestingModule({
            providers: [
                kbqThemeProvider({ storageKey: 'docs_theme' }),
                { provide: REQUEST, useValue: requestWith('docs_theme=dark') }
            ]
        });

        // `document.cookie` reflects writes made since the page loaded; the request that delivered the
        // page does not, so a stale header must never win over it.
        expect(TestBed.inject(KbqThemeCookieStore).getMode()).toBe('light');
    });

    it('never touches document.cookie during a server render', () => {
        // domino, the DOM implementation bundled into `@angular/platform-server`, declares `document.cookie`
        // as "not yet implemented": reading or writing it throws instead of yielding an empty string, so an
        // access that is not gated on the platform takes the whole server render down.
        const serverDocument = {
            get cookie(): string {
                throw new Error('NotYetImplemented');
            },
            set cookie(_: string) {
                throw new Error('NotYetImplemented');
            }
        };

        TestBed.configureTestingModule({
            providers: [
                serverPlatform,
                kbqThemeProvider({ storageKey: 'docs_theme' }),
                { provide: DOCUMENT, useValue: serverDocument },
                { provide: REQUEST, useValue: requestWith('docs_theme=dark') }
            ]
        });

        const store = TestBed.inject(KbqThemeCookieStore);

        expect(store.getMode()).toBe('dark');
        expect(store.getStaticTheme()).toBeNull();
        // Nothing to persist on the server — the selection arrived with the request.
        expect(() => store.setMode('light')).not.toThrow();
        expect(() => store.setStaticTheme('acme-dark')).not.toThrow();
        expect(store.getMode()).toBe('dark');
    });

    it('degrades to no cookies when REQUEST is not a fetch Request', () => {
        // `REQUEST` is a plain token with a `null` factory, so an app can provide anything — an Express
        // `req`, for one, whose `headers` is a plain object with no `get()`.
        TestBed.configureTestingModule({
            providers: [
                serverPlatform,
                kbqThemeProvider({ storageKey: 'docs_theme' }),
                { provide: REQUEST, useValue: { headers: { cookie: 'docs_theme=dark' } } as unknown as Request }
            ]
        });

        const store = TestBed.inject(KbqThemeCookieStore);

        expect(() => store.getMode()).not.toThrow();
        expect(store.getMode()).toBeNull();
    });

    it('treats a cookie with a malformed escape as absent instead of throwing', () => {
        // `decodeURIComponent` throws `URIError` on these. The value under this key is not necessarily one
        // this store wrote, and on the server it arrives straight off the request — where anyone can send
        // it — so a throw here would fail the whole render.
        const store = setup({ storageKey: 'docs_theme' }, 'docs_theme=%E0%A4%A; docs_theme-static=%');

        expect(store.getMode()).toBeNull();
        expect(store.getStaticTheme()).toBeNull();
    });

    it('persists and restores the static theme name via a cookie, under a key derived from storageKey', () => {
        const store = setup();

        expect(store.getStaticTheme()).toBeNull();

        store.setStaticTheme('acme-dark');

        expect(store.getStaticTheme()).toBe('acme-dark');
        expect(document.cookie).toContain('kbq-theme-mode-static=acme-dark');
    });

    it('clears the persisted static theme when setStaticTheme is called with null, by writing an empty value', () => {
        const store = setup();

        store.setStaticTheme('acme-dark');
        store.setStaticTheme(null);

        expect(store.getStaticTheme()).toBeNull();
        // Empty, not absent — same reasoning as `KbqThemeLocalStorageStore`, and lets this go through the
        // same `writeCookie()` path (and its skip-if-unchanged check) as every other value.
        expect(document.cookie.split('; ')).toContain('kbq-theme-mode-static=');
    });

    it('skips writing the cookie again when the value is unchanged, so its expiry is not reset', () => {
        const store = setup();

        store.setMode('dark');

        const cookieSetter = jest.spyOn(document, 'cookie', 'set');

        store.setMode('dark');

        expect(cookieSetter).not.toHaveBeenCalled();

        store.setMode('light');

        expect(cookieSetter).toHaveBeenCalledWith(expect.stringContaining('kbq-theme-mode=light'));
    });
});

describe('kbqThemeProvider', () => {
    it('merges a partial config with defaults, so omitted properties keep their default value', () => {
        TestBed.configureTestingModule({
            providers: [kbqThemeProvider({ mode: 'dark' })]
        });

        const config = TestBed.inject(KBQ_THEME_CONFIG);

        expect(config.mode).toBe('dark');
        expect(config.theme).toBeNull();
        expect(config.storageKey).toBe('kbq-theme-mode');
    });
});
