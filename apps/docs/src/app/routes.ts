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
import { DesignTokensViewer } from './components/design-tokens-viewers/design-tokens-viewer';
import { TokensOverview } from './components/design-tokens-viewers/tokens-overview';
import { DocsIconsViewerComponent } from './components/icons-viewer/icons-viewer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DocsWelcomeComponent } from './components/welcome/welcome.component';
import { DOCS_DEFAULT_LOCALE } from './constants/locale';
import { DocsLocaleService } from './services/locale';

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
            { path: 'main', redirectTo: 'main/installation', pathMatch: 'full' },
            {
                path: 'main/design-tokens',
                component: DesignTokensViewer,
                children: [
                    { path: '', redirectTo: 'colors', pathMatch: 'full' },
                    { path: 'colors', component: TokensOverview, pathMatch: 'full' },
                    { path: 'shadows', component: TokensOverview, pathMatch: 'full' },
                    { path: 'border-radius', component: TokensOverview, pathMatch: 'full' },
                    { path: 'sizes', component: TokensOverview, pathMatch: 'full' },
                    { path: 'tokens-typography', component: TokensOverview, pathMatch: 'full' },
                    { path: 'palette', component: TokensOverview, pathMatch: 'full' },
                    { path: '**', redirectTo: 'colors' }
                ]
            },
            {
                path: 'main/:id',
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: DocsComponentOverviewComponent },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Components section routes
             */
            { path: 'components', redirectTo: 'components/alert', pathMatch: 'full' },
            {
                path: 'components/:id',
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    {
                        path: 'overview',
                        component: DocsComponentOverviewComponent,
                        pathMatch: 'full'
                    },
                    { path: 'api', component: DocsComponentApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: DocsComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Other section routes
             */
            { path: 'other', redirectTo: 'other/date-formatter', pathMatch: 'full' },
            {
                path: 'other/:id',
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: DocsComponentOverviewComponent, pathMatch: 'full' },
                    { path: 'api', component: DocsComponentApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: DocsComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * CDK section routes
             */
            { path: 'cdk', redirectTo: 'cdk/a11y', pathMatch: 'full' },
            {
                path: 'cdk/:id',
                component: DocsComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: DocsCdkOverviewComponent, pathMatch: 'full' },
                    { path: 'api', component: DocsCdkApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: DocsComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Icons section routes
             */
            { path: 'icons', component: DocsIconsViewerComponent }
        ]
    },

    /**
     * Error routes
     */
    { path: '404', component: PageNotFoundComponent },
    { path: '**', redirectTo: '404' }
];
