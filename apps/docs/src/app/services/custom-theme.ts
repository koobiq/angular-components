import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_STATE_STORE, KbqStateSavingRef, KbqStateSavingService, KbqStateStore } from '@koobiq/components/core';
import { Observable } from 'rxjs';
import { DocsTranslationKey } from './i18n';

/** Number of steps in every palette ramp. */
export const DOCS_PALETTE_STEPS = 20;

/** What `--kbq-size-border-radius` ships as, and what the playground resets to. */
export const DOCS_DEFAULT_BORDER_RADIUS = 8;

/** A semantic family the playground lets you repoint, paired with its i18n key. */
export type DocsThemeableFamily = { key: string; labelKey: DocsTranslationKey };

/**
 * Semantic families that are safe to repoint at another hue.
 *
 * `warningFixed` is deliberately absent: it exists precisely so that a warning keeps its hue
 * regardless of the theme, so offering it as a knob would misrepresent the system.
 */
export const DOCS_THEMEABLE_FAMILIES: DocsThemeableFamily[] = [
    { key: 'theme', labelKey: 'playgroundFamilyTheme' },
    { key: 'contrast', labelKey: 'playgroundFamilyContrast' },
    { key: 'error', labelKey: 'playgroundFamilyError' },
    { key: 'success', labelKey: 'playgroundFamilySuccess' },
    { key: 'warning', labelKey: 'playgroundFamilyWarning' },
    { key: 'visited', labelKey: 'playgroundFamilyVisited' }
];

/** The two colour schemes a role is declared under. */
export type DocsThemeScheme = 'light' | 'dark';

/** A role the playground lets you point at an exact colour, with the section it is listed under. */
export interface DocsThemeableRole {
    token: string;
    group: 'surfaces' | 'text' | 'brand' | 'lines' | 'status';
}

/**
 * The roles worth exposing — the "head" of each group, never its `-fade` / `-less` / `-secondary`
 * variants, which are the same hue at another step and follow the family on their own.
 *
 * Roles are declared per scheme (`.kbq-light` / `.kbq-dark`), and light and dark do not always read
 * the same family: `--kbq-background-bg` is `plt.white` in light but `semantic.darkContrast.1` in
 * dark. That is why surfaces are here at all — no family knob can reach them.
 */
export const DOCS_THEMEABLE_ROLES: DocsThemeableRole[] = [
    { token: '--kbq-background-bg', group: 'surfaces' },
    { token: '--kbq-background-bg-secondary', group: 'surfaces' },
    { token: '--kbq-background-card', group: 'surfaces' },

    { token: '--kbq-foreground-contrast', group: 'text' },
    { token: '--kbq-foreground-contrast-secondary', group: 'text' },
    { token: '--kbq-foreground-theme', group: 'text' },
    // Inverts between schemes (`plt.white` → `plt.black`) — the clearest example of why roles exist.
    { token: '--kbq-foreground-on-contrast', group: 'text' },

    { token: '--kbq-background-contrast', group: 'brand' },
    { token: '--kbq-background-theme', group: 'brand' },
    { token: '--kbq-background-theme-fade', group: 'brand' },
    { token: '--kbq-icon-theme', group: 'brand' },

    { token: '--kbq-line-contrast-less', group: 'lines' },
    { token: '--kbq-line-theme', group: 'lines' },
    { token: '--kbq-states-line-focus', group: 'lines' },

    { token: '--kbq-background-error', group: 'status' },
    { token: '--kbq-foreground-error', group: 'status' },
    { token: '--kbq-background-success', group: 'status' },
    // In light this reads `semantic.warningFixed`, which is deliberately not themeable — so pinning
    // the role is the only way to change it there.
    { token: '--kbq-background-warning', group: 'status' }
];

/** Where a role points, per scheme. A missing half means that scheme still follows its default. */
export type DocsRolePin = Partial<Record<DocsThemeScheme, string>>;

/** Everything a theme consists of: the alias layer, the pinned roles, and the shape knob. */
export interface DocsCustomThemeValue {
    /** Semantic family → the engineering family it aliases, e.g. `theme` → `teal`. */
    selection: Record<string, string>;
    /** Role token → pin. An absent key is a role that follows the shipped default. */
    roles: Record<string, DocsRolePin>;
    borderRadius: number;
}

/** The persisted record: the theme itself plus whether the user currently wants it on. */
interface DocsStoredCustomTheme {
    theme: DocsCustomThemeValue;
    enabled: boolean;
}

/**
 * Coerces a raw persisted payload into a `DocsStoredCustomTheme`, returning `null` for anything
 * unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so the store hands back `unknown` and a payload is
 * never trusted — without this, a hand-edited entry would decide what the whole site looks like.
 */
