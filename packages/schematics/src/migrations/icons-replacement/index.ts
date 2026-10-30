import { Path } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import path from 'path';
import { readCustomIconMapping } from '../../utils/custom-data';
import { logMessage } from '../../utils/messages';
import { resolveTargetDir } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { Replacement, TransformTemplateAttributesResult } from '../../utils/typescript';
import { iconReplacementData } from './data';
import { Schema } from './schema';

export const replaceIcons = (contentToBeUpdated: string, replacementData: Replacement[]) => {
    let res = contentToBeUpdated;

    for (const { from, to } of replacementData) {
        res = res!.replace(new RegExp(from, 'g'), to);
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
            foundIcons.map(({ from, to }) => `\t${from} -> \t${to}`).join('\n')
        ]);
    }
};

export const processIconReplacement = ({
    fileContent,
    filePath,
    fix,
    logger,
    replacementData
}): TransformTemplateAttributesResult => {
    if (fix) {
        const updatedContent = replaceIcons(fileContent!, replacementData);

        return { fileContent: updatedContent, changed: updatedContent !== fileContent, errors: [] };
    } else {
        logReplacement({
            logger,
            replacementData,
            contentToBeUpdated: fileContent,
            filePath
        });

        return { fileContent, changed: false, errors: [] };
    }
};

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { logger } = context;
        const { project, allowed, fix, customDataPath, replacementDataPath } = options;

        const targetDir = await resolveTargetDir(project, tree);

        // The CLI itself reports the deprecated option (`x-deprecated` in schema.json), but not that it loses.
        if (replacementDataPath && customDataPath) {
            logger.warn('--replacement-data-path is deprecated and ignored next to --custom-data-path.');
        }

        const dataPath = customDataPath ?? replacementDataPath;
        // The deprecated option was resolved from the project root or the folder, so it still looks there first.
        const bases = customDataPath ? undefined : [targetDir.path, '/'];
        const replacementData: Replacement[] = dataPath
            ? readCustomIconMapping(tree, dataPath, logger, bases)
            : iconReplacementData;

        logger.info(
            dataPath
                ? `Icon mapping: ${replacementData.length} entries from '${dataPath}'.`
                : `Icon mapping: the built-in one, ${replacementData.length} entries (--custom-data-path overrides it).`
        );

        visitProjectFiles(targetDir, (filePath: Path, entry) => {
            if (allowed.length === 0 || allowed.some((ext) => filePath.endsWith(ext))) {
                const initialContent = entry.content.toString();

                if (!initialContent) return;

                const { fileContent, changed } = processIconReplacement({
                    fileContent: initialContent,
                    filePath,
                    fix,
                    logger,
                    replacementData
                });

                if (changed) {
                    tree.overwrite(filePath, fileContent);
                }
            }
        });
    };
}
