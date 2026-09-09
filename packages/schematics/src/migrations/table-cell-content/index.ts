import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, TABLE_PACKAGE, TABLE_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[table-cell-content]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

// Compiled once rather than per visited file: `rootDir.visit` below can run over every file in the
// project, and these patterns never change between files.
const TABLE_TYPE_PATTERN = new RegExp(TABLE_TYPE);
const compiledWarnPatterns = warnPatterns.map(({ anchor, pattern, message }) => ({
    anchor: new RegExp(anchor),
    pattern: new RegExp(pattern),
    message
}));

/** A file is a table consumer if it imports the package, names the component, or renders one. */
function referencesTable(content: string): boolean {
    return content.includes(TABLE_PACKAGE) || TABLE_TYPE_PATTERN.test(content);
}

/**
 * Reports the removal of `KbqTableCellContent` and the style-surface changes the table review made.
 * Never writes: an entry in an `imports` array is deleted rather than replaced, and a stylesheet keyed
 * on the removed modifier class has to be re-pointed at the cell.
 *
 * Stylesheets are visited as well as `.ts` and `.html`, because two of the three patterns — the modifier
 * class and the sticky-header background token — only ever appear in CSS.
 */
export default function tableCellContent(options: Schema): Rule {
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

            if (!content || !referencesTable(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of compiledWarnPatterns) {
                if (!anchor.test(content) || !pattern.test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a table, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-table under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
