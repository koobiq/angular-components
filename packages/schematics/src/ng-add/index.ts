import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { readWorkspace } from '@schematics/angular/utility';

import { addPackageToPackageJson } from '../utils/package-config';
import * as messages from './messages';
import { Schema } from './schema';

const VERSIONS = {
    ANGULAR_CDK: '^0.0.0',
    KOOBIQ_CDK: '^0.0.0',
    KOOBIQ_ANGULAR_LUXON_ADAPTER: '^0.0.0',
    KOOBIQ_DATE_FORMATTER: '^0.0.0',
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_ICONS: '^0.0.0',
    KOOBIQ_TOKENS_BUILDER: '^0.0.0',
    KOOBIQ_DESIGN_TOKENS: '^0.0.0',
    MESSAGEFORMAT_CORE: '^0.0.0',
    LUXON: '^0.0.0',
    MARKED: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0',
    NGX_HIGHLIGHTJS: '^0.0.0'
};

/**
 * This is executed when `ng add @koobiq/components` is run.
 * It installs all dependencies in the 'package.json' and runs 'ng-add-setup-project' schematic.
 */
export default function ngAdd(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        if (project) {
            const workspace = await readWorkspace(tree);
            const projectWorkspace = workspace.projects.get(project);

            if (!projectWorkspace) {
                throw new SchematicsException(messages.noProject(project));
            }
        }

        // Installing dependencies
        addPackageToPackageJson(tree, '@angular/cdk', VERSIONS.ANGULAR_CDK);
        addPackageToPackageJson(tree, '@koobiq/cdk', VERSIONS.KOOBIQ_CDK);
        addPackageToPackageJson(tree, '@koobiq/angular-luxon-adapter', VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/date-formatter', VERSIONS.KOOBIQ_DATE_FORMATTER);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/icons', VERSIONS.KOOBIQ_ICONS);
        addPackageToPackageJson(tree, '@koobiq/tokens-builder', VERSIONS.KOOBIQ_TOKENS_BUILDER);
        addPackageToPackageJson(tree, '@koobiq/design-tokens', VERSIONS.KOOBIQ_DESIGN_TOKENS);
        addPackageToPackageJson(tree, '@messageformat/core', VERSIONS.MESSAGEFORMAT_CORE);
        addPackageToPackageJson(tree, 'luxon', VERSIONS.LUXON);
        addPackageToPackageJson(tree, 'marked', VERSIONS.MARKED);
        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);
        addPackageToPackageJson(tree, 'ngx-highlightjs', VERSIONS.NGX_HIGHLIGHTJS);

        context.addTask(new RunSchematicTask('ng-add-setup-project', options), [
            context.addTask(new NodePackageInstallTask())
        ]);
    };
}
