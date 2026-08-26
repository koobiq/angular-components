import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TITLE_PACKAGE, TITLE_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[title-encapsulation]';
const EXTENSIONS = ['.ts'];

/** A file is a title consumer if it imports the package or names the directive. */
function referencesTitle(content: string): boolean {
    return content.includes(TITLE_PACKAGE) || new RegExp(TITLE_TYPE).test(content);
}

/**
 * Reports the members of `KbqTitleDirective` that stopped being public. Never writes: every one of
 * them was removed or hidden outright, so there is no expression to rewrite a call site to.
 *
 * Only `.ts` is visited. The directive's template surface — the `kbq-title` attribute — did not
 * change, so no markup needs migrating.
 */
export default function titleEncapsulation(options: Schema): Rule {
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

            if (!content || !referencesTitle(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here uses kbq-title, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-title under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the directive, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
