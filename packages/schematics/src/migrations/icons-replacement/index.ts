import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { resolve } from 'node:path';
import * as process from 'node:process';
import ts from 'typescript';
import { migrateTemplate, migrateTs } from '../../utils/angular-parsing';
import { getParsingInfo } from '../../utils/package-config';
import { canMigrateFile, MigrationData } from '../../utils/typescript';
import { Schema } from './schema';

export const migrationData: MigrationData = {
    elementName: 'kbq-loader-overlay',
    attrs: {
        key: {
            from: 'compact',
            to: 'size'
        },
        value: {
            replacements: [
                { from: 'true', to: 'compact' },
                { from: 'false', to: 'big' }
            ],
            default: 'big'
        }
    }
};

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const { tsPaths, templatePaths, projectDefinition } = await getParsingInfo(project, tree);

        const program = ts.createProgram(
            Array.from(tsPaths, (item) => resolve(projectDefinition.root, `.${item}`)),
            {
                baseUrl: projectDefinition.root,
                rootDir: projectDefinition.root,
                _enableTemplateTypeChecker: true, // Required for the template type checker to work.
                compileNonExportedClasses: true, // We want to migrate non-exported classes too.
                // Avoid checking libraries to speed up the migration.
                skipLibCheck: true,
                skipDefaultLibCheck: true
            }
        );

        // Update external html
        await migrateTemplate(tree, Array.from(templatePaths), context, migrationData);

        // Update inline html
        await migrateTs(
            tree,
            program.getSourceFiles().filter((sourceFile) => canMigrateFile(sourceFile, program)),
            process.cwd(),
            context,
            migrationData
        );

        context.logger.warn('Warning! Run linter in updated files since line breaks or indents maybe be broken.');
    };
}
