import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { renames, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[top-bar-container-selectors]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

/**
 * Both renamed strings are library-owned and unique, so a plain textual replacement is exact: nothing
 * else in a consumer's tree can spell `kbq-top-bar-container__start` or
 * `--kbq-top-bar-container-start-basis`.
 *
 * The `[placement]` attribute selector is reported instead — rewriting it means knowing which of the two
 * placements the rule meant, and the attribute may be there for something other than styling.
 */
export default function topBarContainerSelectors(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix = true } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let renamed = 0;
        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !content.includes('kbq-top-bar')) return;

            let updated = content;
            const applied: string[] = [];

            for (const { replace, replaceWith } of renames) {
                if (!updated.includes(replace)) continue;

                applied.push(`${replace} -> ${replaceWith}`);
                updated = updated.split(replace).join(replaceWith);
            }

            if (applied.length) {
                renamed++;

                if (fix) {
                    tree.overwrite(filePath, updated);
                    logMessage(context.logger, [`${LABEL} ${filePath}`, ...applied.map((line) => `  ${line}`)]);
                } else {
                    logMessage(context.logger, [
                        `${LABEL} ${filePath}`,
                        ...applied.map((line) => `  would rename ${line}`)
                    ]);
                }
            }

            // Warnings run against what the file looks like after the renames, so an auto-fixed usage is
            // not reported as manual work as well.
            const checked = fix ? updated : content;

            for (const { pattern, message } of warnPatterns) {
                if (!new RegExp(pattern).test(checked)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        if (renamed === 0 && reported === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-top-bar under "${root || '<workspace root>'}", ` +
                `${renamed} file(s) renamed, ${reported} rule(s) reported.`,
            ...SUMMARY
        ]);
    };
}
