import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import {
    DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE,
    DOCS_DEFAULT_BORDER_RADIUS,
    DOCS_PALETTE_STEPS,
    DOCS_THEMEABLE_FAMILIES,
    DOCS_THEMEABLE_ROLES,
    docsBuildCustomThemeCss,
    DocsCustomTheme,
    docsCustomThemesEqual,
    DocsCustomThemeValue,
    DocsRolePin,
    DocsThemeableFamily,
    DocsThemeScheme
} from '../../services/custom-theme';
import { docsBuildColorFamilies, DocsColorFamily, docsFilterFamiliesByScheme } from './color-picker/palette-catalog';

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

/** `dark-slate` → `darkSlate`, the reverse of how tokens-builder names the CSS variables. */
const toCamel = (value: string) => value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

/**
 * Drives the live re-theming on the design tokens playground page.
 *
 * The whole point it demonstrates: `semantic.*` is a pure 1:1 alias layer over the engineering
 * palette `plt.*`, so re-theming means repointing that one layer and nothing downstream has to
 * change. `semantic.json5` does exactly this at build time; here the same rewrite happens at
 * runtime through a single injected stylesheet.
 *
 * Everything is read out of the loaded stylesheets rather than hardcoded, so the page follows
 * whatever @koobiq/design-tokens is installed instead of drifting away from it.
 */
@Injectable()
export class DocsTokensPlaygroundService {
    private readonly document = inject(DOCUMENT);
    private readonly customTheme = inject(DocsCustomTheme);

    /** Engineering families offered as choices, e.g. `blue`, `teal`. */
    readonly paletteFamilies = signal<string[]>([]);
    /** What each semantic family aliases out of the box, e.g. `theme` → `blue`. */
    readonly defaults = signal<Record<string, string>>({});
    /** Current selection per semantic family. */
    readonly selection = signal<Record<string, string>>({});
    readonly borderRadius = signal(DOCS_DEFAULT_BORDER_RADIUS);

    /** Pinned roles. A role missing here follows its shipped default. */
    readonly roles = signal<Record<string, DocsRolePin>>({});

    /** What each curated role points at out of the box, per scheme. Read from the stylesheets. */
    readonly roleDefaults = signal<Record<string, Partial<Record<DocsThemeScheme, string>>>>({});

    /** Every engineering ramp, for the picker. Split by scheme at the call site. */
    readonly paletteCatalog = signal<DocsColorFamily[]>([]);
    /** Every semantic ramp, offered above the engineering ones so the default answer stays in-system. */
    readonly semanticCatalog = signal<DocsColorFamily[]>([]);

    constructor() {
        // The theme can be switched on and off from the navbar while this page is open. The knobs
        // are what the page previews, so they follow that toggle instead of quietly disagreeing
        // with it — nothing to react to until `init()` has read the palette.
        effect(() => {
            const active = this.customTheme.enabled() ? this.customTheme.saved() : null;

            if (this.paletteFamilies().length === 0) return;

            untracked(() => (active ? this.load(active) : this.reset()));
        });
    }

    /** Reads the palette out of the loaded stylesheets. Browser only — needs styleSheets. */
    init(): void {
        const declarations = this.collectDeclarations(true);

        const pltFamilies = new Set<string>();
        const semanticToPlt: Record<string, string> = {};

        for (const [, scope] of declarations) {
            for (const [property, value] of scope) {
                const plt = property.match(/^--kbq-plt-([a-z-]+?)-(a?)\d+$/);

                if (plt) {
                    pltFamilies.add(toCamel(plt[1]) + (plt[2] ? 'A' : ''));
                    continue;
                }

                const semantic = property.match(/^--kbq-semantic-([a-z-]+?)-a?\d+$/);
                const aliased = value.match(/^var\(--kbq-plt-([a-z-]+?)-a?\d+\)$/);

                if (semantic && aliased) {
                    const family = toCamel(semantic[1]);

                    semanticToPlt[family] ??= toCamel(aliased[1]);
                }
            }
        }

        // Only plain hue ramps that have both an alpha twin and a dark counterpart can stand in
        // for another family — anything else would leave part of the ramp undefined.
        const choices = [...pltFamilies]
            .filter(
                (family) =>
                    !family.startsWith('dark') &&
                    !family.endsWith('A') &&
                    !family.endsWith('Fixed') &&
                    pltFamilies.has(`${family}A`) &&
                    pltFamilies.has(`dark${capitalise(family)}`)
            )
            .sort();

        this.paletteFamilies.set(choices);
        this.defaults.set(semanticToPlt);
        this.paletteCatalog.set(docsBuildColorFamilies(declarations, 'plt'));
        this.semanticCatalog.set(docsBuildColorFamilies(declarations, 'semantic'));

        // Role defaults come from the stylesheets rather than a generated list, so they always match
        // the installed package. Roles are declared per scheme, never on `:root`.
        const scoped = (scheme: DocsThemeScheme) => declarations.get(`.kbq-${scheme}`);

        this.roleDefaults.set(
            Object.fromEntries(
                DOCS_THEMEABLE_ROLES.map(({ token }) => [
                    token,
                    {
                        light: scoped('light')
                            ?.get(token)
                            ?.match(/^var\((--[\w-]+)\)$/)?.[1],
                        dark: scoped('dark')
                            ?.get(token)
                            ?.match(/^var\((--[\w-]+)\)$/)?.[1]
                    }
                ])
            )
        );

        // Open on whatever the visitor is actually looking at: their own theme when it is switched
        // on, the shipped palette otherwise.
        const active = this.customTheme.enabled() ? this.customTheme.saved() : null;

        if (active) {
            this.load(active);
        } else {
            this.reset();
        }
    }

