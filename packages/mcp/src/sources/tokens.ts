import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignToken, SourceResult } from '../types.js';
import type { PackageRef } from './project.js';

/**
 * Reads design tokens out of the consumer's own `@koobiq/design-tokens`.
 *
 * The compiled CSS is the source, not the `properties/*.json5` behind it: the CSS carries the
 * final custom-property names, the resolved values and the `DEPRECATED` marker, so nothing has to
 * reproduce the token build's naming transform. The json5 sources would add the reference chain
 * (`{plt.slate.1}`) and nothing else — see TODO.md.
 */

export type TokenTheme = 'light' | 'dark' | 'font';

export type ThemedToken = DesignToken & { themes: TokenTheme[] };

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
    ]
]);

const NEWEST_KNOWN_MAJOR = Math.max(...READERS.keys());

const DOCS_HINT = 'https://koobiq.io/en/tokens';

const DECLARATION = /^\s*(--kbq-[a-z0-9-]+)\s*:\s*([^;]+);\s*(?:\/\*\s*([^*]*?)\s*\*\/)?/i;
const VAR_REFERENCE = /var\(\s*(--[a-z0-9-]+)/gi;

const parseCss = (css: string, theme: TokenTheme, into: Map<string, ThemedToken>): void => {
    for (const line of css.split('\n')) {
        const match = DECLARATION.exec(line);

        if (!match) continue;

        const [, cssName, rawValue, comment] = match as unknown as [string, string, string, string | undefined];
        const value = rawValue.trim();
        const references = [...value.matchAll(VAR_REFERENCE)].map((m) => m[1]!);
        const existing = into.get(cssName);

        if (existing) {
            if (!existing.themes.includes(theme)) existing.themes.push(theme);
            continue;
        }

        const deprecation = /^DEPRECATED:\s*(.*)$/i.exec((comment ?? '').trim());
        const note = deprecation?.[1]?.trim();

        into.set(cssName, {
            cssName,
            path: cssName.replace(/^--kbq-/, '').replace(/-/g, '.'),
            value,
            references: references.length > 0 ? references : undefined,
            deprecated: deprecation ? true : undefined,
            // `true` carries nothing; anything else is the package telling the caller what to do.
            deprecationNote: note && note !== 'true' ? note : undefined,
            themes: [theme]
        });
    }
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
    const collected = new Map<string, ThemedToken>();
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
        data: [...collected.values()]
    };
};
