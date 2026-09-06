import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { PROGRESS_BAR_PACKAGE, PROGRESS_BAR_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[progress-bar-percentage-and-aria]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a progress-bar consumer if it imports the package, names the component, or renders one. */
function referencesProgressBar(content: string): boolean {
    return content.includes(PROGRESS_BAR_PACKAGE) || new RegExp(PROGRESS_BAR_TYPE).test(content);
}

/**
 * Reports the progress-bar review changes a consumer has to act on: the `percentage` getter that became
 * a protected computed, and the ARIA the host now renders itself. Never writes — `percentage` has no
 * replacement expression, and which of two competing `aria-*` attributes survives is a decision.
 *
 * `.html` is visited as well as `.ts`, because the attributes that collide with the new host bindings
 * are template markup.
 */
export default function progressBarPercentageAndAria(options: Schema): Rule {
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

            if (!content || !referencesProgressBar(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a progress bar, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-progress-bar under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
