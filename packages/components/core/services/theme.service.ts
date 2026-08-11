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
    /** Unique name used to select the theme via `selectTheme()`. */
    name: KbqThemeColorScheme | KbqThemeName;
    /** CSS class applied to the document body when this theme is active. */
    className: string;
    /**
     * This theme's light/dark polarity. Several themes may share the same one (e.g. two dark themes).
     * Optional — when omitted, `colorScheme()` falls back to the OS preference instead of this theme's own value.
     */
    colorScheme?: KbqThemeColorScheme;
    /**
     * @deprecated Selection state is now owned by `KbqThemeService` — read `currentTheme()` or `selection()` instead.
     * Kept in sync by the service for backward compatibility.
     */
    selected?: boolean;
}

/**
 * What `selection()` returns and `KbqThemeStore` persists: `'auto'`, or a theme's `name`. `string`-backed,
 * but keeps `'auto'`'s literal suggested in editors instead of collapsing to plain `string`.
 */
export type KbqThemeName = 'auto' | (string & {});

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
export const KbqDefaultThemes: KbqTheme[] = [
    { name: KbqThemeNames.Default, className: KbqThemeSelector.Default, colorScheme: 'light' },
    { name: KbqThemeNames.Dark, className: KbqThemeSelector.Dark, colorScheme: 'dark' }
];

/** Configuration accepted by `KBQ_THEME_CONFIG` / `kbqThemeProvider()`. */
export interface KbqThemeConfig<T extends KbqTheme = KbqTheme> {
    /** Themes available to the service. @default KbqDefaultThemes */
    themes: T[];
    /** Initial mode, used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default 'auto' */
    mode: KbqThemeColorScheme | KbqThemeName;
    /** Key used to persist the selection — a `localStorage` key or cookie name, depending on `KBQ_THEME_STORE`. @default 'kbq-theme-mode' */
    storageKey: string;
    /** Theme `name` that `'auto'` resolves to when the OS prefers a light color scheme. @default 'light' */
    autoLight: string;
    /** Theme `name` that `'auto'` resolves to when the OS prefers a dark color scheme. @default 'dark' */
    autoDark: string;
}

const KBQ_THEME_DEFAULT_CONFIG: KbqThemeConfig = {
    themes: KbqDefaultThemes,
    mode: 'auto',
    storageKey: 'kbq-theme-mode',
    autoLight: 'light',
    autoDark: 'dark'
};

/** Injection token for `KbqThemeService`'s configuration. Configure via `kbqThemeProvider()`, not this directly. */
export const KBQ_THEME_CONFIG = new InjectionToken<KbqThemeConfig>('KBQ_THEME_CONFIG', {
    providedIn: 'root',
    factory: () => KBQ_THEME_DEFAULT_CONFIG
});

/**
 * Configures `KbqThemeService` — registers custom themes, sets the initial mode, and how it's applied to the DOM.
 * Only the properties you pass are overridden; anything omitted keeps its `KBQ_THEME_DEFAULT_CONFIG` value.
 */
export const kbqThemeProvider = (config: Partial<KbqThemeConfig>): Provider => ({
    provide: KBQ_THEME_CONFIG,
    useValue: { ...KBQ_THEME_DEFAULT_CONFIG, ...config }
});

/**
 * Strategy used by `KbqThemeService` to persist and restore `selection()` — `'auto'` or a selected theme `name`,
 * not a mode alone, hence "selection" rather than "mode" here.
 *
 * Provide a custom implementation through the `KBQ_THEME_STORE` token to change where it's stored
 * (e.g. `sessionStorage`, a backend), or to disable persistence entirely.
 */
export interface KbqThemeStore {
    /** Returns the previously saved selection, or `null` when nothing is stored/available. */
    getSelection(): KbqThemeName | null;
    /** Persists the selection. */
    setSelection(selection: KbqThemeName): void;
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

    getSelection(): KbqThemeName | null {
        try {
            return this.window.localStorage.getItem(this.storageKey);
        } catch {
            // No-op on the server, or wherever `localStorage` is unavailable/throws (private mode, sandboxed iframes).
            return null;
        }
    }

