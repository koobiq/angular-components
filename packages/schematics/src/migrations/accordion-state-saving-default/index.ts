import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { ACCORDION_PACKAGE, ACCORDION_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[accordion-state-saving-default]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is an accordion consumer if it imports the package, names the component, or renders one. */
function referencesAccordion(content: string): boolean {
    return content.includes(ACCORDION_PACKAGE) || new RegExp(ACCORDION_TYPE).test(content);
}

/**
 * Reports the consequences of `KbqAccordion.useStateSaving` defaulting to `true`. Never writes: the
 * markup whose behaviour changed is exactly the markup that does not mention the input, and rewriting
 * it to opt out would withhold the feature the release is shipping.
 *
 * `.html` is visited as well as `.ts`, because every report keys off the rendered element rather than
 * off an import.
 */
export default function accordionStateSavingDefault(options: Schema): Rule {
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

            if (!content || !referencesAccordion(content)) return;

            consumers++;

            for (const { anchor, pattern, unless, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;
                if (unless && new RegExp(unless).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders an accordion, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-accordion under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the accordion, ${reported} report(s) raised.`,
            ...SUMMARY
        ]);
    };
}
