import { inject } from '@angular/core';
import { CanMatchFn, Route, Routes, UrlSegment } from '@angular/router';
import { DOCS_EXAMPLE_PAGE_PATH } from './constants/example-page';
import { DOCS_DEFAULT_LOCALE } from './constants/locale';
import { DocsLocaleService } from './services/locale';
import { docsPageResolver } from './services/page-resolver';
import {
    DocsStructureCategoryId,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from './structure';

const http404Redirect = '404';

const canMatchLocaleRoutes: CanMatchFn = (_route: Route, segments: UrlSegment[]): boolean => {
    const { path } = segments[0];

    if (path === http404Redirect) return false;
    const docsLocaleService = inject(DocsLocaleService);

    return docsLocaleService.isSupportedLocale(path);
};

/**
 * Lazy loaders. Route components are code-split with `loadComponent` so the heavy page graph
 * (icons viewer, token tables, example viewers) is fetched on demand instead of being eagerly
 * bundled into the initial SSR/hydration chunk. Loaders that resolve from the same module share
 * a single chunk.
 */
const loadComponentViewer = () =>
    import('./components/component-viewer/component-viewer.component').then((m) => m.DocsComponentViewerComponent);
const loadComponentPage = () =>
    import('./components/component-viewer/component-viewer.component').then((m) => m.DocsComponentPageComponent);
const loadComponentApi = () =>
    import('./components/component-viewer/component-viewer.component').then((m) => m.DocsComponentApiComponent);
const loadTokensOverview = () =>
    import('./components/design-tokens-viewers/tokens-overview').then((m) => m.DocsTokensOverview);
const loadTypographyTable = () =>
    import('./components/design-tokens-viewers/typography-overview').then((m) => m.DocsTypographyTable);

/**
 * Routes of the given tabs of a structure item, which opens on its overview. The overview and examples tabs
 * render the page compiled from MDX, the API tab the HTML document of `tools/api-gen`.
 */
const itemTabRoutes = (tabs: DocsStructureItemTab[]): Routes => [
    { path: '', redirectTo: DocsStructureItemTab.Overview, pathMatch: 'full' },
    ...tabs.map((tab): Route =>
        tab === DocsStructureItemTab.Api
            ? { path: tab, loadComponent: loadComponentApi, pathMatch: 'full' }
            : { path: tab, loadComponent: loadComponentPage, resolve: { page: docsPageResolver }, pathMatch: 'full' }
    ),
    { path: '**', redirectTo: DocsStructureItemTab.Overview }
];

export const DOCS_ROUTES: Routes = [
    { path: '', redirectTo: DOCS_DEFAULT_LOCALE, pathMatch: 'full' },
    {
        path: ':lang',
        canMatch: [canMatchLocaleRoutes],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./components/welcome/welcome.component').then((m) => m.DocsWelcomeComponent),
                pathMatch: 'full'
            },

            /**
             * Main section routes
             */
            {
                path: DocsStructureCategoryId.Main,
                redirectTo: `${DocsStructureCategoryId.Main}/${DocsStructureItemId.Installation}`,
                pathMatch: 'full'
            },
            {
                path: `${DocsStructureCategoryId.Main}/${DocsStructureItemId.DesignTokens}`,
                loadComponent: () =>
                    import('./components/design-tokens-viewers/design-tokens-viewer').then(
                        (m) => m.DocsDesignTokensViewer
                    ),
                children: [
                    { path: '', redirectTo: DocsStructureTokensTab.Colors, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Colors, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Typography, loadComponent: loadTypographyTable, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Shadows, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.BorderRadius, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Sizes, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Semantic, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: DocsStructureTokensTab.Palette, loadComponent: loadTokensOverview, pathMatch: 'full' },
                    { path: '**', redirectTo: DocsStructureTokensTab.Colors }
                ]
            },
            {
                path: `${DocsStructureCategoryId.Main}/:id`,
                loadComponent: loadComponentViewer,
                children: itemTabRoutes([DocsStructureItemTab.Overview])
            },

            /**
             * Components section routes
             */
            {
                path: DocsStructureCategoryId.Components,
                redirectTo: `${DocsStructureCategoryId.Components}/${DocsStructureItemId.Alert}`,
                pathMatch: 'full'
            },
            {
                path: `${DocsStructureCategoryId.Components}/:id`,
                loadComponent: loadComponentViewer,
                children: itemTabRoutes([
                    DocsStructureItemTab.Overview,
                    DocsStructureItemTab.Api,
                    DocsStructureItemTab.Examples
                ])
            },

            /**
             * Other section routes
             */
            {
                path: DocsStructureCategoryId.Other,
                redirectTo: `${DocsStructureCategoryId.Other}/${DocsStructureItemId.DateFormatter}`,
                pathMatch: 'full'
            },
            {
                path: `${DocsStructureCategoryId.Other}/:id`,
                loadComponent: loadComponentViewer,
                children: itemTabRoutes([
                    DocsStructureItemTab.Overview,
                    DocsStructureItemTab.Api,
                    DocsStructureItemTab.Examples
                ])
            },

            /**
             * Icons section routes
             */
            {
                path: DocsStructureCategoryId.Icons,
                loadComponent: () =>
                    import('./components/icons-viewer/icons-viewer.component').then((m) => m.DocsIconsViewerComponent)
            }
        ]
    },

    /**
     * A single live example without the site navigation. The routes are lazy because they match the ids against
     * the examples catalogue.
     */
    {
        path: DOCS_EXAMPLE_PAGE_PATH,
        loadChildren: () =>
            import('./components/example-page/example-page.routes').then((m) => m.DOCS_EXAMPLE_PAGE_ROUTES)
    },

    /**
     * Error routes
     */
    {
        path: http404Redirect,
        loadComponent: () =>
            import('./components/page-not-found/page-not-found.component').then((m) => m.DocsPageNotFoundComponent)
    },
    { path: '**', redirectTo: http404Redirect }
];
