import { Path } from '@angular-devkit/core';
import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import path from 'path';
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

export const resolveReplacementData = (projectRootPath: string, tree: Tree, customReplacementDataPath?: string) => {
    if (customReplacementDataPath) {
        const filePath = `${projectRootPath}/${customReplacementDataPath}`;
        const replacementData = tree.get(filePath);

        if (!replacementData) {
            throw new SchematicsException(`Unable to find the replacement data at '${filePath}'`);
        }

        return JSON.parse(replacementData.content.toString()) as Replacement[];
    }

    return iconReplacementData;
};

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { logger } = context;
        const { project, allowed, fix, replacementDataPath } = options;

        const targetDir = await resolveTargetDir(project, tree);

        const replacementData = resolveReplacementData(targetDir.path, tree, replacementDataPath);

        logger.info(
            replacementDataPath
                ? `Icon mapping: ${replacementData.length} entries from '${replacementDataPath}'.`
                : `Icon mapping: the built-in one, ${replacementData.length} entries (--replacement-data-path overrides it).`
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
