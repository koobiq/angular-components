import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TABS_PACKAGE, TABS_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[tabs-signals-and-aria]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a tabs consumer if it imports the package, names a component, or renders one. */
function referencesTabs(content: string): boolean {
    return content.includes(TABS_PACKAGE) || new RegExp(TABS_TYPE).test(content);
}

/**
 * Reports the tabs members that were removed or became signal-backed in the review, plus the ARIA and
 * theming changes that have no call site to point at. Never writes: a read of a signal member becomes
 * a call, a removed member has no replacement expression, and an attribute selector has to be
 * rewritten by hand.
 *
 * `.html` is visited as well as `.ts`, because the removed `disabled` input and the removed
 * `[attr.disabled]` on a label are both template-side.
 */
export default function tabsSignalsAndAria(options: Schema): Rule {
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

            if (!content || !referencesTabs(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders tabs, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tabs under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
