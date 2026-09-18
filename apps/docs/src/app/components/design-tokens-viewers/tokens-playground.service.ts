import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { DocsTranslationKey } from '../../services/i18n';

/** Number of steps in every palette ramp. */
export const DOCS_PALETTE_STEPS = 20;

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

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

/** `darkSlateA` → `dark-slate-a`, matching how tokens-builder names the CSS variables. */
const toKebab = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/** `dark-slate` → `darkSlate`, going back the other way. */
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

    /** Engineering families offered as choices, e.g. `blue`, `teal`. */
    readonly paletteFamilies = signal<string[]>([]);
    /** What each semantic family aliases out of the box, e.g. `theme` → `blue`. */
    readonly defaults = signal<Record<string, string>>({});
    /** Current selection per semantic family. */
    readonly selection = signal<Record<string, string>>({});
    readonly borderRadius = signal(8);

    private styleElement: HTMLStyleElement | null = null;

    /** Reads the palette out of the loaded stylesheets. Browser only — needs styleSheets. */
    init(): void {
        const declarations = this.collectDeclarations();

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
        this.reset();
    }

    reset(): void {
        const defaults = this.defaults();
        const fallback = this.paletteFamilies()[0];

        this.selection.set(
            Object.fromEntries(DOCS_THEMEABLE_FAMILIES.map(({ key }) => [key, defaults[key] ?? fallback]))
        );
        this.borderRadius.set(8);
        this.apply();
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

    /** Writes the `--kbq-semantic-*: var(--kbq-plt-*)` overrides into a single injected sheet. */
    apply(): void {
        const selection = this.selection();

        if (Object.keys(selection).length === 0) return;

        const lines: string[] = [];

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

                        lines.push(
                            `--kbq-semantic-${toKebab(semantic)}-${suffix}: var(--kbq-plt-${toKebab(plt)}-${suffix});`
                        );
                    }
                }
            }
        }

        lines.push(`--kbq-size-border-radius: ${this.borderRadius()}px;`);

        this.styleElement ??= this.document.head.appendChild(this.document.createElement('style'));
        this.styleElement.textContent = `:root {\n${lines.join('\n')}\n}`;
    }

    /** Removes the overrides so leaving the page restores the shipped palette. */
    teardown(): void {
        this.styleElement?.remove();
        this.styleElement = null;
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

    /** Declared (not computed) custom properties, grouped by selector. */
    private collectDeclarations(): Map<string, Map<string, string>> {
        const declared = new Map<string, Map<string, string>>();

        for (const sheet of Array.from(this.document.styleSheets)) {
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
