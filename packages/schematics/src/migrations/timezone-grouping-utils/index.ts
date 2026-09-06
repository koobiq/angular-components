import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TIMEZONE_PACKAGE, TIMEZONE_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[timezone-grouping-utils]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a timezone consumer if it imports the package, names a member, or renders one of its elements. */
function referencesTimezone(content: string): boolean {
    return content.includes(TIMEZONE_PACKAGE) || new RegExp(TIMEZONE_TYPE).test(content);
}

/**
 * Reports the timezone call sites the review's split of `getZonesGroupedByCountry` breaks, plus the members
 * whose type or behaviour changed under them. Never writes: what replaces a dropped argument is a
 * composition of two or three helpers, and which one the call site meant cannot be read off the call.
 *
 * `.html` is visited as well as `.ts`, because `[multiple]` is a template binding that used to be accepted.
 */
export default function timezoneGroupingUtils(options: Schema): Rule {
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

            if (!content || !referencesTimezone(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders or builds a timezone list, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed the timezone utilities under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the package, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
