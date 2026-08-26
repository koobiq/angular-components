import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { NOTIFICATION_CENTER_REFERENCE, warnPatterns } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const LABEL = '[notification-center-signals]';

/** Whether a `.ts` file names the notification center at all, so the member patterns stay scoped. */
function referencesNotificationCenter(content: string): boolean {
    return new RegExp(NOTIFICATION_CENTER_REFERENCE).test(content);
}

function reportFile(context: SchematicContext, filePath: string, content: string): boolean {
    let reported = false;

    for (const { pattern, requires, message } of warnPatterns) {
        if (requires && !new RegExp(requires).test(content)) continue;
        if (!new RegExp(pattern).test(content)) continue;

        reported = true;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }

    return reported;
}

/**
 * Reports the notification-center API changes a consumer's code can point at. Nothing here can be
 * rewritten safely — every one of them needs a decision the schematic cannot make — so the migration
 * only reports, and takes no `fix` option.
 */
export default function notificationCenterSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!filePath.endsWith(TS_EXT)) return;

            const content = entry?.content.toString();

            if (!content || !referencesNotificationCenter(content)) return;

            if (reportFile(context, filePath, content)) reported++;
        });

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", reported ${reported} file(s). ` +
                'This migration reports only — every change it names needs a manual decision.'
        ]);
    };
}
