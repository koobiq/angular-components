import { DOCUMENT } from '@angular/common';
import {
    computed,
    DestroyRef,
    effect,
    inject,
    Injectable,
    InjectionToken,
    OnDestroy,
    Provider,
    Renderer2,
    RendererFactory2,
    REQUEST,
    signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, filter, fromEvent, map, Observable, Subscription } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';

/** Media query behind `KbqThemeService.mode`'s `'auto'` resolution. */
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Light/dark polarity of a `KbqThemeConfig`. Drives `mode()` resolution and is the strictly-typed value
 * to reach for when something (e.g. CSS `light-dark()`) needs to know which of the two is active.
 */
export type KbqThemeColorScheme = 'light' | 'dark';

/** Selection understood by `KbqThemeService`. The only way to select a theme — see `setMode()`. */
export type KbqThemeMode = 'auto' | KbqThemeColorScheme;

/**
 * @deprecated will be removed in a future major version — use `KbqThemeConfig` instead, which adds the
 * `colorScheme` this interface can no longer carry without a breaking change to existing consumers.
 */
export interface KbqTheme {
    name: string;
    /** CSS class applied to the document body when this theme is active. */
    className: string;
    /**
     * @deprecated Selection state is now owned by `KbqThemeService` — read `currentTheme()`/`mode()` instead.
     * Kept in sync by the deprecated `ThemeService` facade for backward compatibility.
     */
    selected?: boolean;
    colorScheme?: KbqThemeColorScheme;
}

/** A theme registered with `KbqThemeService`, resolved by `mode()` via its required `colorScheme`. */
export interface KbqThemeConfig {
    name: string;
    /** CSS class applied to the document body when this theme is active. */
    className: string;
    colorScheme: KbqThemeColorScheme;
}

/** CSS class names for `KBQ_DEFAULT_THEMES`, the built-in light/dark theme set. */
export enum KbqThemeSelector {
    /** Class for the built-in light theme. */
    Light = 'kbq-light',
    /** @deprecated use `Light` instead. Will be removed in a next major version. */
    Default = 'kbq-light',
    /** Class for the built-in dark theme. */
    Dark = 'kbq-dark'
}

/** Theme names for `KBQ_DEFAULT_THEMES`, the built-in light/dark theme set. */
export enum KbqThemeNames {
    /** Name for the built-in light theme. */
    Light = 'light',
    /** @deprecated use `Light` instead. Will be removed in a next major version. */
    Default = 'light',
    /** Name for the built-in dark theme. */
    Dark = 'dark'
}

/** The built-in light/dark theme set — `KBQ_THEME_CONFIG`'s default `themes`. @docs-private */
export const KBQ_DEFAULT_THEMES: KbqThemeConfig[] = [
    { name: KbqThemeNames.Light, className: KbqThemeSelector.Light, colorScheme: 'light' },
    { name: KbqThemeNames.Dark, className: KbqThemeSelector.Dark, colorScheme: 'dark' }
];

/** @deprecated use `KBQ_DEFAULT_THEMES` instead. Will be removed in a next major version. */
export const KbqDefaultThemes = KBQ_DEFAULT_THEMES;

/** Settings accepted by `KBQ_THEME_CONFIG` / `kbqThemeProvider()`. */
export interface KbqThemeSettings<T extends KbqThemeConfig = KbqThemeConfig> {
    /** Themes available to the service. @default KBQ_DEFAULT_THEMES */
    themes: T[];
    /** Initial mode, used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default 'auto' */
    mode: KbqThemeMode;
    /**
     * Name of the theme pinned initially, overriding `mode` resolution — see `KbqThemeService.staticTheme`.
     * Used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default null
     */
    theme: string | null;
    /** Key used to persist the selection — a `localStorage` key or cookie name, depending on `KBQ_THEME_STORE`. @default 'kbq-theme-mode' */
    storageKey: string;
}

const KBQ_THEME_DEFAULT_SETTINGS: KbqThemeSettings = {
    themes: KBQ_DEFAULT_THEMES,
    mode: 'auto',
    theme: null,
    storageKey: 'kbq-theme-mode'
};

/** Injection token for `KbqThemeService`'s settings. Configure via `kbqThemeProvider()`, not this directly. */
export const KBQ_THEME_CONFIG = new InjectionToken<KbqThemeSettings>('KBQ_THEME_CONFIG', {
    providedIn: 'root',
    factory: () => KBQ_THEME_DEFAULT_SETTINGS
});

