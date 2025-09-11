import { inject } from '@angular/core';
import { CanMatchFn, Route, Routes, UrlSegment } from '@angular/router';
import {
    DocsCdkApiComponent,
    DocsCdkOverviewComponent,
    DocsComponentApiComponent,
    DocsComponentExamplesComponent,
    DocsComponentOverviewComponent,
    DocsComponentViewerComponent
} from './components/component-viewer/component-viewer.component';
import { DocsDesignTokensViewer } from './components/design-tokens-viewers/design-tokens-viewer';
import { DocsTokensColors } from './components/design-tokens-viewers/tokens-colors';
import { DocsTokensOverview } from './components/design-tokens-viewers/tokens-overview';
import { DocsIconsViewerComponent } from './components/icons-viewer/icons-viewer.component';
import { DocsPageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DocsWelcomeComponent } from './components/welcome/welcome.component';
import { DOCS_DEFAULT_LOCALE } from './constants/locale';
import { DocsLocaleService } from './services/locale';
import { DocsStructureCategoryId, DocsStructureItemId, DocsStructureItemTab } from './structure';

const http404Redirect = '404';

const canMatchLocaleRoutes: CanMatchFn = (_route: Route, segments: UrlSegment[]): boolean => {
    const { path } = segments[0];

    if (path === http404Redirect) return false;
    const docsLocaleService = inject(DocsLocaleService);

    return docsLocaleService.isSupportedLocale(path);
};

export const DOCS_ROUTES: Routes = [
    { path: '', redirectTo: DOCS_DEFAULT_LOCALE, pathMatch: 'full' },
    {
        path: ':lang',
        canMatch: [canMatchLocaleRoutes],
        children: [
            {
                path: '',
                component: DocsWelcomeComponent,
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
                component: DocsDesignTokensViewer,
                children: [
                    { path: '', redirectTo: 'colors', pathMatch: 'full' },
                    { path: 'colors', component: DocsTokensColors, pathMatch: 'full' },
                    { path: 'shadows', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'border-radius', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'sizes', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'palette', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: '**', redirectTo: 'colors' }
                ]
            },
            {
                path: `${DocsStructureCategoryId.Main}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsStructureItemTab.Overview, pathMatch: 'full' },
                    { path: DocsStructureItemTab.Overview, component: DocsComponentOverviewComponent },
                    { path: '**', redirectTo: DocsStructureItemTab.Overview }
                ]
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
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsStructureItemTab.Overview, pathMatch: 'full' },
                    {
                        path: DocsStructureItemTab.Overview,
                        component: DocsComponentOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Api,
                        component: DocsComponentApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsStructureItemTab.Overview }
                ]
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
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsStructureItemTab.Overview, pathMatch: 'full' },
                    {
                        path: DocsStructureItemTab.Overview,
                        component: DocsComponentOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Api,
                        component: DocsComponentApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsStructureItemTab.Overview }
                ]
            },

            /**
             * CDK section routes
             */
            {
                path: DocsStructureCategoryId.CDK,
                redirectTo: `${DocsStructureCategoryId.CDK}/${DocsStructureItemId.A11y}`,
                pathMatch: 'full'
            },
            {
                path: `${DocsStructureCategoryId.CDK}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsStructureItemTab.Overview, pathMatch: 'full' },
                    {
                        path: DocsStructureItemTab.Overview,
                        component: DocsCdkOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Api,
                        component: DocsCdkApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsStructureItemTab.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsStructureItemTab.Overview }
                ]
            },

            /**
             * Icons section routes
             */
            { path: DocsStructureCategoryId.Icons, component: DocsIconsViewerComponent }
        ]
    },

    /**
     * Error routes
     */
    { path: http404Redirect, component: DocsPageNotFoundComponent },
    { path: '**', redirectTo: http404Redirect }
];
