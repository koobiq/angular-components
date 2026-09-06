import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SIDEPANEL_PACKAGE, SIDEPANEL_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[sidepanel-non-modal-behavior]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a sidepanel consumer if it imports the package, names the service or renders one of the parts. */
function referencesSidepanel(content: string): boolean {
    return content.includes(SIDEPANEL_PACKAGE) || new RegExp(SIDEPANEL_TYPE).test(content);
}

/**
 * Reports what the sidepanel review changed about the panel's effect on the page around it: the scroll
 * block that no longer applies to non-modal panels, the focus that is captured and restored in both
 * modalities, the dialog semantics on the container, and the application-wide `FocusTrapFactory`
 * override that is gone. It never writes to the tree.
 */
export default function sidepanelNonModalBehavior(options: Schema): Rule {
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

            if (!content || !referencesSidepanel(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here opens a sidepanel, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-sidepanel under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
