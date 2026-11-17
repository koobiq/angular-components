import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignToken, SourceResult } from '../types.js';
import type { PackageRef } from './project.js';

/**
 * Reads design tokens out of the consumer's own `@koobiq/design-tokens`.
 *
 * The compiled CSS is the source, not the `properties/*.json5` behind it: the CSS carries the
 * final custom-property names, the resolved values and any deprecation marker, so nothing has to
 * reproduce the token build's naming transform. The json5 sources would add the reference chain
 * (`{plt.slate.1}`) and nothing else.
 */

export type TokenTheme = 'light' | 'dark' | 'font' | 'common';

export type ThemedToken = DesignToken & {
    themes: TokenTheme[];
    /** Resolved value per theme, when the token varies by theme or lives outside the theme files. */
    themeValues?: Partial<Record<TokenTheme, string>>;
};

type Reader = {
    files: { path: string; theme: TokenTheme }[];
};

const READERS = new Map<number, Reader>([
    [
        3,
        {
            files: [
                { path: 'web/css-tokens-light.css', theme: 'light' },
                { path: 'web/css-tokens-dark.css', theme: 'dark' },
                { path: 'web/css-tokens-font.css', theme: 'font' }
            ]
        }
    ],
    [
        4,
        {
            files: [
                { path: 'web/css-tokens.css', theme: 'common' },
                { path: 'web/css-tokens-light.css', theme: 'light' },
                { path: 'web/css-tokens-dark.css', theme: 'dark' }
            ]
        }
    ]
]);

const NEWEST_KNOWN_MAJOR = Math.max(...READERS.keys());

const DOCS_HINT = 'https://koobiq.io/en/tokens';

// Matches both `/* comment */` and `/** comment */` so v4 doc comments are preserved.
const DECLARATION = /^\s*(--kbq-[a-z0-9-]+)\s*:\s*([^;]+);\s*(?:\/\*\*?\s*([^*]*?)\s*\*\/)?/i;
const VAR_REFERENCE = /var\(\s*(--[a-z0-9-]+)/gi;
const VAR_CALL = /var\(\s*(--kbq-[a-z0-9-]+)\s*\)/gi;

type RawToken = {
    cssName: string;
    path: string;
    comment?: string;
    values: Map<TokenTheme, string>;
    themes: TokenTheme[];
};

const parseCss = (css: string, theme: TokenTheme, into: Map<string, RawToken>): void => {
    for (const line of css.split('\n')) {
        const match = DECLARATION.exec(line);

        if (!match) continue;

        const [, cssName, rawValue, comment] = match as unknown as [string, string, string, string | undefined];
        const value = rawValue.trim();
        const existing = into.get(cssName);

        if (existing) {
            existing.values.set(theme, value);

            if (!existing.themes.includes(theme)) existing.themes.push(theme);

            continue;
        }

        into.set(cssName, {
            cssName,
            path: cssName.replace(/^--kbq-/, '').replace(/-/g, '.'),
            comment,
            values: new Map([[theme, value]]),
            themes: [theme]
        });
    }
};

const referencesIn = (value: string): string[] => [...value.matchAll(VAR_REFERENCE)].map((m) => m[1]!);

const resolveValue = (
    token: RawToken,
    theme: TokenTheme,
    all: Map<string, RawToken>,
    stack: Set<string> = new Set()
): string => {
    const value =
        token.values.get(theme) ??
        token.values.get('common') ??
        token.values.get('light') ??
        token.values.get('dark') ??
        token.values.get('font') ??
        '';

    if (!value || stack.has(token.cssName)) return value;

    stack.add(token.cssName);

    const resolved = value.replace(VAR_CALL, (match, ref: string) => {
        if (stack.has(ref)) return match;

        const target = all.get(ref);

        if (!target) return match;

        const targetTheme: TokenTheme = target.values.has(theme)
            ? theme
            : target.values.has('common')
              ? 'common'
              : target.themes[0]!;

        return resolveValue(target, targetTheme, all, stack);
    });

    stack.delete(token.cssName);

    return resolved;
};

const resolveToken = (token: RawToken, all: Map<string, RawToken>): ThemedToken => {
    const references = new Set<string>();

    for (const value of token.values.values()) {
        for (const ref of referencesIn(value)) references.add(ref);
    }

    const themeValues: Partial<Record<TokenTheme, string>> = {};

    for (const theme of token.themes) {
        themeValues[theme] = resolveValue(token, theme, all);
    }

    const orderedThemes: TokenTheme[] = ['common', 'light', 'dark', 'font'];
    const defaultTheme = orderedThemes.find((theme) => token.themes.includes(theme)) ?? token.themes[0]!;

    const deprecation = /^DEPRECATED:\s*(.*)$/i.exec((token.comment ?? '').trim());
    const note = deprecation?.[1]?.trim();

    return {
        cssName: token.cssName,
        path: token.path,
        value: themeValues[defaultTheme] ?? '',
        themeValues,
        references: references.size > 0 ? [...references] : undefined,
        deprecated: deprecation ? true : undefined,
        // `true` carries nothing; anything else is the package telling the caller what to do.
        deprecationNote: note && note !== 'true' ? note : undefined,
        themes: token.themes
    };
};

export const readTokens = (pkg: PackageRef | undefined): SourceResult<ThemedToken[]> => {
    if (!pkg) {
        return {
            ok: false,
            reason: '@koobiq/design-tokens is not installed in this project',
            hint: 'Install it, or browse the tokens at ' + DOCS_HINT
        };
    }

    const exact = READERS.get(pkg.major);
    const reader = exact ?? READERS.get(NEWEST_KNOWN_MAJOR)!;
    const collected = new Map<string, RawToken>();
    const missing: string[] = [];

    for (const file of reader.files) {
        const path = join(pkg.root, file.path);

        if (!existsSync(path)) {
            missing.push(file.path);
            continue;
        }

        parseCss(readFileSync(path, 'utf-8'), file.theme, collected);
    }

    if (collected.size === 0) {
        return {
            ok: false,
            reason: `@koobiq/design-tokens@${pkg.version}: no --kbq-* declarations found (missing: ${missing.join(', ') || 'none'})`,
            hint: `This server knows up to major ${NEWEST_KNOWN_MAJOR}. Token names must be taken from ${DOCS_HINT}`
        };
    }

    const notes: string[] = [];

    if (!exact) {
        notes.push(
            `read with the major ${NEWEST_KNOWN_MAJOR} reader; @koobiq/design-tokens@${pkg.version} is newer than this server knows`
        );
    }

    if (missing.length > 0) notes.push(`could not read ${missing.join(', ')}`);

    return {
        ok: true,
        version: pkg.version,
        readerMajor: exact ? pkg.major : NEWEST_KNOWN_MAJOR,
        degraded: notes.length > 0 ? notes.join('; ') : undefined,
        data: [...collected.values()].map((token) => resolveToken(token, collected))
    };
};
