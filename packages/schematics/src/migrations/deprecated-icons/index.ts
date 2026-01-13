import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'path';

import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { iconClassReplacements, iconsMapping } from './data';
import { Schema } from './schema';

const iconsFontImportRule = "@use '@koobiq/icons/fonts/kbq-icons';";

export default function deprecatedIcons(options: Schema): Rule {
    let targetDir: Tree | DirEntry;

    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt } = options;

        try {
            const projectDefinition = await setupOptions(project, tree);

            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch (e) {
            targetDir = tree;
        }

        const { logger } = context;
        const handleDeprecatedIcons = (newContent: string | undefined, filePath: Path) => {
            if (fix) {
                iconsMapping.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(`kbq-${replace}`, 'g'), `kbq-${replaceWith}`);
                });
            } else {
                const foundIcons = iconsMapping.filter(({ replace }) => newContent!.indexOf(replace) !== -1);

                if (foundIcons.length) {
                    const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

                    logMessage(logger, [
                        `Please pay attention! Found deprecated icons in file: `,
                        parsedFilePath,
                        foundIcons.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n')
                    ]);
                }
            }

            return newContent;
        };

        // Update styles, templates & components
        targetDir.visit((filePath: Path, entry) => {
            let initialContent: string | undefined;

            // if project property not provided, skip files in node_modules & dist
            if (filePath.includes('node_modules') || filePath.includes('dist')) {
                return;
            }

            if (filePath.endsWith('.html') || filePath.endsWith('.ts') || filePath.endsWith(stylesExt)) {
                initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    iconClassReplacements.forEach(({ replace, replaceWith }) => {
                        newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                    });

                    newContent = handleDeprecatedIcons(newContent, filePath);

                    if (initialContent !== newContent) {
                        tree.overwrite(filePath, newContent || '');
                    }
                }
            }
        });

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
