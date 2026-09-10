import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { CODE_BLOCK_PACKAGE, CODE_BLOCK_TYPE, HIGHLIGHT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[code-block-optional-max-height]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';
const EXTENSIONS = [TS_EXT, HTML_EXT];

/** A file is a code block consumer if it imports the package, names one of the types or renders it. */
function referencesCodeBlock(content: string): boolean {
    return (
        content.includes(CODE_BLOCK_PACKAGE) ||
        new RegExp(CODE_BLOCK_TYPE).test(content) ||
        new RegExp(HIGHLIGHT_TYPE).test(content)
    );
}

/**
 * The source with everything that is not code blanked out, so a pattern cannot match a note in a comment
 * or a member name that happens to sit inside a string. Template attribute values are code, so only
 * comments go there.
 */
function codeOnly(content: string, filePath: string): string {
    if (filePath.endsWith(HTML_EXT)) return content.replace(/<!--[\s\S]*?-->/g, ' ');

    return content
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/[^\n]*/g, ' ')
        .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
        .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
        .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

/**
 * Reports the `KbqCodeBlock` members whose type changed. Never writes: narrowing `number | undefined` back
 * to `number` is a decision the call site owns, and turning a `file` write into a binding is a template edit.
 *
 * Templates are visited too: no binding changed, but a member read through a template reference variable
 * (`#block="kbqCodeBlock"`) lives in the markup rather than in TypeScript.
 */
export default function codeBlockOptionalMaxHeight(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reports = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !referencesCodeBlock(content)) return;

            consumers++;

            const code = codeOnly(content, filePath);

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(code) || !new RegExp(pattern).test(code)) continue;

                reports++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here uses the code block, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-code-block under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reports} report(s).`,
            ...SUMMARY
        ]);
    };
}
