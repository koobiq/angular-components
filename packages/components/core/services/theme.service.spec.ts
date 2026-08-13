import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '../tokens/window';
import {
    KBQ_DEFAULT_THEMES,
    KBQ_THEME_CONFIG,
    KBQ_THEME_STORE,
    KbqThemeCookieStore,
    KbqThemeLocalStorageStore,
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

describe('KbqThemeService', () => {
    let store: jest.Mocked<KbqThemeStore>;

    function setup(matches = false) {
        const media = fakeMediaQueryList(matches);

        store = {
            getMode: jest.fn().mockReturnValue(null),
            setMode: jest.fn(),
            getStaticTheme: jest.fn().mockReturnValue(null),
            setStaticTheme: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        return { service, media };
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

    it('follows OS color scheme changes while in auto mode', () => {
        const { service, media } = setup(false);

        expect(service.currentTheme()?.name).toBe('light');

        media.emit(true);
        TestBed.tick();

        expect(service.currentTheme()?.name).toBe('dark');
        expect(document.body.classList.contains('kbq-dark')).toBe(true);
        expect(document.body.classList.contains('kbq-light')).toBe(false);
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
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
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
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
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
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
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
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.staticTheme()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('falls back to config.theme when nothing is persisted yet', () => {
        const media = fakeMediaQueryList(false);

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
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
            providers: [{ provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } }]
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
    function setup(config: { storageKey?: string } = {}, windowOverrides: Partial<Window> = {}) {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, ...windowOverrides } },
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
});

describe('KbqThemeCookieStore', () => {
    function setup(config: { storageKey?: string } = {}) {
        TestBed.configureTestingModule({
            providers: [kbqThemeProvider(config)]
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
