import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TREE_PACKAGE, TREE_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[tree-signals]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a tree consumer if it imports the package, names one of its types, or renders one. */
function referencesTree(content: string): boolean {
    return content.includes(TREE_PACKAGE) || new RegExp(TREE_TYPE).test(content) || content.includes('kbq-tree');
}

/**
 * Reports the six members of `@koobiq/components/tree` that became read-only, with the files that
 * write or read them. Never writes: see `data.ts` for why none of them can be rewritten mechanically.
 */
export default function treeSignals(options: Schema): Rule {
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

            if (!content || !referencesTree(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a tree, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the tree, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
