import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import { logMessage } from '../utils/messages';
import { addPackageToPackageJson } from '../utils/package-config';
import * as messages from './messages';
import { Schema } from './schema';

const VERSIONS = {
    ANGULAR_ANIMATIONS: '^0.0.0',
    ANGULAR_CDK: '^0.0.0',
    KOOBIQ_ANGULAR_LUXON_ADAPTER: '^0.0.0',
    KOOBIQ_DATE_FORMATTER: '^0.0.0',
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_ICONS: '^0.0.0',
    KOOBIQ_DESIGN_TOKENS: '^0.0.0',
    LUXON: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0'
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
        // `@angular/animations` is a mandatory peer: the components declare `animations: [...]`
        // metadata and bind synthetic `[@state]` properties, which throw NG05105 without it.
        addPackageToPackageJson(tree, '@angular/animations', VERSIONS.ANGULAR_ANIMATIONS);
        addPackageToPackageJson(tree, '@angular/cdk', VERSIONS.ANGULAR_CDK);
        addPackageToPackageJson(tree, '@koobiq/angular-luxon-adapter', VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/date-formatter', VERSIONS.KOOBIQ_DATE_FORMATTER);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/icons', VERSIONS.KOOBIQ_ICONS);
        addPackageToPackageJson(tree, '@koobiq/design-tokens', VERSIONS.KOOBIQ_DESIGN_TOKENS);
        addPackageToPackageJson(tree, 'luxon', VERSIONS.LUXON);
        // `overlayscrollbars` is a mandatory peer too: `@koobiq/components/scrollbar` imports it
        // unconditionally, and content-panel, notification-center and app-switcher all pull that in.
        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);

        // Installing `@angular/animations` only satisfies the peer; the application still has to
        // provide the animations module itself, so point at the one step this schematic cannot do.
        logMessage(context.logger, [
            'Angular animations have to be provided by the application.',
            "Add `provideAnimations()` from '@angular/platform-browser/animations' to the providers",
            'of `bootstrapApplication`, otherwise every component that animates (dropdown, select,',
            'tooltip, toast, datepicker) fails with NG05105 as soon as it opens.'
        ]);
    };
}
