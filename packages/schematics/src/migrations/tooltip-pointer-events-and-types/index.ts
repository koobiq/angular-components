import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TOOLTIP_PACKAGE, TOOLTIP_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[tooltip-pointer-events-and-types]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a tooltip consumer if it imports the package, names the trigger, or renders one. */
function referencesTooltip(content: string): boolean {
    return content.includes(TOOLTIP_PACKAGE) || new RegExp(TOOLTIP_TYPE).test(content);
}

/**
 * Reports the tooltip changes a consumer has to act on. Never writes: a narrowed type is fixed by
 * giving the call site the right type, and the pointer-events default has no call site at all — the
 * markup that changed behaviour is exactly the markup that did not mention the input.
 *
 * `.html` is visited as well as `.ts`, because the pointer-events report keys off the `kbqTooltip`
 * attribute rather than off an import.
 */
export default function tooltipPointerEventsAndTypes(options: Schema): Rule {
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

            if (!content || !referencesTooltip(content)) return;

            consumers++;

            for (const { anchor, pattern, unless, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;
                if (unless && new RegExp(unless).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a tooltip, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbqTooltip under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the tooltip, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
