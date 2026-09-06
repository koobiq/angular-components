import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { INPUT_PACKAGE, INPUT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[input-number-surface]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is an input consumer if it imports the package or names the number-input directive. */
function referencesInput(content: string): boolean {
    return content.includes(INPUT_PACKAGE) || new RegExp(INPUT_TYPE).test(content);
}

/**
 * Reports the `KbqNumberInput` members that disappeared with the unimplemented `KbqFormFieldControl`
 * surface, the validator classes that gained a `Kbq` prefix, and the two behaviors that changed
 * without a call site to point at — the `type="number"` reset and the removed `valueAsNumber`
 * prototype patch. Never writes: a member that was always `undefined` has no replacement expression.
 *
 * `.html` is visited as well as `.ts`, because `type="number"` is markup.
 */
export default function inputNumberSurface(options: Schema): Rule {
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

            if (!content || !referencesInput(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here uses the input, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbqInput under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the package, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
