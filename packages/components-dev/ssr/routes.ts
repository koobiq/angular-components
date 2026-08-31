import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { EXAMPLE_COMPONENTS, loadExample } from '../../docs-examples/example-module';

const SSR_EXCLUDED_EXAMPLE_IDS = new Set([
    // TODO: NG0500: During hydration Angular expected a comment node but found <p>. (#DS-5467)
    'checkbox-indeterminate',
    // TODO: KbqThemeService throws "this.window.matchMedia is not a function" during SSR. (#DS-5064)
    'empty-state-content',
    'notification-center-empty',
    'notification-center-error',
    'notification-center-infinite-scroll',
    'notification-center-overview',
    'notification-center-popover',
    'notification-center-push',
    'theme-css-variables',
    'theme-static-selection',
    // AG Grid does not support server-side rendering.
    'content-panel-with-grid',
    // TODO: NG04002: Cannot match any routes. URL Segment: 'examples/popover'. (#DS-5467)
    'popover-scrolling-and-layering'
]);
const SSR_EXCLUDED_IMPORT_PATHS = new Set([
    // TODO: Restore after fixing SSR errors in accordion examples. (#DS-5467)
    'components/accordion',
    // AG Grid does not support server-side rendering.
    'components/ag-grid',
    // TODO: Restore after breaking the circular dependency in filter-bar. (#DS-5467)
    'components/filter-bar',
    // TODO: Restore with filter-bar; this barrel exports UsernameFilterBarOptionExample. (#DS-5467)
    'components/username'
]);

/**
 * Exclusions are matched against generated ids and import paths, so a renamed or removed example
 * would leave a stale entry excluding nothing. Fail the build instead of drifting silently.
 */
const assertExclusionsMatchExamples = (name: string, excluded: Set<string>, known: Set<string>): void => {
    const stale = [...excluded].filter((entry) => !known.has(entry));

    if (stale.length > 0) {
        throw new Error(`${name} lists entries that match no example: ${stale.join(', ')}.`);
    }
};

const examples = Object.entries(EXAMPLE_COMPONENTS);

assertExclusionsMatchExamples(
    'SSR_EXCLUDED_EXAMPLE_IDS',
    SSR_EXCLUDED_EXAMPLE_IDS,
    new Set(examples.map(([id]) => id))
);
assertExclusionsMatchExamples(
    'SSR_EXCLUDED_IMPORT_PATHS',
    SSR_EXCLUDED_IMPORT_PATHS,
    new Set(examples.map(([, { importPath }]) => importPath))
);

const ssrExamples = examples.filter(
    ([id, { importPath }]) => !SSR_EXCLUDED_EXAMPLE_IDS.has(id) && !SSR_EXCLUDED_IMPORT_PATHS.has(importPath)
);

/** Ids of the examples that are rendered on the server, in catalogue order. */
export const devSsrExampleIds: string[] = ssrExamples.map(([id]) => id);

const exampleRoutes: Routes = ssrExamples.map(([id, { componentName }]) => ({
    path: id,
    loadComponent: () =>
        loadExample(id).then((moduleExports: Record<string, unknown>) => {
            const component = moduleExports[componentName];

            if (typeof component !== 'function') {
                throw new Error(`Example "${id}" does not export component "${componentName}".`);
            }

            return component as Type<unknown>;
        })
}));

// `/` is not prerendered, so the documented entry URL is served as the plain client shell: without
// these the router has nothing to match and the app dies with NG04002 on an empty outlet.
const fallbackRoutes: Routes = devSsrExampleIds.length
    ? [
          { path: '', redirectTo: devSsrExampleIds[0], pathMatch: 'full' },
          { path: '**', redirectTo: devSsrExampleIds[0] }
      ]
    : [];

export const devSsrRoutes: Routes = [...exampleRoutes, ...fallbackRoutes];
