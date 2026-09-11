import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SELECT_PACKAGE, SELECT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[select-signal-inputs]';
const EXTENSIONS = ['.ts'];

/** A file is a select consumer if it imports the package or names the component. */
function referencesSelect(content: string): boolean {
    return content.includes(SELECT_PACKAGE) || new RegExp(SELECT_TYPE).test(content);
}

/**
 * Reports the `KbqSelect` members that became signal inputs or stopped being public. Never writes:
 * a read of a signal input becomes a call and a write becomes a binding, and which of the two a call
 * site wants cannot be derived from the expression.
 *
 * Only `.ts` is visited — every input kept its alias, so no template needs migrating.
 */
export default function selectSignalInputs(options: Schema): Rule {
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

            if (!content || !referencesSelect(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a select, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-select under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the select, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
