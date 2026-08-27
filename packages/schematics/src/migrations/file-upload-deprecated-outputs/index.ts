import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { replacements } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[file-upload-deprecated-outputs]';

function isMigratableFile(filePath: string): boolean {
    return filePath.endsWith(TS_EXT) || filePath.endsWith(HTML_EXT);
}

function applyReplacements(content: string): string {
    let result = content;

    for (const { from, to } of replacements) {
        result = result.replace(new RegExp(from, 'g'), to);
    }

    return result;
}

export default function fileUploadDeprecatedOutputs(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json
        // declares no schema, so the schema default never reaches us — applying the
        // fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!isMigratableFile(filePath)) return;

            const originalContent = entry?.content.toString();

            if (!originalContent) return;

            const content = applyReplacements(originalContent);

            if (content === originalContent) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}
