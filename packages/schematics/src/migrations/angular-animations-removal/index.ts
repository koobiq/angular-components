import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[angular-animations-removal]';

/**
 * Reports the uses of the removed animation triggers and of the members that carried an `AnimationEvent`.
 * Never writes: what replaces a member depends on what the code did with the event.
 */
export default function angularAnimationsRemoval(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/') || !filePath.endsWith('.ts')) return;

            const content = entry?.content.toString();

            if (!content) return;

            for (const { pattern, message } of warnPatterns) {
                if (!new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here touched the animations, so the summary would only be noise.
        if (reported === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed "${root || '<workspace root>'}", ${reported} use(s) reported.`,
            ...SUMMARY
        ]);
    };
}
