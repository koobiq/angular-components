import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { readWorkspace } from '@schematics/angular/utility';
import { logMessage } from '../utils/messages';
import { addPackageToPackageJson, getPackageVersionFromPackageJson } from '../utils/package-config';
import * as messages from './messages';
import { Schema } from './schema';

const VERSIONS = {
    ANGULAR_ANIMATIONS: '^0.0.0',
    ANGULAR_CDK: '^0.0.0',
    KOOBIQ_ANGULAR_LUXON_ADAPTER: '^0.0.0',
    KOOBIQ_LUXON_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_DATE_FORMATTER: '^0.0.0',
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_ICONS: '^0.0.0',
    KOOBIQ_DESIGN_TOKENS: '^0.0.0',
    LUXON: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0'
};

/**
 * This is executed when `ng add @koobiq/components` is run.
 * It adds all dependencies to the 'package.json' and schedules their installation.
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
        //
        // Its range has to come from the application, not from this repository: every
        // `@angular/animations` release pins `@angular/core` EXACTLY, so the version installed here
        // must line up with the Angular the application is already on. Writing the range this
        // monorepo happens to build with would produce `ERESOLVE` for every consumer on a different
        // patch — including ones well inside the `peerDependencies` range of `@koobiq/components`.
        const angularCoreRange = getPackageVersionFromPackageJson(tree, '@angular/core');

        addPackageToPackageJson(tree, '@angular/animations', angularCoreRange || VERSIONS.ANGULAR_ANIMATIONS);
        addPackageToPackageJson(tree, '@angular/cdk', VERSIONS.ANGULAR_CDK);
        addPackageToPackageJson(tree, '@koobiq/angular-luxon-adapter', VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER);
        // `@koobiq/angular-luxon-adapter` is a wrapper: it extends `LuxonDateAdapter` from the base
        // package and re-exports its formats, both as value imports. That makes the base a mandatory
        // peer of the wrapper, and installing a package without its mandatory peers only works on
        // npm — Yarn leaves them out, so the application ends up unable to resolve the adapter.
        addPackageToPackageJson(tree, '@koobiq/luxon-date-adapter', VERSIONS.KOOBIQ_LUXON_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/date-formatter', VERSIONS.KOOBIQ_DATE_FORMATTER);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/icons', VERSIONS.KOOBIQ_ICONS);
        addPackageToPackageJson(tree, '@koobiq/design-tokens', VERSIONS.KOOBIQ_DESIGN_TOKENS);
        addPackageToPackageJson(tree, 'luxon', VERSIONS.LUXON);
        // `overlayscrollbars` is a mandatory peer too: `@koobiq/components/scrollbar` imports it
        // unconditionally, and content-panel, notification-center and app-switcher all pull that in.
        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);

        // `addPackageToPackageJson` only edits the manifest — nothing in the Angular CLI installs
        // what a schematic adds there, so without this task the application is left with
        // dependencies it has not actually got, and the instruction below cannot be followed.
        context.addTask(new NodePackageInstallTask());

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
