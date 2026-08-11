import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '../tokens/window';
import {
    KBQ_THEME_CONFIG,
    KBQ_THEME_STORE,
    KbqDefaultThemes,
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

        store = { getSelection: jest.fn().mockReturnValue(null), setSelection: jest.fn() };

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

        expect(service.selection()).toBe('auto');
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

    it('selectTheme/setAuto select a fixed theme or fall back to the OS preference', () => {
        const { service } = setup(true);

        service.selectTheme('light');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('light');

        service.selectTheme('dark');
        TestBed.tick();
        expect(service.currentTheme()?.name).toBe('dark');

        service.setAuto();
        TestBed.tick();
        expect(service.selection()).toBe('auto');
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

    it('supports registering a fully custom set of themes', () => {
        const { service } = setup(false);

        service.setThemes([{ name: 'solarized', className: 'kbq-solarized', colorScheme: 'dark' }]);
        service.selectTheme('solarized');
        TestBed.tick();

        expect(service.currentTheme()?.className).toBe('kbq-solarized');
        expect(document.body.classList.contains('kbq-solarized')).toBe(true);
    });

    it("exposes colorScheme as the current theme's own polarity, independent of its name", () => {
        const { service } = setup(false);

        service.setThemes([{ name: 'solarized', className: 'kbq-solarized', colorScheme: 'dark' }]);
        service.selectTheme('solarized');
        TestBed.tick();

        expect(service.colorScheme()).toBe('dark');
    });

    it("toggle uses the current theme's colorScheme, not a name comparison against autoDark", () => {
        const { service } = setup(false);

        // A directly-selected theme whose name matches neither 'light'/'dark' nor autoLight/autoDark -
        // comparing resolvedMode() to autoDark (the old implementation) would always toggle to 'dark'
        // here, regardless of this theme's actual polarity.
        service.setThemes([
            ...service.themes(),
            { name: 'solarized', className: 'kbq-solarized', colorScheme: 'dark' }
        ]);
        service.selectTheme('solarized');
        TestBed.tick();

        service.toggle();
        TestBed.tick();

        expect(service.selection()).toBe('light');
        expect(service.currentTheme()?.name).toBe('light');
    });

    it('resolves auto mode against custom theme names via autoLight/autoDark', () => {
        const media = fakeMediaQueryList(true);

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
                {
                    provide: KBQ_THEME_CONFIG,
                    useValue: {
                        themes: [
                            { name: 'sunrise', className: 'kbq-sunrise', colorScheme: 'light' },
                            { name: 'midnight', className: 'kbq-midnight', colorScheme: 'dark' }
                        ],
                        autoLight: 'sunrise',
                        autoDark: 'midnight'
                    }
                },
                { provide: KBQ_THEME_STORE, useValue: { getSelection: () => null, setSelection: () => {} } }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.selection()).toBe('auto');
        expect(service.currentTheme()?.name).toBe('midnight');
        expect(document.body.classList.contains('kbq-midnight')).toBe(true);

        service.toggle();
        TestBed.tick();

        expect(service.selection()).not.toBe('auto');
        expect(service.currentTheme()?.name).toBe('sunrise');
        expect(document.body.classList.contains('kbq-sunrise')).toBe(true);
    });

    it('persists the selected mode via KBQ_THEME_STORE', () => {
        const { service } = setup(false);

        service.selectTheme('dark');
        TestBed.tick();

        expect(store.setSelection).toHaveBeenCalledWith('dark');
    });

    it('restores the mode persisted in KBQ_THEME_STORE on init', () => {
        const media = fakeMediaQueryList(false);

        store = { getSelection: jest.fn().mockReturnValue('dark'), setSelection: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, matchMedia: () => media.mql } },
                { provide: KBQ_THEME_STORE, useValue: store }
            ]
        });

        const service = TestBed.inject(KbqThemeService);

        TestBed.tick();

        expect(service.selection()).toBe('dark');
        expect(service.currentTheme()?.name).toBe('dark');
    });

    it('keeps the deprecated `selected` field in sync for backward compatibility', () => {
        const { service } = setup(true);

        const themes = service.themes();

        expect(themes.find((theme) => theme.name === 'dark')?.selected).toBe(true);
        expect(themes.find((theme) => theme.name === 'light')?.selected).toBe(false);
    });

    it('exposes the deprecated `setTheme`/`getTheme` shims', () => {
        const { service } = setup(false);

        service.setTheme(1);
        TestBed.tick();
        expect(service.selection()).toBe('dark');
        expect(service.getTheme()).toBe(service.currentTheme());

        service.setTheme(KbqDefaultThemes[0]);
        TestBed.tick();
        expect(service.selection()).toBe('light');
    });

    it('exports `ThemeService` as a deprecated alias of `KbqThemeService`', () => {
        expect(ThemeService).toBe(KbqThemeService);
    });

    it('keeps the deprecated `current` BehaviorSubject in sync with `currentTheme()`', () => {
        const { service } = setup(false);

        expect(service.current.value?.name).toBe('light');

        service.selectTheme('dark');
        TestBed.tick();

        expect(service.current.value?.name).toBe('dark');
        expect(service.current.value).toBe(service.currentTheme());
    });
});

