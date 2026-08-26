import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { EXAMPLE_COMPONENTS, loadExample } from '../../docs-examples/example-module';

const SSR_EXCLUDED_EXAMPLE_IDS = new Set([
    // TODO: NG0500: During hydration Angular expected a comment node but found <p>. (#DS-5467)
    'checkbox-indeterminate',
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

export const devSsrRoutes: Routes = Object.entries(EXAMPLE_COMPONENTS)
    .filter(([id, { importPath }]) => !SSR_EXCLUDED_EXAMPLE_IDS.has(id) && !SSR_EXCLUDED_IMPORT_PATHS.has(importPath))
    .map(([id, { componentName }]) => ({
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