/**
 * Configures `KbqThemeService` — registers custom themes, sets the initial mode, and how it's persisted.
 * Only the properties you pass are overridden; anything omitted keeps its `KBQ_THEME_DEFAULT_SETTINGS` value.
 */
export const kbqThemeProvider = <T extends KbqThemeConfig = KbqThemeConfig>(
    config: Partial<KbqThemeSettings<T>>
): Provider => ({
    provide: KBQ_THEME_CONFIG,
    useValue: { ...KBQ_THEME_DEFAULT_SETTINGS, ...config }
});

/**
 * Strategy used by `KbqThemeService` to persist and restore `mode()`.
 *
 * Provide a custom implementation through the `KBQ_THEME_STORE` token to change where it's stored
 * (e.g. `sessionStorage`, a backend), or to disable persistence entirely.
 */
export interface KbqThemeStore {
    /**
     * Returns the previously saved mode, or `null` when nothing is stored/available. Raw value only —
     * applying `KbqThemeSettings.mode` as the default for a `null`/invalid result is the caller's job
     * (see `KbqThemeService`'s `readMode()`), not this method's.
     */
    getMode(): KbqThemeMode | null;
    /** Persists the mode. */
    setMode(mode: KbqThemeMode): void;
    /**
     * Returns the previously saved static theme name, or `null` when nothing is available.
     * Raw value only — applying `KbqThemeSettings.theme` as the default is the caller's job, not this method's.
     */
    getStaticTheme(): string | null;
    /** Persists the static theme name, or clears it when `null`. */
    setStaticTheme(name: string | null): void;
    /**
     * Optional. Emits whenever the stored values change outside this instance — the same app open in
     * another tab, most commonly. `KbqThemeService` re-reads the store on every emission, so a theme
     * switched in one tab reaches the others. Leave it out when the storage has no way to report that.
     */
    changes?: Observable<void>;
}

/**
 * Default `KbqThemeStore` implementation backed by `localStorage`.
 *
 * All access is guarded so it is safe on the server (SSR) and in environments where storage throws on access
 * (private mode, sandboxed iframes). The storage key is configured via `KBQ_THEME_CONFIG.storageKey`
 * (see `kbqThemeProvider()`).
 */
@Injectable({ providedIn: 'root' })
export class KbqThemeLocalStorageStore implements KbqThemeStore {
    private readonly window = inject(KBQ_WINDOW);
    private readonly storageKey = inject(KBQ_THEME_CONFIG).storageKey;
    private readonly staticThemeStorageKey = `${this.storageKey}-static`;

    /**
     * `storage` fires only in the *other* documents of the same origin, never in the one that wrote the
     * value, so this reports exactly the external changes `KbqThemeStore.changes` is meant to report,
     * with no echo of this instance's own writes. `EMPTY` where listeners can't be registered at all —
     * a server-side `KBQ_WINDOW` stub, where there are no other tabs to hear from anyway.
     */
    readonly changes: Observable<void> =
        typeof this.window.addEventListener === 'function'
            ? fromEvent<StorageEvent>(this.window, 'storage').pipe(
                  // `key === null` is `localStorage.clear()` — every key at once, this store's included.
                  filter(({ key }) => key === null || key === this.storageKey || key === this.staticThemeStorageKey),
                  map(() => undefined)
              )
            : EMPTY;

    getMode(): KbqThemeMode | null {
        try {
            return this.window.localStorage.getItem(this.storageKey) as KbqThemeMode | null;
        } catch {
            // No-op on the server, or wherever `localStorage` is unavailable/throws (private mode, sandboxed iframes).
            return null;
        }
    }

    setMode(mode: KbqThemeMode): void {
        try {
            this.window.localStorage.setItem(this.storageKey, mode);
        } catch {
            // Ignore storage write failures (server-side, quota exceeded, disabled/blocked storage, etc.).
        }
    }

    getStaticTheme(): string | null {
        try {
            // `|| null`: an empty string means "cleared" (see `setStaticTheme()`) — never a real theme name.
            return this.window.localStorage.getItem(this.staticThemeStorageKey) || null;
        } catch {
            return null;
        }
    }