const normalizeStoredTheme = (parsed: unknown): DocsStoredCustomTheme | null => {
    const stored = parsed as Partial<DocsStoredCustomTheme> | null;
    const theme = stored?.theme;

    if (!theme || typeof theme.borderRadius !== 'number' || typeof theme.selection !== 'object') return null;

    const selection = Object.fromEntries(
        DOCS_THEMEABLE_FAMILIES.map(({ key }) => [key, theme.selection[key]]).filter(([, family]) =>
            isPaletteFamily(family)
        )
    );

    const roles: Record<string, DocsRolePin> = {};

    for (const { token } of DOCS_THEMEABLE_ROLES) {
        const pin = (theme.roles as Record<string, DocsRolePin> | undefined)?.[token];

        if (!pin || typeof pin !== 'object') continue;

        const kept: DocsRolePin = {};

        for (const scheme of ['light', 'dark'] as const) {
            if (isTokenName(pin[scheme])) kept[scheme] = pin[scheme];
        }

        if (Object.keys(kept).length > 0) roles[token] = kept;
    }

    return {
        theme: { selection, roles, borderRadius: theme.borderRadius },
        enabled: stored.enabled === true
    };
};

/**
 * Everything the theme needs to know about the library's state-saving subsystem, kept in one place so
 * that `DocsCustomTheme` itself only ever reads and writes a theme.
 *
 * Registering is not bookkeeping: `KbqStateSavingService` counts a stored key that no live component
 * claims as an orphan, and `clearOrphans()` would sweep away exactly what the next visit is meant to
 * restore. `host` stays `null` — a site-wide theme has no element to be located by, the same reason
 * `KbqSidepanelService` registers one of these on a closed panel's behalf.
 */
class DocsCustomThemeStateSaving implements KbqStateSavingRef {
    /** How this entry is named where the service reports it. */
    readonly name = 'docs-custom-theme';

    /** The one slot. The store writes it under its own `kbq.state.` prefix. */
    readonly key = 'docs-custom-theme';

    readonly host = null;

    /** There is no per-entry switch to turn this off; the application-wide one still applies. */
    readonly enabled = true;

    state: unknown = null;

    /**
     * Emits when another document of the same origin changes what is stored. A getter rather than a
     * field: class fields initialize before the constructor assigns the parameter properties.
     */
    get changes(): Observable<void> | undefined {
        return this.store.changes;
    }

    constructor(
        private readonly store: KbqStateStore,
        private readonly service: KbqStateSavingService,
        destroyRef: DestroyRef,
        /** Called when the subsystem drops this entry, so the theme on screen goes with it. */
        private readonly onCleared: () => void
    ) {
        service.register(this);
        destroyRef.onDestroy(() => service.unregister(this));
    }

    read(): DocsStoredCustomTheme | null {
        const stored = this.persists ? normalizeStoredTheme(this.store.getState(this.key)) : null;

        this.state = stored;

        return stored;
    }

    write(stored: DocsStoredCustomTheme): void {
        if (!this.persists) return;

        this.store.setState(this.key, stored);
        this.state = stored;
        this.service.notify();
    }

    /** Called by `KbqStateSavingService` when it removes this entry, and never by the theme itself. */
    clear(): void {
        this.store.removeState(this.key);
        this.state = null;
        this.onCleared();
    }

    /** Mirrors the directive's own rule: the application-wide switch decides, there is nothing else. */
    private get persists(): boolean {
        return this.service.isEnabled();
    }
}

/**
 * Marks the injected override sheet. The playground reads the shipped palette back out of the
 * loaded stylesheets, and without a way to tell its own overrides apart it would mistake the
 * active theme for the defaults.
 */
export const DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE = 'data-docs-custom-theme';

// Storage is origin-wide and user-writable, and both of these end up interpolated into a `<style>`
// element's text. Without them a hand-edited entry could close the rule and inject site-wide CSS
// that survives reloads.
const isPaletteFamily = (value: unknown): value is string =>
    typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9]*$/.test(value);
const isTokenName = (value: unknown): value is string => typeof value === 'string' && /^--kbq-[a-z0-9-]+$/.test(value);

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

/** `darkSlateA` → `dark-slate-a`, matching how tokens-builder names the CSS variables. */
const toKebab = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * The whole theme as a single `:root` block.
 *
 * Both the light ramps and their `dark*` counterparts are written out, which is why a custom theme
 * is not a fourth mode next to light and dark: it repoints the aliases under both.
 */
