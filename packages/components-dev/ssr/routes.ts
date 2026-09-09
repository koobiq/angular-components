import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { EXAMPLE_COMPONENTS, loadExample } from '../../docs-examples/example-module';

// TODO: Removing an entry here is not proof that the example survives SSR: `ssr:build` only prerenders,
// while a hydration mismatch is thrown by the browser, after its parser has restructured the server
// markup. A browser run over `devSsrExampleIds` would make this list a gate rather than a record.
// (#DS-5539)
const SSR_EXCLUDED_EXAMPLE_IDS = new Set([
    // AG Grid does not support server-side rendering.
    'content-panel-with-grid',
    // Both examples are a bare `<iframe src="/examples/<name>">`, a URL that only the docs app routes.
    // Here they fall through to `**` and render an unrelated example, so prerendering them proves
    // nothing about the popover or the select. Restore once this app serves those routes itself.
    'popover-scrolling-and-layering',
    'select-scrolling-and-layering'
]);
const SSR_EXCLUDED_IMPORT_PATHS = new Set([
    // AG Grid does not support server-side rendering.
    'components/ag-grid'
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
