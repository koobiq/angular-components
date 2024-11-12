import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import chalk from 'chalk';
import * as path from 'path';

import { LoggerApi } from '@angular-devkit/core/src/logger';
import { setupOptions } from '../../utils/package-config';
import { ReplaceData, cssSelectorsReplacement } from './data';
import { Schema } from './schema';

const { italic, blue, bold } = chalk;

const data = cssSelectorsReplacement;

export default function cssSelectors(options: Schema): Rule {
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
        const handleCssSelectors = (newContent: string | undefined, path: Path) => {
            if (fix) {
                data.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(`\\b${replace}\\b`, 'g'), replaceWith);
                });
            } else {
                const foundSelectors = data.filter(({ replace }) =>
                    new RegExp(`\\b${replace}\\b`, 'g').exec(newContent!)
                );
                if (foundSelectors.length) {
                    showWarning(path, foundSelectors, logger);
                }
            }
            return newContent;
        };

        // Update templates & components & styles
        targetDir.visit((path: Path, entry) => {
            // if project property not provided, provide node_modules to be changed
            if (path.includes('node_modules')) return;

            if (path.endsWith('.html') || path.endsWith('.ts') || path.endsWith(stylesExt)) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    newContent = handleCssSelectors(newContent, path);

                    if (initialContent !== newContent) {
                        tree.overwrite(path, newContent || '');
                    }
                }
            }
        });
    };
}

function showWarning(filePath: Path, foundSelectors: ReplaceData[], logger: LoggerApi) {
    logger.warn('-------------------------');
    logger.warn(`Please pay attention! Found deprecated сss-selectors in file: `);
    logger.info(`${bold(italic(blue(path.resolve(`.${filePath}`).replace(/\\/g, '/'))))}`);
    logger.warn(`Replace with specified rules: `);
    logger.warn(foundSelectors.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n'));
    logger.warn(`Or use ${bold(italic('--fix=true'))} to replace automatically`);
    logger.warn('Pay attention: overwriting is possible. Check the code after automatic replacement was done.');
    logger.warn('-------------------------');
}