describe('KbqThemeLocalStorageStore', () => {
    function setup(config: { storageKey?: string } = {}, windowOverrides: Partial<Window> = {}) {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_WINDOW, useValue: { ...window, ...windowOverrides } },
                { provide: KBQ_THEME_CONFIG, useValue: config }
            ]
        });

        return TestBed.inject(KbqThemeLocalStorageStore);
    }

    afterEach(() => localStorage.clear());

    it('persists and restores the mode via localStorage in the browser', () => {
        const store = setup();

        expect(store.getSelection()).toBeNull();

        store.setSelection('dark');

        expect(store.getSelection()).toBe('dark');
    });

    it('is a no-op when `localStorage` is unavailable (e.g. on the server)', () => {
        // Mirrors the server-provided `KBQ_WINDOW` in apps/docs/src/config.server.ts, which has no
        // `localStorage` at all — accessing it throws, which the store must swallow.
        const store = setup({}, { localStorage: undefined });

        store.setSelection('dark');

        expect(store.getSelection()).toBeNull();
        expect(localStorage.getItem('kbq-theme-mode')).toBeNull();
    });

    it('uses the storage key configured via KBQ_THEME_CONFIG', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setSelection('dark');

        expect(localStorage.getItem('docs_theme')).toBe('dark');
        expect(localStorage.getItem('kbq-theme-mode')).toBeNull();
    });
});

describe('KbqThemeCookieStore', () => {
    function setup(config: { storageKey?: string } = {}) {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_THEME_CONFIG, useValue: { storageKey: 'kbq-theme-mode', ...config } }]
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

        expect(store.getSelection()).toBeNull();

        store.setSelection('dark');

        expect(store.getSelection()).toBe('dark');
        expect(document.cookie).toContain('kbq-theme-mode=dark');
    });

    it('uses the storage key configured via KBQ_THEME_CONFIG', () => {
        const store = setup({ storageKey: 'docs_theme' });

        store.setSelection('dark');

        expect(document.cookie).toContain('docs_theme=dark');
        expect(document.cookie).not.toContain('kbq-theme-mode=');
    });

    it('does not confuse cookies whose name is a suffix of the storage key', () => {
        document.cookie = 'other-kbq-theme-mode=dark; path=/';

        const store = setup();

        expect(store.getSelection()).toBeNull();
    });
});

describe('kbqThemeProvider', () => {
    it('merges a partial config with defaults, so omitted properties keep their default value', () => {
        TestBed.configureTestingModule({
            providers: [kbqThemeProvider({ mode: 'dark' })]
        });

        const config = TestBed.inject(KBQ_THEME_CONFIG);

        expect(config.mode).toBe('dark');
        expect(config.storageKey).toBe('kbq-theme-mode');
    });
});
