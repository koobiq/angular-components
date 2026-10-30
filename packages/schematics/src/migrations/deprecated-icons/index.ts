import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
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
import { resolveTargetDir } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { iconsMapping, scope } from './data';
import { Schema } from './schema';

const iconsFontImportRule = "@use '@koobiq/icons/fonts/kbq-icons';";

const migrationData: IconMigrationData = {
    valueAttrs: ['kbq-icon', 'kbq-icon-item', 'kbq-icon-button'],
    scope,
    // The bare `pt-icons` class becomes `kbq`, the base class of the icon font, so a plain
    // `<i class="pt-icons pt-icons-<name>">` keeps its styles without the `kbq-icon` directive. An
    // element with the directive gets `kbq` from it, so there the class is dropped.
    scopeClassInList: 'rename',
    scopeClassOnIconHost: 'remove',
    icons: iconsMapping.map(({ replace, replaceWith }) => ({ from: replace, to: replaceWith })),
    rescopeUnknownValues: true
};

export default function deprecatedIcons(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt } = options;
        const targetDir = await resolveTargetDir(project, tree);

        const { logger } = context;
        const tokenMap = buildIconTokenMap(migrationData);
        // Precompiled once and reused across every .ts/style file below, instead of rebuilding
        // every regex per file.
        const stylePatterns = buildIconTokenPatterns(tokenMap, migrationData.scope.from);

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

        visitProjectFiles(targetDir, (filePath: Path) => {
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
        await migrateIconsInTsFiles(
            tree,
            tsPaths,
            context,
            migrationData,
            tokenMap,
            { fix, onFound, warn },
            stylePatterns
        );

        // Update styles
        for (const filePath of stylePaths) {
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

        // check if icon styles from new scope should be included in styles file
        visitProjectFiles(targetDir, (filePath: Path, entry) => {
            if (filePath.endsWith(stylesExt) && !entry.content.toString()?.includes(iconsFontImportRule)) {
                const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

                logMessage(logger, [
                    parsedFilePath,
                    `Provide \`${iconsFontImportRule}\` to support icon styles from new scope`
                ]);
            }
        });
    };
}
