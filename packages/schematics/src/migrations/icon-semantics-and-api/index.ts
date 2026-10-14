import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { ICON_PACKAGE, ICON_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[icon-semantics-and-api]';
const EXTENSIONS = ['.ts', '.html'];

// Compiled once rather than per file. None carries the `g` flag, so a shared instance holds no `lastIndex`.
const ICON_TYPE_REGEX = new RegExp(ICON_TYPE);
const COMPILED_WARN_PATTERNS = warnPatterns.map(({ anchor, pattern, message }) => ({
    anchor: new RegExp(anchor),
    pattern: new RegExp(pattern),
    message
}));

/** A file is an icon consumer if it imports the package, names a component, or renders one. */
function referencesIcon(content: string): boolean {
    return content.includes(ICON_PACKAGE) || ICON_TYPE_REGEX.test(content);
}

/**
 * Reports the icon call sites the review reaches: the removed `KbqIcon.small`, the icon buttons on a host
 * that is not a native `<button>` that handle a click but no key, the retyped `tabindex` and the replaced
 * `name` marker. Never writes: whether an icon is decorative and what an icon button is called are both
 * decisions.
 */
export default function iconSemanticsAndApi(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reported = 0;

        visitProjectFiles(rootDir, (filePath, entry) => {
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry.content.toString();

            if (!content || !referencesIcon(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of COMPILED_WARN_PATTERNS) {
                if (!anchor.test(content) || !pattern.test(content)) continue;

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
