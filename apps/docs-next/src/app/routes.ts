import { Routes, UrlSegment } from '@angular/router';
import { DOCS_NEXT_COMPONENT_TABS } from './data/components';
import { docsNextIsFramework, docsNextIsLocale } from './data/site';
import { docsNextStoredFramework, docsNextStoredLocale } from './services/site-state';

const isSiteContext = (segments: UrlSegment[]): boolean =>
    docsNextIsLocale(segments[0]?.path) && docsNextIsFramework(segments[1]?.path);

/** Only the tabs of a component page match; any other tab redirects to the overview below. */
const canMatchComponentTab = (segments: UrlSegment[]): boolean =>
    DOCS_NEXT_COMPONENT_TABS.some((tab) => tab === segments[2]?.path);

export const DOCS_NEXT_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: () => `/${docsNextStoredLocale()}/${docsNextStoredFramework()}`
    },
    {
        // The framework is always in the address, the default one included (spec/context/framework.md).
        path: ':locale/:framework',
        canMatch: [(_route: unknown, segments: UrlSegment[]) => isSiteContext(segments)],
        loadComponent: () => import('./layout/shell').then((m) => m.DocsNextShell),
        children: [
            { path: '', loadComponent: () => import('./pages/home').then((m) => m.DocsNextHomePage) },
            {
                path: 'components',
                loadComponent: () => import('./pages/components-grid').then((m) => m.DocsNextComponentsGridPage)
            },
            { path: 'components/:id', redirectTo: 'components/:id/overview' },
            {
                path: 'components/:id/:tab',
                canMatch: [(_route: unknown, segments: UrlSegment[]) => canMatchComponentTab(segments)],
                loadComponent: () => import('./pages/component-page').then((m) => m.DocsNextComponentPage)
            },
            { path: 'components/:id/:tab', redirectTo: 'components/:id/overview' },
            { path: 'icons', loadComponent: () => import('./pages/icons').then((m) => m.DocsNextIconsPage) },
            {
                path: ':section',
                loadComponent: () => import('./pages/section-redirect').then((m) => m.DocsNextSectionRedirect)
            },
            {
                path: ':section/:page',
                loadComponent: () => import('./pages/article-page').then((m) => m.DocsNextArticlePage)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
