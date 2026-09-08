import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { POPOVER_PACKAGE, POPOVER_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[popover-leave-delay]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a popover consumer if it imports the package, names a popover type, or renders one. */
function referencesPopover(content: string): boolean {
    return content.includes(POPOVER_PACKAGE) || new RegExp(POPOVER_TYPE).test(content);
}

/**
 * Reports the popover call sites the review changed the meaning of. Never writes: whether an
 * assignment should become a `kbqLeaveDelay` binding or simply go away depends on why it was made.
 */
export default function popoverLeaveDelay(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !referencesPopover(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a popover, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbqPopover under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the popover, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
