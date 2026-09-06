import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TIME_RANGE_PACKAGE, TIME_RANGE_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[time-range-forms-contract]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

/** A file is a time-range consumer if it imports the package, names the component, or renders one. */
function referencesTimeRange(content: string): boolean {
    return content.includes(TIME_RANGE_PACKAGE) || new RegExp(TIME_RANGE_TYPE).test(content);
}

/**
 * Reports the `time-range` call sites the review breaks: the removed `timepickerList`, the
 * `KbqTimeRangeTitleAsControl` members that stopped being plain fields, the narrowed `valueCorrected`
 * and the editor markup that moved the from/to block out of the radiogroup. Never writes: what
 * replaces a write to a derived member is a binding on the host, or nothing at all.
 *
 * Stylesheets are visited too, because the markup change is what a descendant selector keyed on the
 * radiogroup notices.
 */
export default function timeRangeFormsContract(options: Schema): Rule {
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

            if (!content || !referencesTimeRange(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a time-range, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-time-range under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
