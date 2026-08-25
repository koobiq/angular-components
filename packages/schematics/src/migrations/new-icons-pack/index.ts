import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import * as path from 'path';

import { migrateTemplateWithTransform } from '../../utils/angular-parsing';
import {
    buildIconTokenMap,
    buildIconTokenPatterns,
    createIconTemplateTransform,
    IconMigrationData,
    migrateIconsInTsFiles,
    replaceKnownIconTokens,
    TokenReplacement
} from '../../utils/icon-migration';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { newIconsPackData, ReplaceData, scope } from './data';
import { Schema } from './schema';

function readJsonFile<T>(filePath: string): T {
    const absolutePath = path.resolve(filePath);
    const fileContents = fs.readFileSync(absolutePath, 'utf-8');

    return JSON.parse(fileContents) as T;
}

// A bare word: no leading/trailing hyphen, no empty hyphen-separated segment (rejects e.g. `mc-`,
// which is otherwise the most natural — and wrong, per the new engine's key-building — way to
// write a "prefix" pair).
const BARE_SCOPE_WORD = /^\w+(-\w+)*$/;

/** `newIconsPackData`/`migration.json` always author their `replace`/`replaceWith` pair under
 *  this literal scope — independent of whatever scope the user is migrating *to* via
 *  `customIconReplacementPath` — so it's always the first prefix stripped. */
const CANONICAL_ICON_DATA_SCOPE = 'kbq';

/** Strips a known scope prefix (e.g. `mc-`/`kbq-`) from a token, if present. */
function stripScopePrefix(value: string, prefixes: string[]): string {
    for (const prefix of prefixes) {
        if (value.startsWith(`${prefix}-`)) {
            return value.slice(prefix.length + 1);
        }
    }

    return value;
}

function isBareScopePair(entry: ReplaceData): boolean {
    return (
        typeof entry?.replace === 'string' &&
        typeof entry?.replaceWith === 'string' &&
        BARE_SCOPE_WORD.test(entry.replace) &&
        BARE_SCOPE_WORD.test(entry.replaceWith)
    );
}

/**
 * Resolves the scope pair from a `customIconReplacementPath` file: a bare scope-word pair (e.g.
 * `{ "replace": "mc", "replaceWith": "kbq" }`). A legacy-shaped or malformed entry is detected and
 * warned about instead of silently misapplied — or crashed on.
 */
function resolveScope(
    entries: ReplaceData[],
    fallback: { from: string; to: string },
    logger: { warn(message: string): void }
): { from: string; to: string } {
    if (!Array.isArray(entries)) {
        logger.warn(
            'customIconReplacementPath must contain a JSON array of { "replace", "replaceWith" } entries. ' +
                'Falling back to the default scope.'
        );

        return fallback;
    }

    const valid = entries.find(isBareScopePair);

    if (!valid) {
        if (entries.length) {
            logger.warn(
                'customIconReplacementPath entries look like the legacy fragment format and were ignored. ' +
                    'See new-icons-pack/README.md for the new expected shape (e.g. { "replace": "mc", "replaceWith": "kbq" }).'
            );
        }

        return fallback;
    }

    return { from: valid.replace, to: valid.replaceWith };
}