    /** Back to the shipped palette, both levels. */
    reset(): void {
        this.load({ ...this.shippedSelection(), roles: {}, borderRadius: DOCS_DEFAULT_BORDER_RADIUS });
    }

    /** Back to the shipped families, leaving pinned roles alone. */
    resetFamilies(): void {
        this.load({ ...this.shippedSelection(), roles: this.roles(), borderRadius: this.borderRadius() });
    }

    /** Unpins every role, leaving the family knobs alone. */
    resetRoles(): void {
        this.roles.set({});
        this.apply();
    }

    /** Points a role at an exact colour, for one scheme only. */
    pinRole(token: string, scheme: DocsThemeScheme, source: string): void {
        this.roles.update((current) => ({ ...current, [token]: { ...current[token], [scheme]: source } }));
        this.apply();
    }

    /** Drops a pin. Removing the last scheme removes the role entirely, so it follows again. */
    unpinRole(token: string, scheme: DocsThemeScheme): void {
        this.roles.update((current) => {
            const pin = { ...current[token] };

            delete pin[scheme];

            const next = { ...current };

            if (Object.keys(pin).length > 0) next[token] = pin;
            else delete next[token];

            return next;
        });
        this.apply();
    }

    /** Roles the visitor has pinned, in curated order. */
    pinnedRoles(): string[] {
        return DOCS_THEMEABLE_ROLES.filter(({ token }) => this.roles()[token]).map(({ token }) => token);
    }

    /** The knobs as a theme — what gets saved, and what the preview is driven from. */
    value(): DocsCustomThemeValue {
        return { selection: this.selection(), roles: this.roles(), borderRadius: this.borderRadius() };
    }

    /** A ready-to-paste stylesheet for the current knobs. Same generator the preview runs on. */
    buildCssExport(): string {
        return [
            '/* Koobiq custom theme, built on the design tokens playground. */',
            '/* Include this file after the @koobiq/design-tokens stylesheets. */',
            '',
            docsBuildCustomThemeCss(this.value()),
            ''
        ].join('\n');
    }

    private shippedSelection(): Pick<DocsCustomThemeValue, 'selection'> {
        const defaults = this.defaults();
        const fallback = this.paletteFamilies()[0];

        return {
            selection: Object.fromEntries(DOCS_THEMEABLE_FAMILIES.map(({ key }) => [key, defaults[key] ?? fallback]))
        };
    }

    /** Overwrites the visitor's single saved theme with the current knobs and switches to it. */
    saveTheme(): void {
        this.customTheme.save(this.value());
    }

    /** Whether saving would change anything — against the saved theme, or the shipped palette when there is none. */
    hasUnsavedChanges(): boolean {
        const saved = this.customTheme.saved();

        return saved
            ? !docsCustomThemesEqual(this.value(), saved)
            : this.changedFamilies().length > 0 ||
                  this.pinnedRoles().length > 0 ||
                  this.borderRadius() !== DOCS_DEFAULT_BORDER_RADIUS;
    }

    /** Ramps offered for a role in the given scheme: semantic first, then the engineering palette. */
    catalogFor(scheme: DocsThemeScheme, titles: { semantic: string; palette: string }) {
        return [
            { title: titles.semantic, families: docsFilterFamiliesByScheme(this.semanticCatalog(), scheme) },
            { title: titles.palette, families: docsFilterFamiliesByScheme(this.paletteCatalog(), scheme) }
        ].filter(({ families }) => families.length > 0);
    }

    select(family: string, value: string): void {
        this.selection.update((current) => ({ ...current, [family]: value }));
        this.apply();
    }

    setBorderRadius(value: number): void {
        this.borderRadius.set(value);
        this.apply();
    }

    /** True when the user has moved away from the shipped palette. */
    changedFamilies(): DocsThemeableFamily[] {
        const selection = this.selection();
        const defaults = this.defaults();

        return DOCS_THEMEABLE_FAMILIES.filter(({ key }) => selection[key] !== defaults[key]);
    }

