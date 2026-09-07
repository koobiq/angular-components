import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { A11Y_LOCALE_TYPE, INLINE_EDIT_PACKAGE, INLINE_EDIT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[inline-edit-a11y-and-types]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

// Compiled once: the scope test runs against every file of the project, and the warn patterns against
// every file that passes it. None carries the `g` flag, so a shared instance holds no `lastIndex`.
const inlineEditType = new RegExp(INLINE_EDIT_TYPE);
const a11yLocaleType = new RegExp(A11Y_LOCALE_TYPE);
const compiledWarnPatterns = warnPatterns.map(({ anchor, pattern, message }) => ({
    anchor: new RegExp(anchor),
    pattern: new RegExp(pattern),
    message
}));

/** A file is in scope if it names the inline edit, or if it configures the a11y locale section. */
function referencesSubject(content: string): boolean {
    return content.includes(INLINE_EDIT_PACKAGE) || inlineEditType.test(content) || a11yLocaleType.test(content);
}

/**
 * Reports what the inline-edit review broke: the removed `KbqFocusRegionItem`, the handler and tooltip
 * types narrowed from `any` to `unknown`, the new required `edit` key of `KbqA11yLocaleConfiguration`,
 * and the tab stop that moved off the host onto the view content.
 *
 * Never writes: a removed export has no replacement expression, a narrowed parameter needs a cast only
 * the host can choose, and a selector that matched the host is a decision about which element it meant.
 * `.scss`/`.css` are visited as well, because the tab stop moved in the DOM rather than in the API.
 */
export default function inlineEditA11yAndTypes(options: Schema): Rule {
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

            if (!content || !referencesSubject(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of compiledWarnPatterns) {
                if (!anchor.test(content) || !pattern.test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders an inline edit or touches the a11y locale, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-inline-edit under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
