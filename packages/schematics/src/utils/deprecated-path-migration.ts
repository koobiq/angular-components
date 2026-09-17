import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from './messages';
import { setupOptions } from './package-config';

/** Options of every `<entry-point>-deprecated-path` migration. */
export interface DeprecatedPathMigrationOptions {
    /** Name of the project to migrate. */
    project?: string;
    /** When true, applies replacements; when false, only logs what would change. Defaults to true. */
    fix?: boolean;
}

const TS_EXT = '.ts';

/**
 * Builds the migration for an entry point whose previous implementation moved to `/deprecated` when a
 * rewrite took over `@koobiq/components/<entryPoint>`. It rewrites the import specifier only; the API
 * itself is unchanged at its new path.
 *
 * Quote-anchored (`(['"])@koobiq/components/<entryPoint>\1`) so it matches only the exact, bare module
 * specifier — never a prefix of an already-migrated `/deprecated` import, nor an unrelated sibling
 * package whose name merely starts with the same word.
 */
export function deprecatedPathMigration(entryPoint: string): (options: DeprecatedPathMigrationOptions) => Rule {
    const specifier = `@koobiq/components/${entryPoint}`;
    const label = `[${entryPoint}-deprecated-path]`;
    const from = `(['"])${specifier}\\1`;
    const to = `$1${specifier}/deprecated$1`;

    const migrate = (content: string): { content: string; changed: boolean } => {
        const migrated = content.replace(new RegExp(from, 'g'), to);

        return { content: migrated, changed: migrated !== content };
    };

    return (options) => async (tree: Tree, context: SchematicContext) => {
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

            if (!originalContent || !originalContent.includes(specifier)) return;

            const { content, changed } = migrate(originalContent);

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${label} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        logMessage(context.logger, [
            `${label} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}
