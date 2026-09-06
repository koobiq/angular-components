import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { RADIO_PACKAGE, RADIO_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[radio-name-and-aria]';
const EXTENSIONS = ['.ts', '.html', '.scss', '.css'];

/** A file is a radio consumer if it imports the package, names the component, or overrides its tokens. */
function referencesRadio(content: string): boolean {
    return content.includes(RADIO_PACKAGE) || new RegExp(RADIO_TYPE).test(content);
}

/**
 * Reports the radio call sites the review changed: the removed `isFocused` input, the now-nullable
 * `radioGroup` and the two custom properties that were declared but never referenced. Never writes —
 * a removed input has no replacement expression, and narrowing `KbqRadioGroup | null` is a decision
 * the call site owns.
 *
 * `.scss` and `.css` are visited as well, because the removed declarations are token overrides rather
 * than code.
 */
export default function radioNameAndAria(options: Schema): Rule {
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

            if (!content || !referencesRadio(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a radio, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-radio-group under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
