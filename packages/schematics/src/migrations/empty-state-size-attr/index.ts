import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { migrateTemplate, migrateTs } from '../../utils/angular-parsing';
import { getParsingInfo } from '../../utils/package-config';
import { MigrationData, readSourceFiles } from '../../utils/typescript';
import { Schema } from './schema';

export const migrationData: MigrationData = {
    elementName: 'kbq-empty-state',
    attrs: {
        key: {
            from: 'big',
            to: 'size'
        },
        value: {
            replacements: [
                { from: 'true', to: 'big' },
                { from: 'false', to: 'compact' }
            ],
            default: 'normal'
        }
    }
};

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const { tsPaths, templatePaths } = await getParsingInfo(project, tree);

        // Update external html
        await migrateTemplate(tree, Array.from(templatePaths), context, migrationData);

        // Update inline html
        await migrateTs(tree, readSourceFiles(tree, tsPaths), context, migrationData);

        context.logger.warn('Warning! Run linter in updated files since line breaks or indents maybe be broken.');
    };
}
