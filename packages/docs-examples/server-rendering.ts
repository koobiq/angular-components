import type { LiveExample } from './example-module';

/**
 * Examples that cannot render on the server: the documentation site loads them in the browser once the page has
 * rendered, and `components-dev/ssr` does not prerender them. Both lists are matched against `EXAMPLE_COMPONENTS`.
 */
export const EXAMPLE_IDS_WITHOUT_SERVER_RENDERING = new Set([
    // AG Grid does not support server-side rendering.
    'content-panel-with-grid'
]);

export const EXAMPLE_IMPORT_PATHS_WITHOUT_SERVER_RENDERING = new Set([
    // AG Grid does not support server-side rendering.
    'components/ag-grid'
]);

export const canRenderExampleOnServer = (id: string, { importPath }: LiveExample): boolean =>
    !EXAMPLE_IDS_WITHOUT_SERVER_RENDERING.has(id) && !EXAMPLE_IMPORT_PATHS_WITHOUT_SERVER_RENDERING.has(importPath);
