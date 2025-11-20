import { Path } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import path from 'path';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { Replacement, TransformTemplateAttributesResult } from '../../utils/typescript';
import { iconReplacementData } from './data';
import { Schema } from './schema';

export const replaceIcons = (contentToBeUpdated: string, replacementData: Replacement[]) => {
    let res = contentToBeUpdated;

    for (const { from, to } of replacementData) {
        res = res!.replace(new RegExp(`kbq-${from}`, 'g'), `kbq-${to}`);
    }

    return res;
};

export const logReplacement = ({ logger, replacementData, contentToBeUpdated, filePath }): void => {
    const foundIcons = replacementData.filter(({ from }) => contentToBeUpdated!.indexOf(from) !== -1);

    if (foundIcons.length) {
        const parsedFilePath = path.relative(__dirname, `.${filePath}`).replace(/\\/g, '/');

        logMessage(logger, [
            `Please pay attention! Found deprecated icons in file: `,
            parsedFilePath,
            foundIcons.map(({ from, to }) => `\t${from} -> \t${to}`).join('\n')]);
    }
};

const processIconReplacement = ({ fileContent, filePath, fix, logger }): TransformTemplateAttributesResult => {
    if (fix) {
        const updatedContent = replaceIcons(fileContent!, iconReplacementData);

        return { fileContent: updatedContent, changed: updatedContent !== fileContent, errors: [] };
    } else {
        logReplacement({
            logger,
            replacementData: iconReplacementData,
            contentToBeUpdated: fileContent,
            filePath
        });

        return { fileContent, changed: false, errors: [] };
    }
};

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { logger } = context;
        const { project, allowed, fix } = options;

        const projectDefinition = await setupOptions(project, tree);

        tree.getDir(projectDefinition!.root).visit((filePath: Path, entry) => {
            if (allowed.length === 0 || allowed.some((ext) => filePath.endsWith(ext))) {
                const initialContent = entry?.content.toString();

                if (!initialContent) return;

                const { fileContent, changed } = processIconReplacement({
                    fileContent: initialContent,
                    filePath,
                    fix,
                    logger
                });

                if (changed) {
                    tree.overwrite(filePath, fileContent);
                }
            }
        });
    };
}
