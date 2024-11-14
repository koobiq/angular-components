import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import chalk from 'chalk';
import * as path from 'path';

import { setupOptions } from '../../utils/package-config';
import { colorsVarsReplacement, ReplaceData, typographyCssSelectorsReplacement } from './data';
import { Schema } from './schema';

const { italic, blue, bold } = chalk;

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

        const getDeprecatedFrom = (content: string, replacementInfo: ReplaceData[]) => {
            return replacementInfo.filter(({ replace }) => new RegExp(`\\b${replace}\\b`, 'g').exec(content));
        };

        const handleReplacements = (newContent: string | undefined, path: Path) => {
            if (fix) {
                typographyCssSelectorsReplacement.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(`\\b${replace}\\b`, 'g'), replaceWith);
                });
            } else {
                const foundSelectors = getDeprecatedFrom(newContent!, typographyCssSelectorsReplacement);
                if (foundSelectors.length) {
                    logger.warn(getTypographyReplacements(path, foundSelectors));
                }
            }

            // Just suggest about colors replacements without changing file,
            // since it's potentially a complex task to handle
            const foundColors = getDeprecatedFrom(newContent!, colorsVarsReplacement);
            if (foundColors.length) {
                logger.warn(getBaseReplacements(path, foundColors));
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
                    newContent = handleReplacements(newContent, path);

                    if (initialContent !== newContent) {
                        tree.overwrite(path, newContent || '');
                    }
                }
            }
        });
    };
}

function getBaseReplacements(filePath: Path, foundSelectors: ReplaceData[]) {
    const parsedFilePath = path.relative(__dirname, `.${filePath}`);
    return `
-------------------------
Please pay attention! Found deprecated сss-selectors in file: 
${bold(italic(blue(parsedFilePath.replace(/\\/g, '/'))))}
Replace with specified rules: 
${foundSelectors.map(({ replace, replaceWith }) => `\t${replace} -> \t${replaceWith}`).join('\n')}
-------------------------
    `;
}

function getTypographyReplacements(filePath: Path, foundSelectors: ReplaceData[]) {
    const baseMessage = getBaseReplacements(filePath, foundSelectors);
    return `${baseMessage}\n
Or use ${bold(italic('--fix=true'))} to replace automatically
Pay attention: overwriting is possible. Check the code after automatic replacement was done.
-------------------------
    `;
}
