import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import chalk from 'chalk';
import * as path from 'path';

import { LoggerApi } from '@angular-devkit/core/src/logger';
import { setupOptions } from '../utils/package-config';
import { ReplaceData, iconReplacements, newIconsPackData } from './data';
import { Schema } from './schema';

const { italic, blue, bold } = chalk;

const data = newIconsPackData;

export default function newIconsPack(options: Schema): Rule {
    let targetDir: Tree | DirEntry;
    const breakingIconsVersionRegExp = /^\^|\~?8\.0\.2/;
    const pkg = '@koobiq/icons';

    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt } = options;
        try {
            const projectDefinition = await setupOptions(project, tree);
            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch (e) {
            targetDir = tree;
        }

        const { logger } = context;
        const handleDeprecatedIcons = (newContent: string | undefined, path: Path) => {
            if (fix) {
                data.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                });
            } else {
                const foundIcons = data.filter(({ replace }) => newContent!.indexOf(replace) !== -1);
                if (foundIcons.length) {
                    showWarning(path, foundIcons, logger);
                }
            }
            return newContent;
        };

        // Check if breaking version is used indeed
        if (tree.exists('package.json')) {
            const sourceText = tree.read('package.json')!.toString('utf-8');
            const json: Partial<{ devDependencies: any; dependencies: any }> = JSON.parse(sourceText);

            const isIconsBreakingVersionUsed = ['devDependencies', 'dependencies', 'peerDependencies'].some(
                (type) => json[type] && json[type][pkg] && breakingIconsVersionRegExp.test(json[type][pkg])
            );

            if (!isIconsBreakingVersionUsed) {
                logger.warn('Breaking version of icons is not used. Everything is OK.');
                return;
            }
        }

        // Update templates & components
        targetDir.visit((path: Path, entry) => {
            // if project property not provided, provide node_modules to be changed
            if (path.includes('node_modules')) {
                return;
            }

            if (path.endsWith('.html') || path.endsWith('.ts')) {
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
                    // replace icons in styles, update pkg name
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

function showWarning(filePath: Path, foundIcons: ReplaceData[], logger: LoggerApi) {
    logger.warn('-------------------------');
    logger.warn(`Please pay attention! Found deprecated icons in file: `);
    logger.info(`${bold(italic(blue(path.resolve(`.${filePath}`))))}`);
    logger.warn(foundIcons.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n'));
    logger.warn('-------------------------');
}
