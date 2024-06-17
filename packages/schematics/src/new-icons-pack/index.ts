import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';

import { newIconsPackData, ReplaceData } from './data';
import { Schema } from './schema';
import { LoggerApi } from '@angular-devkit/core/src/logger';

const data = newIconsPackData;

export default function newIconsPack(options: Schema): Rule {
    const breakingIconsVersion = '^8.0.0-beta.2';
    const pkg = '@koobiq/kbq-icons';
    const iconReplacements: ReplaceData[] = [
        { replace: 'kbq-icon="mc-', replaceWith: 'kbq-icon="kbq-' },
        { replace: 'kbq-icon-item="mc-', replaceWith: 'kbq-icon-item="kbq-' },
        { replace: 'kbq-icon-button="mc-', replaceWith: 'kbq-icon-button="kbq-' },
        { replace: 'class="mc kbq-icon mc-', replaceWith: 'class="kbq kbq-icon kbq-' },
        { replace: '\\[class\\.mc\\]="', replaceWith: '\[class\.kbq\]="' },
        { replace: '\'mc-', replaceWith: '\'kbq-' }
    ];

    return async (tree: Tree, context: SchematicContext) => {
        const { logger } = context;

        // Check if breaking version is used indeed
        if (tree.exists('package.json')) {
            const sourceText = tree.read('package.json')!.toString('utf-8');
            const json: Partial<{ devDependencies: any; dependencies: any }> = JSON.parse(sourceText);

            const isIconsBreakingVersionUsed = ['devDependencies', 'dependencies', 'peerDependencies']
                .some((type) => json[type] && json[type][pkg] && json[type][pkg] === breakingIconsVersion);

            if (!isIconsBreakingVersionUsed) {
                logger.warn('Breaking version of icons is not used. Everything is OK.');
                return;
            }
        }
        // Update templates & components
        tree.visit((path: Path, entry) => {
            if (path.endsWith('.html') || path.endsWith('.ts')) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    iconReplacements.forEach(({ replace, replaceWith }) => {
                        newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                    });
                    // replace deprecated icons with new

                    if (options.fix) {
                        data.forEach(({ replace, replaceWith }) => {
                            newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                        });
                    } else {
                        const foundIcons = data
                            .filter(({ replace }) => newContent!.indexOf(replace) !== -1);
                        showWarning(path, foundIcons, logger);
                    }

                    if (initialContent !== newContent) {
                        tree.overwrite(path, newContent || '');
                    }
                }

            }
        });

        // update styles
        tree.visit((path: Path, entry) => {
            // styles
            if (path.endsWith(options.stylesExt)) {
                const initialContent = entry?.content.toString();
                let newContent = initialContent;

                if (newContent) {
                    // replace icons in inline templates
                    newContent = newContent
                        .replace(new RegExp(`@koobiq/icons`, 'g'), pkg)
                        .replace(new RegExp('mc-', 'g'), 'kbq-');

                    // replace deprecated icons with new
                    if (options.fix) {
                        data.forEach(({ replace, replaceWith }) => {
                            newContent = newContent!.replace(new RegExp(replace, 'g'), replaceWith);
                        });
                    } else {
                        const foundIcons = data
                            .filter(({ replace }) => newContent!.indexOf(replace) !== -1);
                        showWarning(path, foundIcons, logger);
                    }
                }

                if (initialContent !== newContent) {
                    tree.overwrite(path, newContent || '');
                }
            }
        });
    };
}

function showWarning (path, foundIcons: ReplaceData[], logger: LoggerApi) {
    if (foundIcons.length) {
        logger.warn('-------------------------');
        logger.warn(`Please pay attention! Found deprecated icons in file ${ path }: `);
        logger.warn(foundIcons.map(({ replace }) =>`\t${replace}`).join('\n'));
        logger.warn('-------------------------');
    }
}
