import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SUMMARY, USERNAME_PACKAGE, USERNAME_TYPE, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[username-pipe-injection]';
const EXTENSIONS = ['.ts', '.html'];

/** A file is a username consumer if it imports the package, names a symbol, or renders the component. */
function referencesUsername(content: string): boolean {
    return content.includes(USERNAME_PACKAGE) || new RegExp(USERNAME_TYPE).test(content);
}

/**
 * Reports the call sites that obtained `KbqUsernamePipe` / `KbqUsernameCustomPipe` through DI, which
 * stopped resolving when the review dropped `@Injectable({ providedIn: 'root' })` from both pipes.
 * Never writes: the replacement is a different expression and has to run in an injection context.
 *
 * `.html` is visited as well as `.ts` so that a project rendering `kbq-username` gets the summary of the
 * rendering changes even when nothing injects a pipe.
 */
export default function usernamePipeInjection(options: Schema): Rule {
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

            if (!content || !referencesUsername(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here renders a username, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-username under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}