    /** Pushes the knobs to the live preview, which outranks the saved theme while this page is open. */
    apply(): void {
        if (Object.keys(this.selection()).length === 0) return;

        this.customTheme.preview.set(this.value());
    }

    /** Drops the preview, so leaving the page falls back to the saved theme or the shipped palette. */
    teardown(): void {
        this.customTheme.preview.set(null);
    }

    /** The repointable families as picker groups. Any step of a ramp stands for the whole ramp. */
    familyCatalog(title: string) {
        const repointable = new Set(this.paletteFamilies());

        return [
            {
                title,
                families: this.paletteCatalog().filter(({ id }) => repointable.has(toCamel(id)))
            }
        ];
    }

    /** `--kbq-plt-teal-a14` → `teal`, so a click on any step repoints the whole family. */
    familyFromToken(token: string): string | null {
        const match = token.match(/^--kbq-plt-(.+?)(?:-a?\d+)?$/);

        return match ? toCamel(match[1]) : null;
    }

    /** The step a family knob shows in its trigger. */
    familyPreview(family: string): string | null {
        return this.paletteCatalog().find(({ id }) => toCamel(id) === family)?.preview ?? null;
    }

    private load({ selection, roles, borderRadius }: DocsCustomThemeValue): void {
        this.selection.set(selection);
        this.roles.set(roles ?? {});
        this.borderRadius.set(borderRadius);
        this.apply();
    }

    /**
     * Walks `--a: var(--b)` hops for the inspector.
     *
     * `getComputedStyle` is no use here: for a custom property it returns the value *after*
     * var() substitution, so the chain has already collapsed to the final colour. Reading the
     * declared values back out of the stylesheets is what shows the alias hops.
     */
    resolveChain(variable: string, theme: 'light' | 'dark'): { variable: string; value: string }[] {
        const declarations = this.collectDeclarations();
        const scoped = declarations.get(`.kbq-${theme}`);
        const root = declarations.get(':root');
        const lookup = (name: string) => scoped?.get(name) ?? root?.get(name);

        const chain: { variable: string; value: string }[] = [];
        let current: string | null = variable;

        for (let hop = 0; hop < 8 && current; hop++) {
            const value = lookup(current);

            if (value === undefined) break;

            chain.push({ variable: current, value });

            const next = value.match(/^var\((--[\w-]+)\)$/);

            current = next ? next[1] : null;
        }

        return chain;
    }

    /** A ready-to-paste semantic.json5 patch for the current selection. */
    buildPatch(): string {
        const selection = this.selection();
        const blocks: string[] = [];

        for (const { key } of this.changedFamilies()) {
            const chosen = selection[key];

            for (const [semantic, plt] of [
                [key, chosen],
                [`${key}A`, `${chosen}A`],
                [`dark${capitalise(key)}`, `dark${capitalise(chosen)}`],
                [`dark${capitalise(key)}A`, `dark${capitalise(chosen)}A`]
            ]) {
                const steps = Array.from(
                    { length: DOCS_PALETTE_STEPS },
                    (_, index) => `            '${index + 1}': { $value: '{plt.${plt}.${index + 1}}' }`
                ).join(',\n');

                blocks.push(`        ${semantic}: {\n${steps}\n        }`);
            }
        }

        return [
            '// packages/design-tokens/web/properties/semantic.json5',
            '{',
            '    semantic: {',
            "        $type: 'color',",
            blocks.join(',\n'),
            '    }',
            '}',
            ''
        ].join('\n');
    }

    /**
     * Declared (not computed) custom properties, grouped by selector.
     *
     * `shippedOnly` leaves out the override sheet an active theme injects. The shipped palette is
     * read back out of the stylesheets, and that sheet redeclares the very `semantic.*` aliases
     * being read — without skipping it, the theme in force would pass for the defaults.
     */
    private collectDeclarations(shippedOnly = false): Map<string, Map<string, string>> {
        const declared = new Map<string, Map<string, string>>();

        for (const sheet of Array.from(this.document.styleSheets)) {
            if (shippedOnly && (sheet.ownerNode as Element | null)?.hasAttribute(DOCS_CUSTOM_THEME_STYLE_ATTRIBUTE)) {
                continue;
            }

            let rules: CSSRuleList;

            try {
                rules = sheet.cssRules;
            } catch {
                // Cross-origin stylesheet — not ours to read.
                continue;
            }

            for (const rule of Array.from(rules)) {
                if (!(rule instanceof CSSStyleRule)) continue;

                for (const property of Array.from(rule.style)) {
                    if (!property.startsWith('--kbq-')) continue;

                    const scope = declared.get(rule.selectorText) ?? new Map<string, string>();

                    scope.set(property, rule.style.getPropertyValue(property).trim());
                    declared.set(rule.selectorText, scope);
                }
            }
        }

        return declared;
    }
}
