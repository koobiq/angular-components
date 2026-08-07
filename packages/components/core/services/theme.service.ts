import { Platform } from '@angular/cdk/platform';
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

/** A theme registered with `KbqThemeService`. */
export interface KbqTheme {
    /** Unique name used to select the theme via `setMode()`. */
    name: string;
    /** CSS class applied to the document body when this theme is active. */
    className: string;
    /**
     * @deprecated Selection state is now owned by `KbqThemeService` — read `currentTheme()` or `mode()` instead.
     * Kept in sync by the service for backward compatibility.
     */
    selected?: boolean;
}

/** Theme mode understood by `KbqThemeService`. `auto` resolves to `light`/`dark` based on the OS color scheme. */
export type KbqThemeMode = 'auto' | 'light' | 'dark';

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

export const KbqDefaultThemes: KbqTheme[] = [
    { name: 'light', className: KbqThemeSelector.Default },
    { name: 'dark', className: KbqThemeSelector.Dark }
];

/** Configuration accepted by `KBQ_THEME_CONFIG` / `kbqThemeProvider()`. */
export interface KbqThemeConfig<T extends KbqTheme = KbqTheme> {
    /** Themes available to the service. @default KbqDefaultThemes */
    themes?: T[];
    /** Initial mode, used only when nothing is persisted yet in the `KBQ_THEME_STORE`. @default 'auto' */
    mode?: KbqThemeMode;
    /** `localStorage` key used to persist the selected mode. @default 'kbq-theme-mode' */
    storageKey?: string;
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

/** Configures `KbqThemeService` — registers custom themes, sets the initial mode, and how it's applied to the DOM. */
export const kbqThemeProvider = (config: KbqThemeConfig): Provider => ({
    provide: KBQ_THEME_CONFIG,
    useValue: config
});

/**
 * Strategy used by `KbqThemeService` to persist and restore the selected theme mode.
 *
 * Provide a custom implementation through the `KBQ_THEME_STORE` token to change where the mode is stored
 * (e.g. `sessionStorage`, a backend), or to disable persistence entirely.
 */
export interface KbqThemeStore {
    /** Returns the previously saved mode, or `null` when nothing is stored/available. */
    getMode(): KbqThemeMode | string | null;
    /** Persists the mode. */
    setMode(mode: KbqThemeMode | string): void;
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
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly window = inject(KBQ_WINDOW);
    private readonly storageKey = inject(KBQ_THEME_CONFIG).storageKey ?? KBQ_THEME_DEFAULT_CONFIG.storageKey;

    getMode(): KbqThemeMode | string | null {
        if (!this.isBrowser) return null;

        try {
            return this.window.localStorage.getItem(this.storageKey);
        } catch {
            return null;
        }
    }

    setMode(mode: KbqThemeMode | string): void {
        if (!this.isBrowser) return;

        try {
            this.window.localStorage.setItem(this.storageKey, mode);
        } catch {
            // Ignore storage write failures (quota exceeded, disabled/blocked storage, etc.).
        }
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

    /** Currently selected mode. `'auto'` resolves to `light`/`dark` based on the OS color scheme. */
    readonly mode = signal<KbqThemeMode | string>(this.store.getMode() ?? this.config.mode);

    /** `mode()` resolved to a concrete theme name — never `'auto'`. Uses `autoLight`/`autoDark` from `KBQ_THEME_CONFIG`. */
    readonly resolvedMode = computed(() => {
        const mode = this.mode();

        if (mode !== 'auto') return mode;

        return this.systemPrefersDark() ? this.config.autoDark : this.config.autoLight;
    });

    /** The theme object currently applied to the document, or `null` if `resolvedMode()` matches no registered theme. */
    readonly currentTheme = computed<T | null>(() => {
        const resolvedMode = this.resolvedMode();

        return this.themes().find((theme) => theme.name === resolvedMode) ?? null;
    });

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
    setMode(mode: KbqThemeMode | string) {
        this.mode.set(mode);
    }

    /** Follows the OS color scheme. */
    setAuto() {
        this.setMode('auto');
    }

    /** Switches between `autoLight`/`autoDark` (`light`/`dark` by default), based on the currently resolved mode. */
    toggle() {
        this.setMode(this.resolvedMode() === this.config.autoDark ? this.config.autoLight : this.config.autoDark);
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
