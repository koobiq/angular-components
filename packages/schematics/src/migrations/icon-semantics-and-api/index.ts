import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { ICON_PACKAGE, ICON_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[icon-semantics-and-api]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is an icon consumer if it imports the package, names a component, or renders one. */
function referencesIcon(content: string): boolean {
    return content.includes(ICON_PACKAGE) || new RegExp(ICON_TYPE).test(content);
}

/**
 * Reports the icon call sites the review reaches: the removed `KbqIcon.small`, the `KbqIcon` content
 * queries that start resolving icon buttons and items, the icon buttons that now activate themselves
 * from the keyboard, and the retyped `tabindex`. Never writes: whether an icon is decorative, what an
 * icon button is called and whether a widened query still wants every match are all decisions.
 */
export default function iconSemanticsAndApi(options: Schema): Rule {
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

            if (!content || !referencesIcon(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders an icon, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed icons under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
