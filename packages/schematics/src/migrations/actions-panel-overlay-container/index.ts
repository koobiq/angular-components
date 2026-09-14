import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { ACTIONS_PANEL_PACKAGE, ACTIONS_PANEL_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[actions-panel-overlay-container]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is an actions panel consumer if it imports the package or names one of its types. */
function referencesActionsPanel(content: string): boolean {
    return content.includes(ACTIONS_PANEL_PACKAGE) || new RegExp(ACTIONS_PANEL_TYPE).test(content);
}

/**
 * Reports the call sites the `overlayContainer` change gives a new meaning to. Never writes: whether a
 * panel that now renders inside the element is still where the product wants it is a layout question.
 */
export default function actionsPanelOverlayContainer(options: Schema): Rule {
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

            if (!content || !referencesActionsPanel(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here opens an actions panel, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed KbqActionsPanel under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the actions panel, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