    setStaticTheme(name: string | null): void {
        try {
            // Not `setItem(key, null)` — `localStorage` coerces the value to the string `"null"`, which would
            // then read back as if it were a real theme name. An empty string is unambiguous, since no theme
            // has an empty `name`, and `getStaticTheme()` treats it the same as an absent key.
            this.window.localStorage.setItem(this.staticThemeStorageKey, name ?? '');
        } catch {
            // Ignore storage write failures (server-side, quota exceeded, disabled/blocked storage, etc.).
        }
    }
}

/**
 * `KbqThemeStore` implementation backed by a cookie, for apps with **live** Angular SSR — a cookie travels
 * with the request, so the server can read it and render the right theme immediately, unlike `localStorage`.
 * Requires the app's SSR bootstrap to populate `DOCUMENT.cookie` from the request. Not useful for a
 * statically prerendered site — use `KbqThemeLocalStorageStore` there instead.
 */
@Injectable({ providedIn: 'root' })
export class KbqThemeCookieStore implements KbqThemeStore {
    private readonly document = inject(DOCUMENT);
    /**
     * The incoming request during a server render, `null` in the browser. `DOCUMENT.cookie` is empty on the
     * server unless the app populates it itself, so reading the request's own `Cookie` header is what makes
     * this store work there without that extra wiring.
     */
    private readonly request = inject(REQUEST, { optional: true });
    private readonly storageKey = inject(KBQ_THEME_CONFIG).storageKey;
    private readonly staticThemeStorageKey = `${this.storageKey}-static`;

    getMode(): KbqThemeMode | null {
        return this.readCookie(this.storageKey) as KbqThemeMode | null;
    }

    setMode(mode: KbqThemeMode): void {
        this.writeCookie(this.storageKey, mode);
    }

    getStaticTheme(): string | null {
        // `|| null`: an empty string means "cleared" (see `setStaticTheme()`) — never a real theme name.
        return this.readCookie(this.staticThemeStorageKey) || null;
    }

    setStaticTheme(name: string | null): void {
        // An empty string is unambiguous, since no theme has an empty `name` — same reasoning as
        // `KbqThemeLocalStorageStore`. Goes through the same `writeCookie()` as every other value, so it
        // gets the same skip-if-unchanged behavior instead of needing a separate expiry branch.
        this.writeCookie(this.staticThemeStorageKey, name ?? '');
    }

    private readCookie(key: string): string | null {
        // `DOCUMENT.cookie` first: in the browser it is the only source reflecting writes made since the
        // page loaded, and on the server it lets an app that already populates it keep that value.
        return (
            this.parseCookie(this.documentCookies(), key) ??
            this.parseCookie(this.request?.headers.get('cookie') ?? '', key)
        );
    }

    /**
     * The server's DOM implementation (domino, bundled into `@angular/platform-server`) declares
     * `document.cookie` as "not yet implemented" — reading it throws rather than returning an empty
     * string, which would take the whole server render down. The request's `Cookie` header is the
     * server-side source anyway, so there is nothing to recover here beyond not throwing.
     */
    private documentCookies(): string {
        try {
            return this.document.cookie;
        } catch {
            return '';
        }
    }

    private parseCookie(cookies: string, key: string): string | null {
        const prefix = `${key}=`;
        const cookie = cookies
            .split(';')
            .map((entry) => entry.trim())
            .find((entry) => entry.startsWith(prefix));

        if (!cookie) return null;

        try {
            return decodeURIComponent(cookie.slice(prefix.length));
        } catch {
            // `decodeURIComponent` throws `URIError` on a malformed escape. This store's own values always
            // go through `encodeURIComponent`, but the cookie under this key need not be one it wrote — and
            // on the server it comes straight off the request, where anyone can send `key=%`. Letting the
            // throw out would take the whole render down over a foreign cookie, so treat it as absent.
            return null;
        }
    }

    private writeCookie(key: string, value: string): void {
        // Skip the write when unchanged, so an identical value never silently resets the cookie's expiry:
        // `KbqThemeService.setMode()` clears the pinned theme on every call, persisting `null` even when
        // nothing was pinned, and selecting the mode that is already active is an ordinary thing to do.
        if (this.readCookie(key) === value) return;

        try {
            // 1 year: matches the lifetime a persisted UI preference is expected to have. No `SameSite` —
            // this only ever writes its own theme cookie by exact key, so it has no cross-site write to
            // guard against; leave whatever policy the app's other cookies use untouched.
            this.document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
        } catch {
            // Throws on the server for the same reason reading does (see `documentCookies()`). Nothing to
            // persist there: the selection a server render sees came in with the request already.
        }
    }
}

