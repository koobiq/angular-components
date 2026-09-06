import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { EMPTY_STATE_PACKAGE, EMPTY_STATE_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[empty-state-error-color]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

/** A file is an empty-state consumer if it imports the package, names the component, or themes it. */
function referencesEmptyState(content: string): boolean {
    return content.includes(EMPTY_STATE_PACKAGE) || new RegExp(EMPTY_STATE_TYPE).test(content);
}

/**
 * Reports the removed `KbqEmptyStateIcon.setErrorColor()` and the four renamed theme custom
 * properties. Never writes: a removed method has no replacement expression, and the old token names
 * are still read as fallbacks, so renaming them is a decision rather than a fix.
 *
 * Stylesheets are visited as well as `.ts` and `.html`, because the tokens are a theming contract
 * consumers override from their own SCSS.
 */
export default function emptyStateErrorColor(options: Schema): Rule {
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

            if (!content || !referencesEmptyState(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders an empty state, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-empty-state under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
