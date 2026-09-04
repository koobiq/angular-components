import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { BEHAVIOUR_NOTE, WarnPattern, templateWarnPatterns, tsWarnPatterns } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[toast-stack-and-defaults]';

function pickWarnPatterns(filePath: string): WarnPattern[] {
    // A .ts file can hold an inline template, so it is checked against both sets.
    return filePath.endsWith(TS_EXT) ? [...tsWarnPatterns, ...templateWarnPatterns] : templateWarnPatterns;
}

function isMigratableFile(filePath: string): boolean {
    return filePath.endsWith(TS_EXT) || filePath.endsWith(HTML_EXT);
}

export default function toastStackAndDefaults(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const filePaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!isMigratableFile(filePath)) return;

            filePaths.push(filePath);
        });

        let reported = 0;

        for (const filePath of filePaths) {
            const content = tree.read(filePath)?.toString();

            if (!content) continue;

            for (const { pattern, message } of pickWarnPatterns(filePath)) {
                if (!new RegExp(pattern).test(content)) continue;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
                reported++;
            }
        }

        logMessage(context.logger, [
            `${LABEL} scanned the tree under "${root || '<workspace root>'}", reported ${reported} usage(s). ` +
                'Nothing was rewritten — every change below needs a decision no schematic can make.',
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}