/**
 * Injection token for the store used to persist the current mode (see `KbqThemeStore`).
 * Defaults to a `localStorage`-backed implementation (`KbqThemeLocalStorageStore`).
 */
export const KBQ_THEME_STORE = new InjectionToken<KbqThemeStore>('KBQ_THEME_STORE', {
    providedIn: 'root',
    factory: () => inject(KbqThemeLocalStorageStore)
});

/**
 * Manages the active Koobiq theme: resolves `mode()` against the OS color scheme and the registered
 * `themes()`, applies the active theme's class to the document body, and persists `mode()` via
 * `KBQ_THEME_STORE`.
 *
 * @example
 * ```ts
 * providers: [kbqThemeProvider({ themes: myThemes, mode: 'dark' })]
 * ```
 */
@Injectable({ providedIn: 'root' })
export class KbqThemeService<T extends KbqThemeConfig = KbqThemeConfig> {
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly store = inject(KBQ_THEME_STORE);
    private readonly destroyRef = inject(DestroyRef);
    private readonly config = inject(KBQ_THEME_CONFIG) as KbqThemeSettings<T>;

    private readonly renderer: Renderer2;
    /**
     * Resolved once and kept, so the initial read and the change subscription can never end up watching
     * two different objects — a server-side `matchMedia` stub typically returns a fresh one per call.
     */
    private readonly media = this.matchPrefersDark();
    private readonly systemPrefersDark = signal(this.media?.matches ?? false);

    private readonly themesState = signal<T[]>(this.config.themes);
    private readonly modeState = signal<KbqThemeMode>(this.readMode());
    private readonly staticThemeState = signal<string | null>(this.readStaticTheme());

    /** Themes available to select from. Set via `setThemes()` to register a fully custom set. */
    readonly themes = this.themesState.asReadonly();
    /** Selected fixed `'light'`/`'dark'` mode, or `'auto'` to follow the OS color scheme. Set via `setMode()`. */
    readonly mode = this.modeState.asReadonly();
    /**
     * Name of a theme selected out of `themes()`,
     * overriding `mode` resolution in `currentTheme()` until
     * cleared or `setMode()`/`toggle()` is called. `null` when nothing is selected.
     */
    readonly staticTheme = this.staticThemeState.asReadonly();

    /** `mode()` resolved to a concrete `'light'`/`'dark'` target — never `'auto'`. */
    private readonly resolvedMode = computed<KbqThemeColorScheme>(() => {
        const mode = this.modeState();

        return mode === 'auto' ? (this.systemPrefersDark() ? 'dark' : 'light') : mode;
    });

    /** The static theme if `staticTheme()` is set, otherwise the theme whose `colorScheme` matches `resolvedMode()`. */
    readonly currentTheme = computed<T | null>(() => {
        const staticTheme = this.staticThemeState();

        if (staticTheme !== null) {
            return this.themesState().find((theme) => theme.name === staticTheme) ?? null;
        }

        return this.themesState().find((theme) => theme.colorScheme === this.resolvedMode()) ?? null;
    });

    /** `currentTheme()`'s polarity, falling back to `resolvedMode()` if nothing matched. */
    readonly colorScheme = computed<KbqThemeColorScheme>(() => this.currentTheme()?.colorScheme ?? this.resolvedMode());

    constructor() {
        this.renderer = inject(RendererFactory2).createRenderer(null, null);

        this.watchSystemTheme();
        this.watchStore();

        effect(() => this.applyTheme(this.currentTheme(), this.themesState()));
    }

    /** Replaces the registered theme set with a fully custom one. */
    setThemes(items: T[]) {
        this.themesState.set(items);
    }

    /**
     * Sets a fixed `'light'`/`'dark'` mode, or `'auto'` to follow the OS color scheme — clearing an active
     * static theme first, so this always hands control back to dynamic resolution.
     */
    setMode(mode: KbqThemeMode) {
        this.selectTheme(null);
        this.modeState.set(mode);
        this.store.setMode(mode);
    }

    /** Pins a theme by name out of `themes()`, or clears the pin when `name` is `null`. */
    selectTheme(name: string | null) {
        this.staticThemeState.set(name);
        this.store.setStaticTheme(name);
    }

    /** Switches between `'light'`/`'dark'`, based on `colorScheme()` — the current theme's actual polarity. */
    toggle() {
        this.setMode(this.colorScheme() === 'dark' ? 'light' : 'dark');
    }

