import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SPLIT_BUTTON_PACKAGE, SPLIT_BUTTON_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[split-button-optional-disabled]';
const EXTENSIONS = ['.ts'];

/** A file is a split-button consumer if it imports the package or names the component. */
function referencesSplitButton(content: string): boolean {
    return content.includes(SPLIT_BUTTON_PACKAGE) || new RegExp(SPLIT_BUTTON_TYPE).test(content);
}

/**
 * Reports the `KbqSplitButton` members whose type changed. Never writes: narrowing
 * `boolean | undefined` back to `boolean` is a decision the call site owns.
 *
 * Only `.ts` is visited — the component's template surface did not change, and the `disabled`
 * binding accepts exactly what it did before.
 */
export default function splitButtonOptionalDisabled(options: Schema): Rule {
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

            if (!content || !referencesSplitButton(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here uses the split button, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-split-button under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
