import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { CLAMPED_TEXT_PACKAGE, CLAMPED_TEXT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[clamped-text-disclosure]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

/** A file is a clamped-text consumer if it imports the package, names a symbol, or renders one. */
function referencesClampedText(content: string): boolean {
    return content.includes(CLAMPED_TEXT_PACKAGE) || new RegExp(CLAMPED_TEXT_TYPE).test(content);
}

/**
 * Reports the call sites the clamped-text review breaks: the `aria-expanded` that moved from the
 * containers to the trigger, the borrowed toggle class the trigger stopped applying, the
 * `isCollapsedChange` that no longer fires for the component's own measurement, and the members
 * that became read-only or protected. Never writes: each of those is a decision, not a rename.
 *
 * `.scss` and `.css` are visited as well, because the borrowed class is most often overridden from
 * a stylesheet rather than from a template.
 */
export default function clampedTextDisclosure(options: Schema): Rule {
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

            if (!content || !referencesClampedText(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a clamped text or list, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed @koobiq/components/clamped-text under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the package, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
