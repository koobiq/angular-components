import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { DL_ELEMENT, DL_PACKAGE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[dl-attribute-coercion]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a description list consumer if it renders the element or imports the package. */
function referencesDl(content: string): boolean {
    return content.includes(`<${DL_ELEMENT}`) || content.includes(DL_PACKAGE);
}

/**
 * Reports the `<kbq-dl>` attributes whose coercion changed. Never writes: whether markup relied on a
 * valueless `wide` being ignored is a decision the call site owns, and so is what a non-numeric width
 * was meant to say.
 *
 * Both `.ts` and `.html` are visited, because the element is written in templates of either kind.
 */
export default function dlAttributeCoercion(options: Schema): Rule {
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

            if (!content || !referencesDl(content)) return;

            consumers++;

            for (const { pattern, message } of warnPatterns) {
                if (!new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here uses the description list, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-dl under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
