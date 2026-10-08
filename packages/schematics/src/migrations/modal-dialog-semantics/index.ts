import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { MODAL_PACKAGE, MODAL_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[modal-dialog-semantics]';
const EXTENSIONS = ['.ts', '.html', '.scss'];

/** A file is a modal consumer if it imports the package, names the component, or renders one. */
function referencesModal(content: string): boolean {
    return content.includes(MODAL_PACKAGE) || new RegExp(MODAL_TYPE).test(content);
}

/**
 * Reports what the modal review changed for consumers: the members that disappeared or became
 * protected, and the close controls that stopped being inert on the declarative path. Never
 * writes — whether a dialog should still close is a decision, not a rewrite.
 *
 * `.html` is visited because `(kbqOnOk)`/`(kbqOnCancel)` are template bindings, and `.scss` because
 * two of the removals are a class and a design token.
 */
export default function modalDialogSemantics(options: Schema): Rule {
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

            if (!content || !referencesModal(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here opens a modal, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-modal under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
