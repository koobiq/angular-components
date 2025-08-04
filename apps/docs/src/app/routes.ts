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
import { DocsTokensOverview } from './components/design-tokens-viewers/tokens-overview';
import { DocsIconsViewerComponent } from './components/icons-viewer/icons-viewer.component';
import { DocsPageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DocsWelcomeComponent } from './components/welcome/welcome.component';
import { DOCS_DEFAULT_LOCALE } from './constants/locale';
import { DocsLocaleService } from './services/locale';
import { DocsDocStructureCategoryId, DocsDocStructureCategoryItemSection } from './structure';

const canMatchLocaleRoutes: CanMatchFn = (_route: Route, segments: UrlSegment[]): boolean => {
    const { path } = segments[0];

    if (path === '404') return false;
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
                path: DocsDocStructureCategoryId.Main,
                redirectTo: `${DocsDocStructureCategoryId.Main}/installation`,
                pathMatch: 'full'
            },
            {
                path: `${DocsDocStructureCategoryId.Main}/design-tokens`,
                component: DocsDesignTokensViewer,
                children: [
                    { path: '', redirectTo: 'colors', pathMatch: 'full' },
                    { path: 'colors', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'shadows', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'border-radius', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'sizes', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: 'palette', component: DocsTokensOverview, pathMatch: 'full' },
                    { path: '**', redirectTo: 'colors' }
                ]
            },
            {
                path: `${DocsDocStructureCategoryId.Main}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsDocStructureCategoryItemSection.Overview, pathMatch: 'full' },
                    { path: DocsDocStructureCategoryItemSection.Overview, component: DocsComponentOverviewComponent },
                    { path: '**', redirectTo: DocsDocStructureCategoryItemSection.Overview }
                ]
            },

            /**
             * Components section routes
             */
            {
                path: DocsDocStructureCategoryId.Components,
                redirectTo: `${DocsDocStructureCategoryId.Components}/alert`,
                pathMatch: 'full'
            },
            {
                path: `${DocsDocStructureCategoryId.Components}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsDocStructureCategoryItemSection.Overview, pathMatch: 'full' },
                    {
                        path: DocsDocStructureCategoryItemSection.Overview,
                        component: DocsComponentOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Api,
                        component: DocsComponentApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsDocStructureCategoryItemSection.Overview }
                ]
            },

            /**
             * Other section routes
             */
            {
                path: DocsDocStructureCategoryId.Other,
                redirectTo: `${DocsDocStructureCategoryId.Other}/date-formatter`,
                pathMatch: 'full'
            },
            {
                path: `${DocsDocStructureCategoryId.Other}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsDocStructureCategoryItemSection.Overview, pathMatch: 'full' },
                    {
                        path: DocsDocStructureCategoryItemSection.Overview,
                        component: DocsComponentOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Api,
                        component: DocsComponentApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsDocStructureCategoryItemSection.Overview }
                ]
            },

            /**
             * CDK section routes
             */
            {
                path: DocsDocStructureCategoryId.CDK,
                redirectTo: `${DocsDocStructureCategoryId.CDK}/a11y`,
                pathMatch: 'full'
            },
            {
                path: `${DocsDocStructureCategoryId.CDK}/:id`,
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: DocsDocStructureCategoryItemSection.Overview, pathMatch: 'full' },
                    {
                        path: DocsDocStructureCategoryItemSection.Overview,
                        component: DocsCdkOverviewComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Api,
                        component: DocsCdkApiComponent,
                        pathMatch: 'full'
                    },
                    {
                        path: DocsDocStructureCategoryItemSection.Examples,
                        component: DocsComponentExamplesComponent,
                        pathMatch: 'full'
                    },
                    { path: '**', redirectTo: DocsDocStructureCategoryItemSection.Overview }
                ]
            },

            /**
             * Icons section routes
             */
            { path: DocsDocStructureCategoryId.Icons, component: DocsIconsViewerComponent }
        ]
    },

    /**
     * Error routes
     */
    { path: '404', component: DocsPageNotFoundComponent },
    { path: '**', redirectTo: '404' }
];
