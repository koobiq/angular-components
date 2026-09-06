import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { DIVIDER_PACKAGE, DIVIDER_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[divider-signals-and-aria]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a divider consumer if it imports the package, names the component, or renders one. */
function referencesDivider(content: string): boolean {
    return content.includes(DIVIDER_PACKAGE) || new RegExp(DIVIDER_TYPE).test(content);
}

/**
 * Reports the `KbqDivider` inputs that became signals and the hand-rolled separator attributes the
 * component now renders itself. Never writes: a read becomes a call, a write becomes a binding, and
 * whether a duplicate attribute should be deleted or replaced by `decorative` is a decision.
 *
 * `.html` is visited as well as `.ts`, because the attributes it reports live in templates.
 */
export default function dividerSignalsAndAria(options: Schema): Rule {
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

            if (!content || !referencesDivider(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a divider, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-divider under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
