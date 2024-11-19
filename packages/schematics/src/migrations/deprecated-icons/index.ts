import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'path';

import { setupOptions } from '../../utils/package-config';
import { iconClassReplacements, iconsMapping } from './data';
import { Schema } from './schema';

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
                    logger.warn('-------------------------');
                    logger.warn(`Please pay attention! Found deprecated icons in file: `);
                    logger.info(`${parsedFilePath}`);
                    logger.warn(
                        foundIcons.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n')
                    );
                    logger.warn('-------------------------');
                }
            }
            return newContent;
        };

        // Update styles, templates & components
        targetDir.visit((path: Path, entry) => {
            // if project property not provided, skip path from node_modules
            if (path.includes('node_modules')) {
                return;
            }

            if (path.endsWith('.html') || path.endsWith('.ts') || path.endsWith(stylesExt)) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    iconClassReplacements.forEach(({ replace, replaceWith }) => {
                        newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                    });

                    newContent = handleDeprecatedIcons(newContent, path);

                    if (initialContent !== newContent) {
                        tree.overwrite(path, newContent || '');
                    }
                }
            }
        });
    };
}
