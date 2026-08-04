import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { Schema } from './schema';

const TS_EXT = '.ts';
const LABEL = '[scrollbar-deprecated-path]';

/**
 * `@koobiq/components/scrollbar` now resolves to the new, dependency-free directive —
 * the `overlayscrollbars`-based component/directive it used to export moved to
 * `@koobiq/components/scrollbar/deprecated`. This rewrites the import specifier only;
 * the API itself (`options`/`events`/`defer`/`scrollbarInstance`, the `kbq-scrollbar`
 * element selector) is unchanged at its new path.
 *
 * Quote-anchored (`(['"])@koobiq/components/scrollbar\1`) so it matches only the exact,
 * bare module specifier — never a prefix of an already-migrated `/deprecated` import, nor
 * an unrelated sibling package whose name merely starts with "scrollbar".
 */
const FROM = `(['"])@koobiq/components/scrollbar\\1`;
const TO = `$1@koobiq/components/scrollbar/deprecated$1`;

function migrate(content: string): { content: string; changed: boolean } {
    const migrated = content.replace(new RegExp(FROM, 'g'), TO);

    return { content: migrated, changed: migrated !== content };
}

export default function scrollbarDeprecatedPath(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json
        // declares no schema, so the schema default never reaches us — applying the
        // fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!filePath.endsWith(TS_EXT)) return;

            const originalContent = entry?.content.toString();

            if (!originalContent || !originalContent.includes('@koobiq/components/scrollbar')) return;

            const { content, changed } = migrate(originalContent);

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}
