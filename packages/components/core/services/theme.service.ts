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
    signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';

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

/** CSS class names for `KbqDefaultThemes`, the built-in light/dark theme set. */
export enum KbqThemeSelector {
    /** Class for the built-in light theme. */
    Default = 'kbq-light',
    /** Class for the built-in dark theme. */
    Dark = 'kbq-dark'
}

/** Theme names for `KbqDefaultThemes`, the built-in light/dark theme set. */
export enum KbqThemeNames {
    /** Name for the built-in light theme. */
    Default = 'light',
    /** Name for the built-in dark theme. */
    Dark = 'dark'
}

/** The built-in light/dark theme set — `KBQ_THEME_CONFIG`'s default `themes`. @docs-private */
export const KbqDefaultThemes: KbqThemeConfig[] = [
    { name: KbqThemeNames.Default, className: KbqThemeSelector.Default, colorScheme: 'light' },
    { name: KbqThemeNames.Dark, className: KbqThemeSelector.Dark, colorScheme: 'dark' }
];

/** Settings accepted by `KBQ_THEME_CONFIG` / `kbqThemeProvider()`. */
export interface KbqThemeSettings<T extends KbqThemeConfig = KbqThemeConfig> {
    /** Themes available to the service. @default KbqDefaultThemes */
    themes: T[];
    /** Initial mode, used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default 'auto' */
    mode: KbqThemeMode;
    /** Key used to persist the selection — a `localStorage` key or cookie name, depending on `KBQ_THEME_STORE`. @default 'kbq-theme-mode' */
    storageKey: string;
}

const KBQ_THEME_DEFAULT_SETTINGS: KbqThemeSettings = {
    themes: KbqDefaultThemes,
    mode: 'auto',
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
    /** Returns the previously saved mode, or `null` when nothing is stored/available. */
    getMode(): KbqThemeMode | null;
    /** Persists the mode. */
    setMode(mode: KbqThemeMode): void;
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
    private readonly storageKey = inject(KBQ_THEME_CONFIG).storageKey;

    getMode(): KbqThemeMode | null {
        const prefix = `${this.storageKey}=`;
        const cookie = this.document.cookie.split('; ').find((entry) => entry.startsWith(prefix));

        return cookie ? (decodeURIComponent(cookie.slice(prefix.length)) as KbqThemeMode) : null;
    }

    setMode(mode: KbqThemeMode): void {
        // 1 year: matches the lifetime a persisted UI preference is expected to have. SameSite=Lax is
        // sent on the top-level navigation request that SSR needs it for, while still blocking
        // cross-site reads.
        this.document.cookie = `${this.storageKey}=${encodeURIComponent(mode)}; path=/; max-age=31536000; SameSite=Lax`;
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
    private readonly config: KbqThemeSettings<T> = {
        ...KBQ_THEME_DEFAULT_SETTINGS,
        ...inject(KBQ_THEME_CONFIG)
    } as KbqThemeSettings<T>;

    private readonly renderer: Renderer2;
    private readonly media = this.window.matchMedia('(prefers-color-scheme: dark)');
    private readonly systemPrefersDark = signal(this.media.matches);

    /** Themes available to select from. Replace via `setThemes()` to register a fully custom set. */
    readonly themes = signal<T[]>(this.config.themes);

    /** Selected fixed `'light'`/`'dark'` mode, or `'auto'` to follow the OS color scheme. */
    readonly mode = signal<KbqThemeMode>(this.readInitialMode());

    /** `mode()` resolved to a concrete `'light'`/`'dark'` target — never `'auto'`. */
    private readonly resolvedMode = computed<KbqThemeColorScheme>(() => {
        const mode = this.mode();

        return mode === 'auto' ? (this.systemPrefersDark() ? 'dark' : 'light') : mode;
    });

    /** The theme whose `colorScheme` matches `resolvedMode()`, or `null` if none is registered for it. */
    readonly currentTheme = computed<T | null>(
        () => this.themes().find((theme) => theme.colorScheme === this.resolvedMode()) ?? null
    );

    /** `currentTheme()`'s polarity, falling back to `resolvedMode()` if nothing matched. */
    readonly colorScheme = computed<KbqThemeColorScheme>(() => this.currentTheme()?.colorScheme ?? this.resolvedMode());

    constructor() {
        this.renderer = inject(RendererFactory2).createRenderer(null, null);

        fromEvent<MediaQueryListEvent>(this.media, 'change')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => this.systemPrefersDark.set(event.matches));

        effect(() => this.applyTheme(this.currentTheme(), this.themes()));
        effect(() => this.store.setMode(this.mode()));
    }

    /** Switches between `'light'`/`'dark'`, based on `colorScheme()` — the current theme's actual polarity. */
    toggle() {
        this.mode.set(this.colorScheme() === 'dark' ? 'light' : 'dark');
    }

    private readInitialMode(): KbqThemeMode {
        const stored = this.store.getMode();

        return stored === 'auto' || stored === 'light' || stored === 'dark' ? stored : this.config.mode;
    }

    private applyTheme(current: T | null, themes: T[]) {
        for (const theme of themes) {
            if (theme === current) {
                this.renderer.addClass(this.document.body, theme.className);
            } else {
                this.renderer.removeClass(this.document.body, theme.className);
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
        this.kbqThemeService.themes.set(items);
    }

    /** @deprecated use `setMode()` on the injected `KbqThemeService` instead. */
    setTheme(value: T | number) {
        const theme = typeof value === 'number' ? this.themes[value] : value;

        if (theme && this.themes.includes(theme)) {
            this.kbqThemeService.mode.set(theme.colorScheme ?? 'light');
        } else {
            throw Error(`value has unsupported type: ${typeof value}`);
        }
    }

    /** @deprecated read `currentTheme()` on the injected `KbqThemeService` instead. */
    getTheme(): T | null {
        return this.current.value;
    }
}
