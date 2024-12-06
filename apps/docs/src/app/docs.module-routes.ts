import { Routes } from '@angular/router';
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

export const APP_ROUTES: Routes = [
    { path: '', component: WelcomeComponent },
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
            { path: '**', redirectTo: 'colors' }
        ]
    },
    {
        path: 'main/:id',
        component: ComponentViewerComponent,
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full' },
            { path: '**', redirectTo: 'overview' }
        ]
    },
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
    { path: 'icons', component: IconsViewerComponent },
    { path: '404', component: PageNotFoundComponent },
    { path: '**', redirectTo: '/404' }
];
