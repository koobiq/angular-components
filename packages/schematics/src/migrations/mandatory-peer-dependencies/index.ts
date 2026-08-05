import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { logMessage } from '../../utils/messages';
import { addPackageToPackageJson, getPackageVersionFromPackageJson } from '../../utils/package-config';

const VERSIONS = {
    ANGULAR_ANIMATIONS: '^0.0.0',
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0'
};

/**
 * `@koobiq/components` now declares `@angular/animations`, `overlayscrollbars` and
 * `@koobiq/date-adapter` as mandatory peers.
 *
 * npm installs a newly mandatory peer on upgrade by itself, but Yarn does not and pnpm only does
 * with `auto-install-peers`, so without this migration those consumers upgrade into a build that
 * fails with "Cannot find module 'overlayscrollbars'". `ng add` is the only other place that writes
 * these packages, and `ng update` never runs it.
 */
export default function migrate(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        // Every `@angular/animations` release pins `@angular/core` exactly, so the range has to come
        // from the application being upgraded rather than from the version this repository builds
        // with — anything else resolves to a version incompatible with the application's Angular.
        const angularCoreRange = getPackageVersionFromPackageJson(tree, '@angular/core');

        addPackageToPackageJson(tree, '@angular/animations', angularCoreRange || VERSIONS.ANGULAR_ANIMATIONS);
        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);

        context.addTask(new NodePackageInstallTask());

        // `addPackageToPackageJson` leaves an entry that is already there untouched, so a project
        // pinned below the new floor keeps its version — and that one is not an install error but a
        // `TypeError: this.dateAdapter.addCalendarUnits is not a function` inside `kbq-time-range`.
        logMessage(context.logger, [
            '`@koobiq/date-adapter` must be 3.4.0 or newer.',
            'If your project already depends on an older one, upgrade it together with the adapter',
            'you use (`@koobiq/luxon-date-adapter` or `@koobiq/moment-date-adapter`): the date',
            'components call `addCalendarUnits()` and `startOf()`, which 3.4.0 was the first to add.'
        ]);
    };
}