export default function newIconsPack(options: Schema): Rule {
    let targetDir: Tree | DirEntry;

    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt, updatePrefix = true, customDataPath, customIconReplacementPath } = options;
        const { logger } = context;

        const resolvedData = customDataPath ? readJsonFile<ReplaceData[]>(customDataPath) : newIconsPackData;
        const resolvedScope = customIconReplacementPath
            ? resolveScope(readJsonFile<ReplaceData[]>(customIconReplacementPath), scope, logger)
            : scope;

        try {
            const projectDefinition = await setupOptions(project, tree);

            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch {
            targetDir = tree;
        }

        const migrationData: IconMigrationData = {
            valueAttrs: ['kbq-icon', 'kbq-icon-item', 'kbq-icon-button'],
            scope: resolvedScope,
            scopeClassInList: 'rename',
            // `replace`/`replaceWith` are always authored under `CANONICAL_ICON_DATA_SCOPE`
            // ('kbq-'), regardless of the scope this run is migrating *to* — falls back to
            // stripping the target scope for a custom data file that doesn't follow that
            // convention.
            icons: resolvedData.map(({ replace, replaceWith }) => ({
                from: stripScopePrefix(replace, [CANONICAL_ICON_DATA_SCOPE, resolvedScope.to, resolvedScope.from]),
                to: stripScopePrefix(replaceWith, [CANONICAL_ICON_DATA_SCOPE, resolvedScope.to])
            })),
            // Only the attribute-value path (`kbq-icon="mc-<anything>"`) rescopes suffixes that
            // aren't a known icon name; class lists/bindings/strings/styles stay exact-token-only.
            // This runs unconditionally in templates/TS — `updatePrefix` only gates the bare
            // scope-word rename in the (separate, unscoped-by-nature) styles/markdown pass below.
            rescopeUnknownValues: true
        };

        const tokenMap = buildIconTokenMap(migrationData);
        // Icon-name renames (e.g. `mc-add-to-list_16` / `kbq-add-to-list_16` -> the current
        // `kbq-file-plus-o_16`) apply to styles/markdown regardless of `updatePrefix` — only the
        // *bare* scope-word rename (`mc` -> `kbq`, which touches `$mc`/`@import 'mc'` as much as a
        // real `.mc {}` selector) is gated by it, matching the option's historical scope.
        const styleAndMarkdownTokenMap = updatePrefix
            ? tokenMap
            : new Map([...tokenMap].filter(([token]) => token !== resolvedScope.from));
        // Precompiled once and reused across every relevant file below, instead of rebuilding
        // ~1000+ regexes per file. Inline `styles` arrays inside `.ts` files use the unfiltered
        // `tokenMap` (matching `migrateIconsInTsFiles`'s pre-existing behavior); real `.scss`/`.md`
        // files use `styleAndMarkdownTokenMap`, which additionally respects `updatePrefix`.
        const tsInlineStylePatterns = buildIconTokenPatterns(tokenMap, resolvedScope.from);
        const stylePatterns = buildIconTokenPatterns(styleAndMarkdownTokenMap, resolvedScope.from);

        const onFound = (filePath: string, found: TokenReplacement[]) => {
            const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

            logMessage(logger, [
                `Please pay attention! Found deprecated icons in file: `,
                parsedFilePath,
                found.map(({ from, to }) => `\t${from} -> \t${to}`).join('\n')
            ]);
        };
        const warn = (message: string) => logger.warn(message);

        const templatePaths: string[] = [];
        const tsPaths: string[] = [];
        const markdownPaths: string[] = [];

        // Update templates & components
        targetDir.visit((filePath: Path) => {
            // if project property not provided, skip files in node_modules & dist
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) {
                return;
            }

            if (filePath.endsWith('.html')) {
                templatePaths.push(filePath);
            } else if (
                filePath.endsWith('.ts') &&
                !filePath.endsWith('.d.ts') &&
                !filePath.endsWith('.ngtypecheck.ts')
            ) {
                tsPaths.push(filePath);
            } else if (filePath.endsWith('.md')) {
                markdownPaths.push(filePath);
            }
        });

        await migrateTemplateWithTransform(
            tree,
            templatePaths,
            context,
            createIconTemplateTransform(migrationData, tokenMap, { fix, onFound, warn })
        );

        await migrateIconsInTsFiles(
            tree,
            tsPaths,
            context,
            migrationData,
            tokenMap,
            { fix, onFound, warn },
            tsInlineStylePatterns
        );

        // Markdown docs have no AST here, so — like styles — they're matched with the same
        // word/selector-boundary-safe, known-token-only regex rather than an unscoped replace.
        for (const filePath of markdownPaths) {
            const initialContent = tree.read(filePath)?.toString();

            if (!initialContent) {
                continue;
            }

            const { content, changed, found } = replaceKnownIconTokens(initialContent, stylePatterns, fix);

            if (found.length && !fix) {
                onFound(filePath, found);
            }

            if (changed) {
                tree.overwrite(filePath, content);
            }
        }

        // update styles — icon-name renames always apply; `updatePrefix` only adds the bare
        // scope-word rename (see `styleAndMarkdownTokenMap` above).
        targetDir.visit((filePath: Path) => {
            // if project property not provided, styles in node_modules are still skipped, same as
            // every other file type above
            if (filePath.includes('node_modules')) {
                return;
            }

            if (!filePath.endsWith(stylesExt)) {
                return;
            }

            const initialContent = tree.read(filePath)?.toString();

            if (!initialContent) {
                return;
            }

            const { content, changed, found } = replaceKnownIconTokens(initialContent, stylePatterns, fix);

            if (found.length && !fix) {
                onFound(filePath, found);
            }

            if (changed) {
                tree.overwrite(filePath, content);
            }
        });
    };
}
