import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { EMPTY_STATE_PACKAGE, EMPTY_STATE_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[empty-state-error-color]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

const anchorRegExp = new RegExp(EMPTY_STATE_TYPE);
const compiledWarnPatterns = warnPatterns.map(({ pattern, message }) => ({ regExp: new RegExp(pattern), message }));

/**
 * Decodes a file's content, but only once it is known to be an empty-state consumer — importing the
 * package, naming the component, or theming it. Every `warnPatterns` entry only applies to a file
 * that passes this check, so it is the single gate for all of them.
 *
 * Checks the raw buffer for the import specifier first, since that is the common case for `.ts` and
 * `.html` consumers and needs no decoding to test; only the fallback name/selector check requires the
 * decoded string, and once decoded it is reused rather than decoded again for the patterns below.
 */
function readIfEmptyStateConsumer(buffer: Buffer): string | undefined {
    if (buffer.includes(EMPTY_STATE_PACKAGE)) return buffer.toString();

    const content = buffer.toString();

    return anchorRegExp.test(content) ? content : undefined;
}

/**
 * Reports the removed `KbqEmptyStateIcon.setErrorColor()` and the four renamed theme custom
 * properties. Never writes: a removed method has no replacement expression, and the old token names
 * are still read as fallbacks, so renaming them is a decision rather than a fix.
 *
 * Stylesheets are visited as well as `.ts` and `.html`, because the tokens are a theming contract
 * consumers override from their own SCSS.
 */
export default function emptyStateErrorColor(options: Schema): Rule {
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

            const content = entry?.content.length ? readIfEmptyStateConsumer(entry.content) : undefined;

            if (!content) return;

            consumers++;

            for (const { regExp, message } of compiledWarnPatterns) {
                if (!regExp.test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders an empty state, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-empty-state under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
