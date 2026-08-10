import { DOCUMENT } from '@angular/common';
import {
    computed,
    DestroyRef,
    effect,
    inject,
    Injectable,
    InjectionToken,
    Provider,
    Renderer2,
    RendererFactory2,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';

/**
 * Light/dark polarity of a `KbqTheme`, independent of how many themes are registered or what they're named.
 * Drives `'auto'` resolution and is the strictly-typed value to reach for when something (e.g. CSS
 * `light-dark()`) needs to know which of the two a theme is, regardless of its `name`.
 */
export type KbqThemeColorScheme = 'light' | 'dark';

/** A theme registered with `KbqThemeService`. */
export interface KbqTheme {
    /** Unique name used to select the theme via `setMode()`. */
    name: string;
    /** CSS class applied to the document body when this theme is active. */
    className: string;
    /** This theme's light/dark polarity. Several themes may share the same one (e.g. two dark themes). */
    colorScheme: KbqThemeColorScheme;
    /**
     * @deprecated Selection state is now owned by `KbqThemeService` — read `currentTheme()` or `mode()` instead.
     * Kept in sync by the service for backward compatibility.
     */
    selected?: boolean;
}

/**
 * Value accepted by `setMode()`/returned by `mode()`. `'auto'` follows the OS color scheme; `'light'`/`'dark'`
 * select the built-in themes. Any other registered theme's `name` also works — see `KbqThemeColorScheme`
 * for the value that's actually restricted to 2 options.
 */
export type KbqThemeMode = 'auto' | 'light' | 'dark';

/** `string`, but keeps `KbqThemeMode`'s literals suggested in editors instead of collapsing to plain `string`. */
export type KbqThemeName = string & {};

/**
 * Enum representing the available themes for the Koobiq design system.
 * This enum is used to manage and switch between different visual themes.
 */
export enum KbqThemeSelector {
    /**
     * Represents the default light theme.
     * This is the standard theme applied
     * when the application is first loaded if nothing else provided
     */
    Default = 'kbq-light',
    /**
     * This theme is used to provide a darker visual experience, often preferred in low-light environments.
     */
    Dark = 'kbq-dark'
}

/** @docs-private */
export const KbqDefaultThemes: KbqTheme[] = [
    { name: 'light', className: KbqThemeSelector.Default, colorScheme: 'light' },
    { name: 'dark', className: KbqThemeSelector.Dark, colorScheme: 'dark' }
];

/** Configuration accepted by `KBQ_THEME_CONFIG` / `kbqThemeProvider()`. */
export interface KbqThemeConfig<T extends KbqTheme = KbqTheme> {
    /** Themes available to the service. @default KbqDefaultThemes */
    themes?: T[];
    /** Initial mode, used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default 'auto' */
    mode?: KbqThemeMode;
    /** `localStorage` key used to persist the selected mode. @default 'kbq-theme-mode' */
    storageKey: string;
    /** Theme `name` that `'auto'` resolves to when the OS prefers a light color scheme. @default 'light' */
    autoLight?: string;
    /** Theme `name` that `'auto'` resolves to when the OS prefers a dark color scheme. @default 'dark' */
    autoDark?: string;
}

const KBQ_THEME_DEFAULT_CONFIG: Required<KbqThemeConfig> = {
    themes: KbqDefaultThemes,
    mode: 'auto',
    storageKey: 'kbq-theme-mode',
    autoLight: 'light',
    autoDark: 'dark'
};

export const KBQ_THEME_CONFIG = new InjectionToken<KbqThemeConfig>('KBQ_THEME_CONFIG', {
    providedIn: 'root',
    factory: () => KBQ_THEME_DEFAULT_CONFIG
});

/**
 * Configures `KbqThemeService` — registers custom themes, sets the initial mode, and how it's applied to the DOM.
 * Only the properties you pass are overridden; anything omitted keeps its `KBQ_THEME_DEFAULT_CONFIG` value.
 */
export const kbqThemeProvider = (config: KbqThemeConfig): Provider => ({
    provide: KBQ_THEME_CONFIG,
    useValue: { ...KBQ_THEME_DEFAULT_CONFIG, ...config }
});

/**
 * Strategy used by `KbqThemeService` to persist and restore the selected theme mode.
 *
 * Provide a custom implementation through the `KBQ_THEME_STORE` token to change where the mode is stored
 * (e.g. `sessionStorage`, a backend), or to disable persistence entirely.
 */
export interface KbqThemeStore {
    /** Returns the previously saved mode, or `null` when nothing is stored/available. */
    getMode(): KbqThemeMode | KbqThemeName | null;
    /** Persists the mode. */
    setMode(mode: KbqThemeMode | KbqThemeName): void;
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

    getMode(): KbqThemeMode | KbqThemeName | null {
        try {
            return this.window.localStorage.getItem(this.storageKey);
        } catch {
            // No-op on the server, or wherever `localStorage` is unavailable/throws (private mode, sandboxed iframes).
            return null;
        }
    }

    setMode(mode: KbqThemeMode | KbqThemeName): void {
        try {
            this.window.localStorage.setItem(this.storageKey, mode);
        } catch {
            // Ignore storage write failures (server-side, quota exceeded, disabled/blocked storage, etc.).
        }
    }
}

/**
 * `KbqThemeStore` implementation backed by a cookie, for apps that render with **live** Angular SSR
 * (`@angular/ssr` or similar, one render per request) rather than a build-time prerendered/static site.
 *
 * Unlike `localStorage`, a cookie travels with the HTTP request, so a live server-side render can read
 * `DOCUMENT.cookie` and apply the right theme class before the response is ever sent — avoiding the
 * flash of the wrong theme that a client-only store cannot prevent, since it can't be read until the
 * client's JavaScript runs. This only helps if the app's SSR bootstrap populates `DOCUMENT.cookie` from
 * the incoming request's `Cookie` header; that wiring is the app's responsibility, not this library's.
 *
 * Not useful for a statically prerendered site (no live request to read a cookie from) — use the
 * default `KbqThemeLocalStorageStore` there, optionally paired with a small inline script in `index.html`
 * that applies the stored preference before first paint.
 */
@Injectable({ providedIn: 'root' })
export class KbqThemeCookieStore implements KbqThemeStore {
    private readonly document = inject(DOCUMENT);
    private readonly storageKey = inject(KBQ_THEME_CONFIG).storageKey;

    getMode(): KbqThemeMode | KbqThemeName | null {
        const prefix = `${this.storageKey}=`;
        const cookie = this.document.cookie.split('; ').find((entry) => entry.startsWith(prefix));

        return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
    }

    setMode(mode: KbqThemeMode | KbqThemeName): void {
        // 1 year: matches the lifetime a persisted UI preference is expected to have. SameSite=Lax is
        // sent on the top-level navigation request that SSR needs it for, while still blocking
        // cross-site reads.
        this.document.cookie = `${this.storageKey}=${encodeURIComponent(mode)}; path=/; max-age=31536000; SameSite=Lax`;
    }
}

/**
 * Injection token for the store used to persist the selected theme mode.
 * Defaults to a `localStorage`-backed implementation (`KbqThemeLocalStorageStore`).
 */
export const KBQ_THEME_STORE = new InjectionToken<KbqThemeStore>('KBQ_THEME_STORE', {
    providedIn: 'root',
    factory: () => inject(KbqThemeLocalStorageStore)
});

/**
 * Manages the active Koobiq theme: resolves `auto` mode from the OS color scheme, applies the active theme's
 * class to the document body, and persists the selected mode via `KBQ_THEME_STORE`.
 *
 * @example
 * ```ts
 * providers: [kbqThemeProvider({ themes: myThemes, mode: 'dark' })]
 * ```
 */
@Injectable({ providedIn: 'root' })
export class KbqThemeService<T extends KbqTheme = KbqTheme> {
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly store = inject(KBQ_THEME_STORE);
    private readonly destroyRef = inject(DestroyRef);
    private readonly config: Required<KbqThemeConfig<T>> = {
        ...KBQ_THEME_DEFAULT_CONFIG,
        ...inject(KBQ_THEME_CONFIG)
    } as Required<KbqThemeConfig<T>>;

    private readonly renderer: Renderer2;
    private readonly media = this.window.matchMedia('(prefers-color-scheme: dark)');
    private readonly systemPrefersDark = signal(this.media.matches);

    /** Themes available to select from. Replace via `setThemes()` to register a fully custom set. */
    readonly themes = signal<T[]>(this.config.themes);

    private readonly initialMode = this.store.getMode() ?? this.config.mode;

    /** Whether the theme follows the OS color scheme instead of `theme()`. */
    readonly auto = signal<boolean>(this.initialMode === 'auto');

    /** Last explicitly selected theme name. Kept even while `auto()` is on, so turning it off restores it. */
    readonly theme = signal<KbqThemeName>(this.initialMode === 'auto' ? this.config.autoLight : this.initialMode);

    /** `'auto'` when `auto()` is on, otherwise `theme()`. A simpler view for a plain 3-way (auto/light/dark) UI. */
    readonly mode = computed<KbqThemeMode | KbqThemeName>(() => (this.auto() ? 'auto' : this.theme()));

    /** `mode()` resolved to a concrete theme name — never `'auto'`. Uses `autoLight`/`autoDark` from `KBQ_THEME_CONFIG`. */
    readonly resolvedMode = computed<KbqThemeName>(() =>
        this.auto() ? (this.systemPrefersDark() ? this.config.autoDark : this.config.autoLight) : this.theme()
    );

    /** The theme object currently applied to the document, or `null` if `resolvedMode()` matches no registered theme. */
    readonly currentTheme = computed<T | null>(() => {
        const resolvedMode = this.resolvedMode();

        return this.themes().find((theme) => theme.name === resolvedMode) ?? null;
    });

    /**
     * Light/dark polarity of `currentTheme()`. Falls back to the OS preference when `resolvedMode()`
     * matches no registered theme, so this is always `'light'`/`'dark'` — never `null`.
     */
    readonly colorScheme = computed<KbqThemeColorScheme>(
        () => this.currentTheme()?.colorScheme ?? (this.systemPrefersDark() ? 'dark' : 'light')
    );

    /**
     * @deprecated read `currentTheme()` instead. Kept in sync for backward compatibility.
     */
    readonly current = new BehaviorSubject<T | null>(null);

    constructor() {
        this.renderer = inject(RendererFactory2).createRenderer(null, null);

        fromEvent<MediaQueryListEvent>(this.media, 'change')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => this.systemPrefersDark.set(event.matches));

        effect(() => {
            const currentTheme = this.currentTheme();

            this.applyTheme(currentTheme, this.themes());
            this.current.next(currentTheme);
        });
        effect(() => this.store.setMode(this.mode()));
    }

    /** Registers a custom set of themes. */
    setThemes(items: T[]) {
        this.themes.set(items);
    }

    /** Selects a mode by theme `name`, or `'auto'` to follow the OS color scheme. */
    setMode(mode: KbqThemeMode | KbqThemeName) {
        if (mode === 'auto') {
            this.auto.set(true);

            return;
        }

        this.auto.set(false);
        this.theme.set(mode);
    }

    /** Turns following the OS color scheme on or off. Turning it off restores the last selected `theme()`. */
    setAuto(auto = true) {
        this.auto.set(auto);
    }

    /**
     * Switches between `autoLight`/`autoDark` (`light`/`dark` by default), based on `colorScheme()` — the
     * current theme's actual polarity, not its name. Unlike comparing `resolvedMode()` against `autoDark`,
     * this also does the right thing when `currentTheme()` is some other, directly-selected theme.
     */
    toggle() {
        this.setMode(this.colorScheme() === 'dark' ? this.config.autoLight : this.config.autoDark);
    }

    /** @deprecated use `setMode()` with a theme `name` instead. */
    setTheme(value: T | number) {
        if (typeof value === 'number') {
            const theme = this.themes()[value];

            if (theme) this.setMode(theme.name);
        } else if (typeof value === 'object' && value !== null && this.themes().includes(value)) {
            this.setMode(value.name);
        } else {
            throw Error(`value has unsupported type: ${typeof value}`);
        }
    }

    /** @deprecated read `currentTheme()` instead. */
    getTheme(): T | null {
        return this.currentTheme();
    }

    private applyTheme(current: T | null, themes: T[]) {
        for (const theme of themes) {
            const isActive = theme === current;

            // deprecated back-compat sync, remove together with `KbqTheme.selected`
            theme.selected = isActive;

            if (isActive) {
                this.renderer.addClass(this.document.body, theme.className);
            } else {
                this.renderer.removeClass(this.document.body, theme.className);
            }
        }
    }
}

/** @deprecated use `KbqThemeService` instead. Will be removed in a future major version. */
export type ThemeService<T extends KbqTheme = KbqTheme> = KbqThemeService<T>;
/** @deprecated use `KbqThemeService` instead. Will be removed in a future major version. */
export const ThemeService = KbqThemeService;