export const docsBuildCustomThemeCss = ({ selection, roles, borderRadius }: DocsCustomThemeValue): string => {
    const aliases: string[] = [];

    for (const { key } of DOCS_THEMEABLE_FAMILIES) {
        const chosen = selection[key];

        if (!chosen) continue;

        for (const [semantic, plt] of [
            [key, chosen],
            [`dark${capitalise(key)}`, `dark${capitalise(chosen)}`]
        ]) {
            for (const alpha of ['', 'a']) {
                for (let step = 1; step <= DOCS_PALETTE_STEPS; step++) {
                    const suffix = `${alpha}${step}`;

                    aliases.push(
                        `--kbq-semantic-${toKebab(semantic)}-${suffix}: var(--kbq-plt-${toKebab(plt)}-${suffix});`
                    );
                }
            }
        }
    }

    aliases.push(`--kbq-size-border-radius: ${borderRadius}px;`);

    const block = (selector: string, lines: string[]) =>
        lines.length > 0 ? `${selector} {\n${lines.join('\n')}\n}` : '';

    // Roles are declared on `.kbq-light` / `.kbq-dark`, never on `:root`, so an override has to sit
    // on the same selector to win — a `:root` rule would lose on specificity and do nothing.
    const pinned = (scheme: DocsThemeScheme) =>
        DOCS_THEMEABLE_ROLES.map(({ token }) => [token, roles?.[token]?.[scheme]] as const)
            .filter(([, source]) => !!source)
            .map(([token, source]) => `${token}: var(${source});`);

    return [
        block(':root', aliases),
        block('.kbq-light', pinned('light')),
        block('.kbq-dark', pinned('dark'))
    ]
        .filter(Boolean)
        .join('\n\n');
};

/** Two themes are the same when every knob matches — the save button is enabled off this. */
export const docsCustomThemesEqual = (a: DocsCustomThemeValue | null, b: DocsCustomThemeValue | null): boolean => {
    if (!a || !b) return a === b;

    return (
        a.borderRadius === b.borderRadius &&
        DOCS_THEMEABLE_FAMILIES.every(({ key }) => a.selection[key] === b.selection[key]) &&
        DOCS_THEMEABLE_ROLES.every(
            ({ token }) =>
                a.roles?.[token]?.light === b.roles?.[token]?.light && a.roles?.[token]?.dark === b.roles?.[token]?.dark
        )
    );
};

/**
 * The single custom theme a visitor can keep.
 *
 * It applies to the whole site rather than just the playground page, so the navbar's theme menu is
 * where it is switched on and off. Only one slot exists: saving again overwrites what was there.
 *
 * Persistence goes through the library's own state saving — the docs site eating what it serves —
 * but only `DocsCustomThemeStateSaving` knows that; everything below deals in themes.
 */
@Injectable({ providedIn: 'root' })
export class DocsCustomTheme {
    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);

    /** The only thing here that knows the theme is persisted at all, let alone how. */
    private readonly stateSaving = new DocsCustomThemeStateSaving(
        inject(KBQ_STATE_STORE),
        inject(KbqStateSavingService),
        this.destroyRef,
        () => this.forget()
    );

    /** The saved theme, or `null` while the visitor has never saved one. */
    readonly saved = signal<DocsCustomThemeValue | null>(null);

    /** Whether the saved theme is currently applied. */
    readonly enabled = signal(false);

    /**
     * Unsaved knob state from the playground. It takes over while that page is open, so the page
     * always shows what its own controls say rather than what was last saved.
     */
    readonly preview = signal<DocsCustomThemeValue | null>(null);

    private styleElement: HTMLStyleElement | null = null;

    constructor() {
        // The store is read after the first render rather than in the constructor: the docs app is
        // prerendered, and a theme that exists only on the client would otherwise make `saved()`
        // disagree with the server-rendered markup while Angular is still hydrating it.
        afterNextRender(() => {
            this.restore();

            // Another tab of the same site saving or switching the theme is the same visitor changing
            // their mind, so this one follows rather than overwriting it on its next write.
            this.stateSaving.changes?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.restore());
        });

        effect(() => this.render(this.preview() ?? (this.enabled() ? this.saved() : null)));
    }

    /** Overwrites the saved theme and switches to it. */
    save(theme: DocsCustomThemeValue): void {
        this.saved.set(theme);
        this.enabled.set(true);
        this.persist();
    }

    /** Switches the saved theme on or off, leaving it saved either way. */
    toggle(): void {
        if (!this.saved()) return;

        this.enabled.update((enabled) => !enabled);
        this.persist();
    }

    private restore(): void {
        const stored = this.stateSaving.read();

        this.saved.set(stored?.theme ?? null);
        this.enabled.set(stored?.enabled ?? false);
    }

    private persist(): void {
        const theme = this.saved();

        if (theme) this.stateSaving.write({ theme, enabled: this.enabled() });
    }

    /** The subsystem dropped the entry — nothing left to switch on, so the theme comes off the page. */
    private forget(): void {
        this.saved.set(null);
        this.enabled.set(false);
    }

    private render(theme: DocsCustomThemeValue | null): void {
        if (!theme) {
            this.styleElement?.remove();
            this.styleElement = null;

            return;
        }

        if (!this.styleElement) {
            this.styleElement = this.document.createElement('style');
            this.styleElement.setAttribute(DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE, '');
            this.document.head.appendChild(this.styleElement);
        }

        this.styleElement.textContent = docsBuildCustomThemeCss(theme);
    }
}
