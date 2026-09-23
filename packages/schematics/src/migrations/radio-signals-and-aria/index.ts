import { Path } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { signalMembersRule } from '../../utils/signal-members-migration';
import { config, REMOVED_TOKENS_MESSAGE, REMOVED_TOKENS_PATTERN } from './data';
import { Schema } from './schema';

const STYLE_EXTENSIONS = ['.scss', '.css'];

/**
 * The two removed custom properties are a stylesheet concern, and the shared engine visits only `.ts`
 * and `.html`. Reports an override of either; never writes, because the declaration has no replacement.
 */
function removedTokensRule(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!STYLE_EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !new RegExp(REMOVED_TOKENS_PATTERN).test(content)) return;

            logMessage(context.logger, [`${config.label} ${filePath}`, `  ${REMOVED_TOKENS_MESSAGE}`]);
        });
    };
}

export default function radioSignalsAndAria(options: Schema): Rule {
    return chain([removedTokensRule(options), signalMembersRule(config, options)]);
}
