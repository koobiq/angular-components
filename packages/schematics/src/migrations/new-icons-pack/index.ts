import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'path';

import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { iconReplacements, newIconsPackData } from './data';
import { Schema } from './schema';

const data = newIconsPackData;

export default function newIconsPack(options: Schema): Rule {
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
                data.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(`kbq-${replace}`, 'g'), `kbq-${replaceWith}`);
                });
            } else {
                const foundIcons = data.filter(({ replace }) => newContent!.indexOf(replace) !== -1);
                if (foundIcons.length) {
                    const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');
                    logMessage(logger, () => {
                        logger.warn(`Please pay attention! Found deprecated icons in file: `);
                        logger.info(parsedFilePath);
                        logger.warn(
                            foundIcons.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n')
                        );
                    });
                }
            }
            return newContent;
        };

        // Update templates & components
        targetDir.visit((path: Path, entry) => {
            // if project property not provided, skip files in node_modules & dist
            if (path.includes('node_modules') || path.includes('dist')) {
                return;
            }

            if (path.endsWith('.html') || path.endsWith('.ts') || path.endsWith('.md')) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    iconReplacements.forEach(({ replace, replaceWith }) => {
                        newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                    });

                    newContent = handleDeprecatedIcons(newContent, path);

                    if (initialContent !== newContent) {
                        tree.overwrite(path, newContent || '');
                    }
                }
            }
        });

        // update styles
        targetDir.visit((path: Path, entry) => {
            // if project property not provided, provide node_modules to be changed
            if (path.includes('node_modules')) {
                return;
            }

            if (path.endsWith(stylesExt)) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    // replace icons in styles
                    newContent = newContent.replace(new RegExp('mc-', 'g'), 'kbq-');

                    newContent = handleDeprecatedIcons(newContent, path);
                }

                if (initialContent !== newContent) {
                    tree.overwrite(path, newContent || '');
                }
            }
        });
    };
}
