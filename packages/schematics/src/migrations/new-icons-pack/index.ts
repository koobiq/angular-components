import { Path } from '@angular-devkit/core';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import * as path from 'path';

import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { iconReplacements, newIconsPackData, ReplaceData } from './data';
import { Schema } from './schema';

function readJsonFile<T>(filePath: string): T {
    const absolutePath = path.resolve(filePath);
    const fileContents = fs.readFileSync(absolutePath, 'utf-8');

    return JSON.parse(fileContents) as T;
}

export default function newIconsPack(options: Schema): Rule {
    let targetDir: Tree | DirEntry;

    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix, stylesExt, updatePrefix = true, customDataPath, customIconReplacementPath } = options;

        const resolvedData = customDataPath ? readJsonFile<ReplaceData[]>(customDataPath) : newIconsPackData;
        const resolvedIconsReplacements = customIconReplacementPath
            ? readJsonFile<ReplaceData[]>(customIconReplacementPath)
            : iconReplacements;

        try {
            const projectDefinition = await setupOptions(project, tree);

            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch (e) {
            targetDir = tree;
        }

        const { logger } = context;
        const handleDeprecatedIcons = (newContent: string | undefined, filePath: Path) => {
            if (fix) {
                resolvedData.forEach(({ replace, replaceWith }) => {
                    newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                });
            } else {
                const foundIcons = resolvedData.filter(({ replace }) => newContent!.indexOf(replace) !== -1);

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
                    resolvedIconsReplacements.forEach(({ replace, replaceWith }) => {
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
                    if (updatePrefix) {
                        newContent = newContent.replace(new RegExp('mc-', 'g'), 'kbq-');
                    }

                    newContent = handleDeprecatedIcons(newContent, path);
                }

                if (initialContent !== newContent) {
                    tree.overwrite(path, newContent || '');
                }
            }
        });
    };
}
