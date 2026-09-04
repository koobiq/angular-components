import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TREE_SELECT_PACKAGE, TREE_SELECT_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[tree-select-signals]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a tree-select consumer if it imports the package, names the component, or renders one. */
function referencesTreeSelect(content: string): boolean {
    return content.includes(TREE_SELECT_PACKAGE) || new RegExp(TREE_SELECT_TYPE).test(content);
}

/**
 * Reports the `KbqTreeSelect` members that became signal-backed, protected, or disappeared. Never
 * writes: a read becomes a call, a write becomes a binding, and a removed member has no replacement
 * expression at all.
 *
 * `.html` is visited as well as `.ts`, because `(valueChange)` is a template binding that Angular
 * now silently treats as a DOM event listener.
 */
export default function treeSelectSignals(options: Schema): Rule {
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

            if (!content || !referencesTreeSelect(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a tree-select, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-tree-select under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
