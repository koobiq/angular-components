import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { FLAG_OPEN_TAG, FLAG_PACKAGE, FLAG_TYPE, INNER_HTML_BINDING, REWRITE_MESSAGE, SUMMARY } from './data';
import { Schema } from './schema';

const LABEL = '[flag-inner-html]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a flag consumer if it imports the package, names the component, or renders one. */
function referencesFlag(content: string): boolean {
    return content.includes(FLAG_PACKAGE) || new RegExp(FLAG_TYPE).test(content);
}

/** Renames `[innerHTML]` to `[svg]` inside every `<kbq-flag …>` opening tag, and leaves the rest alone. */
export function rewriteInnerHtmlBindings(content: string): string {
    return content.replace(FLAG_OPEN_TAG, (tag) => tag.replace(INNER_HTML_BINDING, '[svg]='));
}

/**
 * Moves `[innerHTML]` bindings off the `<kbq-flag>` host element onto the `svg` input the flag review
 * added, and reports the behavior changes that have no call site to point at.
 *
 * `.html` is visited as well as `.ts`, because the binding lives in a template either way.
 */
export default function flagInnerHtml(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let rewritten = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !referencesFlag(content)) return;

            consumers++;

            const migrated = rewriteInnerHtmlBindings(content);

            if (migrated === content) return;

            rewritten++;
            tree.overwrite(filePath, migrated);

            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${REWRITE_MESSAGE}`]);
        });

        // Nothing here renders a flag, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-flag under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${rewritten} file(s) rewritten.`,
            ...SUMMARY
        ]);
    };
}
