import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { logMessage } from '../../utils/messages';
import { addPackageToPackageJson, getPackageVersionFromPackageJson } from '../../utils/package-config';

const VERSIONS = {
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0'
};

/**
 * `@koobiq/components` now declares `overlayscrollbars` and `@koobiq/date-adapter` as mandatory peers.
 *
 * npm installs a newly mandatory peer on upgrade by itself, but Yarn does not and pnpm only does
 * with `auto-install-peers`, so without this migration those consumers upgrade into a build that
 * fails with "Cannot find module 'overlayscrollbars'". `ng add` is the only other place that writes
 * these packages, and `ng update` never runs it.
 */
export default function migrate(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        // Read before the entry is added: `addPackageToPackageJson` leaves one that is already
        // there untouched, so this is the last moment the project's own range is still visible.
        const dateAdapterRange = getPackageVersionFromPackageJson(tree, '@koobiq/date-adapter');

        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);

        context.addTask(new NodePackageInstallTask());

        // Only when the project brought its own range, which the call above kept: one pinned below
        // the new floor is not an install error but a
        // `TypeError: this.dateAdapter.addCalendarUnits is not a function` inside `kbq-time-range`.
        // A project that had no entry just got the current range and has nothing to act on.
        if (dateAdapterRange) {
            logMessage(context.logger, [
                `\`@koobiq/date-adapter\` is declared as "${dateAdapterRange}" and was left untouched.`,
                'It has to be 3.4.0 or newer — upgrade it together with the adapter you use',
                '(`@koobiq/luxon-date-adapter` or `@koobiq/moment-date-adapter`): the date components',
                'call `addCalendarUnits()` and `startOf()`, which 3.4.0 was the first to add.'
            ]);
        }
    };
}
