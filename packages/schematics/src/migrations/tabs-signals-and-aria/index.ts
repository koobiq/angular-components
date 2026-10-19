import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { SUMMARY, TABS_PACKAGE, TABS_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[tabs-signals-and-aria]';
const EXTENSIONS = ['.ts', '.html'];

// Compiled once rather than for every file of the project. None carries the `g` flag, so a shared instance holds no
// `lastIndex`.
const TABS_TYPE_REGEX = new RegExp(TABS_TYPE);
const COMPILED_WARN_PATTERNS = warnPatterns.map(({ anchor, pattern, message }) => ({
    anchor: anchor ? new RegExp(anchor) : null,
    pattern: new RegExp(pattern),
    message
}));

/** A file is a tabs consumer if it imports the package, names a component, or renders one. */
function referencesTabs(content: string): boolean {
    return content.includes(TABS_PACKAGE) || TABS_TYPE_REGEX.test(content);
}

/**
 * Reports the subclasses of the tabs classes and the direct calls of their `ngOnChanges`, the members the review
 * removed or changed, and the ARIA and theming changes that have no call site to point at. Never writes.
 *
 * `.html` is visited as well as `.ts`, because the removed `disabled` input of the group and the removed
 * `[attr.disabled]` of a label are both template-side.
 */
export default function tabsSignalsAndAria(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';

        let consumers = 0;
        let reported = 0;

        visitProjectFiles(root ? tree.getDir(root) : tree.root, (filePath, entry) => {
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry.content.toString();

            if (!content || !referencesTabs(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of COMPILED_WARN_PATTERNS) {
                if (anchor && !anchor.test(content)) continue;
                if (!pattern.test(content)) continue;

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