    /** The persisted mode, or `config.mode` when nothing valid is stored. Also used to re-read the store. */
    private readMode(): KbqThemeMode {
        const stored = this.store.getMode();

        return stored === 'auto' || stored === 'light' || stored === 'dark' ? stored : this.config.mode;
    }

    /** The persisted static theme, or `config.theme`. Initialization only — see `watchStore()`. */
    private readStaticTheme(): string | null {
        return this.store.getStaticTheme() ?? this.config.theme ?? null;
    }

    /**
     * Read synchronously at construction, so `systemPrefersDark` is right before the first render — deferring
     * it to e.g. `afterNextRender` would show the wrong theme first and correct it visibly. Guarded by both
     * the `typeof` check and the try/catch: `matchMedia` is absent from the server's `KBQ_WINDOW`, and can be
     * present but throw in sandboxed iframes / under a restrictive CSP.
     */
    private matchPrefersDark(): MediaQueryList | null {
        try {
            return typeof this.window.matchMedia === 'function' ? this.window.matchMedia(PREFERS_DARK_QUERY) : null;
        } catch {
            return null;
        }
    }

    private watchSystemTheme(): void {
        const media = this.media;

        // A server-side `matchMedia` stub can return a bare object carrying `matches` and nothing else;
        // subscribing to that would throw in exactly the environment the guard above exists for.
        if (typeof media?.addEventListener !== 'function') return;

        fromEvent<MediaQueryListEvent>(media, 'change')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => this.systemPrefersDark.set(event.matches));
    }

    /**
     * Picks up a selection made outside this instance — the same app in another tab (see
     * `KbqThemeStore.changes`). Re-reads rather than trusting an event payload, so the store stays the
     * single source of truth, and writes nothing back: the tab that made the change already persisted it.
     */
    private watchStore(): void {
        this.store.changes?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.modeState.set(this.readMode());
            // Deliberately not `readStaticTheme()`: its `config.theme` fallback applies only when nothing is
            // persisted yet. A store cannot tell a cleared pin from one that was never set — both read back
            // as `null` — so applying the fallback here would re-pin the configured theme in every other tab
            // the moment one tab clears it, which `setMode()` does on every call.
            this.staticThemeState.set(this.store.getStaticTheme());
        });
    }

    private applyTheme(current: T | null, themes: T[]) {
        // By `className`, not by theme object identity — multiple registered themes (e.g. a custom set of
        // names layered onto the same built-in light/dark classes) can share a `className`. Comparing by
        // object would remove a class that another, differently-named entry just added for the same reason.
        const classNames = new Set(themes.map((theme) => theme.className));

        for (const className of classNames) {
            if (className === current?.className) {
                this.renderer.addClass(this.document.body, className);
            } else {
                this.renderer.removeClass(this.document.body, className);
            }
        }
    }
}

/** @deprecated use `KbqThemeService` instead. Will be removed in a future major version. */
@Injectable({ providedIn: 'root' })
export class ThemeService<T extends KbqTheme = KbqTheme> implements OnDestroy {
    private readonly kbqThemeService = inject(KbqThemeService);

    /** @deprecated read `currentTheme()` on the injected `KbqThemeService` instead. */
    readonly current = new BehaviorSubject<T | null>(null);

    private readonly subscription: Subscription;

    constructor() {
        this.subscription = toObservable(this.kbqThemeService.currentTheme).subscribe((current) => {
            for (const theme of this.kbqThemeService.themes()) theme.selected = theme === current;

            this.current.next(current);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /** @deprecated read `themes()` on the injected `KbqThemeService` instead. */
    get themes(): T[] {
        return this.kbqThemeService.themes();
    }

    set themes(items: T[]) {
        this.kbqThemeService.setThemes(items);
    }

    /** @deprecated use `setMode()` on the injected `KbqThemeService` instead. */
    setTheme(value: T | number) {
        const theme = typeof value === 'number' ? this.themes[value] : value;

        if (theme && this.themes.includes(theme)) {
            this.kbqThemeService.setMode(theme.colorScheme ?? 'light');
        } else {
            throw Error(`value has unsupported type: ${typeof value}`);
        }
    }

    /** @deprecated read `currentTheme()` on the injected `KbqThemeService` instead. */
    getTheme(): T | null {
        return this.current.value;
    }
}
