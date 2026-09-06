import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { FILE_UPLOAD_PACKAGE, FILE_UPLOAD_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[file-upload-cva-and-primitives]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a file-upload consumer if it imports the package, names a type, or renders an uploader. */
function referencesFileUpload(content: string): boolean {
    return content.includes(FILE_UPLOAD_PACKAGE) || new RegExp(FILE_UPLOAD_TYPE).test(content);
}

/**
 * Reports the file-upload behavior the review changed. Never writes: `remove()` keeps its signature
 * while returning the opposite array, and whether an output handler wanted to run for a programmatic
 * write is a decision rather than a rename.
 *
 * `.html` is visited as well as `.ts`, because `(fileChange)`/`(filesChange)` are template bindings.
 */
export default function fileUploadCvaAndPrimitives(options: Schema): Rule {
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

            if (!content || !referencesFileUpload(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a file-upload, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-file-upload under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
