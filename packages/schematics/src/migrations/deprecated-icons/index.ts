import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
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
import { iconsMapping, scope } from './data';
import { Schema } from './schema';

const iconsFontImportRule = "@use '@koobiq/icons/fonts/kbq-icons';";

const migrationData: IconMigrationData = {
    valueAttrs: ['kbq-icon', 'kbq-icon-item', 'kbq-icon-button'],
    scope,
    scopeClassInList: 'remove',
    icons: iconsMapping.map(({ replace, replaceWith }) => ({ from: replace, to: replaceWith })),
    rescopeUnknownValues: true
};

export default function deprecatedIcons(options: Schema): Rule {
    let targetDir: Tree | DirEntry;

    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt } = options;

        try {
            const projectDefinition = await setupOptions(project, tree);

            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch {
            targetDir = tree;
        }

        const { logger } = context;
        const tokenMap = buildIconTokenMap(migrationData);
        // Unlike a `class` list (where the bare scope token is simply dropped, e.g.
        // `class="pt-icons"` -> `class=""`), a stylesheet selector renames the scope class itself
        // (e.g. `.pt-icons` -> `.kbq`) rather than removing it.
        const styleTokenMap = new Map(tokenMap).set(migrationData.scope.from, migrationData.scope.to);

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
        const stylePaths: string[] = [];

        // if project property not provided, skip files in node_modules & dist
        targetDir.visit((filePath: Path) => {
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
            } else if (filePath.endsWith(stylesExt)) {
                stylePaths.push(filePath);
            }
        });

        // Update external html
        await migrateTemplateWithTransform(
            tree,
            templatePaths,
            context,
            createIconTemplateTransform(migrationData, tokenMap, { fix, onFound, warn })
        );

        // Update inline html & bare string literals in components
        const sourceFiles = tsPaths.map((filePath) =>
            ts.createSourceFile(filePath, tree.readText(filePath), ts.ScriptTarget.Latest, true)
        );

        await migrateIconsInTsFiles(
            tree,
            sourceFiles,
            context,
            migrationData,
            tokenMap,
            { fix, onFound, warn },
            styleTokenMap
        );

        // Update styles
        for (const filePath of stylePaths) {
            const initialContent = tree.read(filePath)?.toString();

            if (!initialContent) {
                continue;
            }

            const { content, changed, found } = replaceKnownIconTokens(
                initialContent,
                styleTokenMap,
                fix,
                migrationData.scope.from
            );

            if (found.length && !fix) {
                onFound(filePath, found);
            }

            if (changed) {
                tree.overwrite(filePath, content);
            }
        }

        // check if icon styles from new scope should be included in styles file
        targetDir.visit((filePath: Path, entry) => {
            if (filePath.endsWith(stylesExt) && !entry?.content.toString()?.includes(iconsFontImportRule)) {
                const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

                logMessage(logger, [
                    parsedFilePath,
                    `Provide \`${iconsFontImportRule}\` to support icon styles from new scope`
                ]);
            }
        });
    };
}
