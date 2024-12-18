import { inject, NgModule } from '@angular/core';
import { CanMatchFn, Route, RouterModule, Routes, UrlSegment } from '@angular/router';
import {
    CdkApiComponent,
    CdkOverviewComponent,
    ComponentApiComponent,
    ComponentExamplesComponent,
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './components/component-viewer/component-viewer.component';
import { DesignTokensViewer } from './components/design-tokens-viewers/design-tokens-viewer';
import { TokensOverview } from './components/design-tokens-viewers/tokens-overview';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { IconsViewerComponent } from './containers/icons-viewer/icons-viewer.component';
import { DOCS_DEFAULT_LOCALE_CODE, DocsLocaleService } from './services/docs-locale.service';

const canMatchLocaleRoutes: CanMatchFn = (_route: Route, segments: UrlSegment[]): boolean => {
    const { path } = segments[0];
    if (path === '404') return false;
    const docsLocaleService = inject(DocsLocaleService);
    return docsLocaleService.isSupportedLocale(path);
};

const ROUTES: Routes = [
    { path: '', redirectTo: DOCS_DEFAULT_LOCALE_CODE, pathMatch: 'full' },
    {
        path: ':lang',
        canMatch: [canMatchLocaleRoutes],
        children: [
            { path: '', component: WelcomeComponent, pathMatch: 'full' },

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
                component: ComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: ComponentOverviewComponent },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Components section routes
             */
            { path: 'components', redirectTo: 'components/alert', pathMatch: 'full' },
            {
                path: 'components/:id',
                component: ComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full' },
                    { path: 'api', component: ComponentApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: ComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Other section routes
             */
            { path: 'other', redirectTo: 'other/date-formatter', pathMatch: 'full' },
            {
                path: 'other/:id',
                component: ComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full' },
                    { path: 'api', component: ComponentApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: ComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * CDK section routes
             */
            { path: 'cdk', redirectTo: 'cdk/a11y', pathMatch: 'full' },
            {
                path: 'cdk/:id',
                component: ComponentViewerComponent,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: CdkOverviewComponent, pathMatch: 'full' },
                    { path: 'api', component: CdkApiComponent, pathMatch: 'full' },
                    { path: 'examples', component: ComponentExamplesComponent, pathMatch: 'full' },
                    { path: '**', redirectTo: 'overview' }
                ]
            },

            /**
             * Icons section routes
             */
            { path: 'icons', component: IconsViewerComponent }
        ]
    },

    /**
     * Error routes
     */
    { path: '404', component: PageNotFoundComponent },
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(ROUTES, {
            scrollPositionRestoration: 'disabled',
            onSameUrlNavigation: 'reload'
        })

    ],
    exports: [RouterModule]
})
export class DocsRoutingModule {}