    setSelection(selection: KbqThemeName): void {
        try {
            this.window.localStorage.setItem(this.storageKey, selection);
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

    getSelection(): KbqThemeName | null {
        const prefix = `${this.storageKey}=`;
        const cookie = this.document.cookie.split('; ').find((entry) => entry.startsWith(prefix));

        return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
    }

    setSelection(selection: KbqThemeName): void {
        // 1 year: matches the lifetime a persisted UI preference is expected to have. SameSite=Lax is
        // sent on the top-level navigation request that SSR needs it for, while still blocking
        // cross-site reads.
        this.document.cookie = `${this.storageKey}=${encodeURIComponent(selection)}; path=/; max-age=31536000; SameSite=Lax`;
    }
}

/**
 * Injection token for the store used to persist the current selection (see `KbqThemeStore`).
 * Defaults to a `localStorage`-backed implementation (`KbqThemeLocalStorageStore`).
 */
export const KBQ_THEME_STORE = new InjectionToken<KbqThemeStore>('KBQ_THEME_STORE', {
    providedIn: 'root',
    factory: () => inject(KbqThemeLocalStorageStore)
});

/**
 * Manages the active Koobiq theme: resolves `auto` mode from the OS color scheme, applies the active theme's
 * class to the document body, and persists the current selection via `KBQ_THEME_STORE`.
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
    private readonly config: KbqThemeConfig<T> = {
        ...KBQ_THEME_DEFAULT_CONFIG,
        ...inject(KBQ_THEME_CONFIG)
    } as KbqThemeConfig<T>;

    private readonly renderer: Renderer2;
    private readonly media = this.window.matchMedia('(prefers-color-scheme: dark)');
    private readonly systemPrefersDark = signal(this.media.matches);

    /** Themes available to select from. Replace via `setThemes()` to register a fully custom set. */
    readonly themes = signal<T[]>(this.config.themes);

    /** `'auto'` to follow the OS color scheme, or the selected theme's `name`. Persisted via `KBQ_THEME_STORE`. */
    readonly selection = signal<KbqThemeName>(this.store.getSelection() ?? this.config.mode);

    /** Whether the theme follows the OS color scheme instead of a specific selected theme. */
    readonly auto = computed(() => this.selection() === 'auto');

    /** The theme object currently applied to the document, or `null` if the resolved name matches none. */
    readonly currentTheme = computed<T | null>(() => {
        const resolvedThemeName = this.auto()
            ? this.systemPrefersDark()
                ? this.config.autoDark
                : this.config.autoLight
            : this.selection();

        return this.themes().find((theme) => theme.name === resolvedThemeName) ?? null;
    });

    /** Light/dark polarity of `currentTheme()`. Falls back to the OS preference. */
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
        effect(() => this.store.setSelection(this.selection()));
    }

    /** Registers a custom set of themes. */
    setThemes(items: T[]) {
        this.themes.set(items);
    }

    /** Selects a specific registered theme directly by `name`, turning `auto()` off. */
    selectTheme(name: KbqThemeNames | KbqThemeName) {
        this.selection.set(name);
    }

    /** Follows the OS color scheme. */
    setAuto() {
        this.selection.set('auto');
    }

    /**
     * Switches between `autoLight`/`autoDark` (`light`/`dark` by default), based on `colorScheme()` — so
     * it does the right thing even when `currentTheme()` is some other, directly-selected theme whose
     * `name` doesn't match `light`/`dark`/`autoLight`/`autoDark`.
     */
    toggle() {
        this.selectTheme(this.colorScheme() === 'dark' ? this.config.autoLight : this.config.autoDark);
    }

    /** @deprecated use `selectTheme()` with a theme `name` instead. */
    setTheme(value: T | number) {
        if (typeof value === 'number') {
            const theme = this.themes()[value];

            if (theme) this.selectTheme(theme.name);
        } else if (typeof value === 'object' && value !== null && this.themes().includes(value)) {
            this.selectTheme(value.name);
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
