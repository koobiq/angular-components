import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

import { migrateTemplateWithTransform } from '../../utils/angular-parsing';
import {
    buildIconTokenMap,
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

const BARE_SCOPE_WORD = /^[\w-]+$/;

/** Strips a known scope prefix (e.g. `mc-`/`kbq-`) from a token, if present. */
function stripScopePrefix(value: string, prefixes: string[]): string {
    for (const prefix of prefixes) {
        if (value.startsWith(`${prefix}-`)) {
            return value.slice(prefix.length + 1);
        }
    }

    return value;
}

/**
 * `customIconReplacementPath` historically accepted whole-file regex fragments (e.g.
 * `kbq-icon="mc-`), which only made sense for the old blind-text-replace engine. The new engine
 * only needs a bare scope-word pair (e.g. `{ "replace": "mc", "replaceWith": "kbq" }`). Detects
 * legacy-shaped entries and warns instead of silently misapplying them.
 */
function resolveScope(
    entries: ReplaceData[],
    fallback: { from: string; to: string },
    logger: { warn(message: string): void }
): { from: string; to: string } {
    const valid = entries.find(
        ({ replace, replaceWith }) => BARE_SCOPE_WORD.test(replace) && BARE_SCOPE_WORD.test(replaceWith)
    );

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
            icons: resolvedData.map(({ replace, replaceWith }) => ({
                from: stripScopePrefix(replace, [resolvedScope.from, resolvedScope.to]),
                to: stripScopePrefix(replaceWith, [resolvedScope.to])
            })),
            // Only the attribute-value path (`kbq-icon="mc-<anything>"`) rescopes suffixes that
            // aren't a known icon name; class lists/bindings/strings/styles stay exact-token-only.
            // This runs unconditionally in templates/TS — `updatePrefix` only gates the (separate,
            // unscoped-by-nature) styles pass below.
            rescopeUnknownValues: true
        };

        const tokenMap = buildIconTokenMap(migrationData);

        const onFound = (filePath: string, found: TokenReplacement[]) => {
            const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

            logMessage(logger, [
                `Please pay attention! Found deprecated icons in file: `,
                parsedFilePath,
                found.map(({ from, to }) => `\t${from} -> \t${to}`).join('\n')
            ]);
        };

        const templatePaths: string[] = [];
        const tsPaths: string[] = [];
        const markdownPaths: string[] = [];

        // Update templates & components
        targetDir.visit((filePath: Path) => {
            // if project property not provided, skip files in node_modules & dist
            if (filePath.includes('node_modules') || filePath.includes('dist')) {
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
            createIconTemplateTransform(migrationData, tokenMap, { fix, onFound })
        );

        const sourceFiles = tsPaths.map((filePath) =>
            ts.createSourceFile(filePath, tree.readText(filePath), ts.ScriptTarget.Latest, true)
        );

        await migrateIconsInTsFiles(tree, sourceFiles, context, migrationData, tokenMap, { fix, onFound });

        // Markdown docs have no AST here, so — like styles — they're matched with the same
        // word/selector-boundary-safe, known-token-only regex rather than an unscoped replace.
        for (const filePath of markdownPaths) {
            const initialContent = tree.read(filePath)?.toString();

            if (!initialContent) {
                continue;
            }

            const { content, changed, found } = replaceKnownIconTokens(initialContent, tokenMap, fix);

            if (found.length && !fix) {
                onFound(filePath, found);
            }

            if (changed) {
                tree.overwrite(filePath, content);
            }
        }

        // update styles
        if (updatePrefix) {
            targetDir.visit((filePath: Path) => {
                // if project property not provided, styles in node_modules are still updated
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

                const { content, changed, found } = replaceKnownIconTokens(initialContent, tokenMap, fix);

                if (found.length && !fix) {
                    onFound(filePath, found);
                }

                if (changed) {
                    tree.overwrite(filePath, content);
                }
            });
        }
    };
}
