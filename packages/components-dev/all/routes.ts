import { Routes } from '@angular/router';

/**
 * Sibling dev apps deliberately left out of the shell. Listed here so a new dev app is either
 * registered below or explicitly skipped, never silently missing.
 */
export const DEV_APPS_WITHOUT_ROUTE: readonly string[] = [
    // This shell.
    'all',
    // Owns its own router and needs the server/prerender build; served by `yarn ssr:dev`.
    'ssr',
    // Exports `DevMfeRoot`, not `DevApp`, and mounts itself with `devMountMfe()` instead of bootstrapping.
    'toast-shadow-dom'
];

/**
 * One lazy route per sibling dev app; the path is the directory name and doubles as the sidebar label.
 *
 * The `import()` specifiers are written out because the bundler cannot code-split a computed specifier.
 * Nothing but `@angular/router` may be imported into this file: any other import would land in the
 * initial chunk instead of the route's own.
 */
export const devAppRoutes: Routes = [
    { path: 'accordion', loadComponent: () => import('../accordion/module').then((m) => m.DevApp) },
    // Nests its own pages under `<router-outlet />`.
    { path: 'actions-panel', loadChildren: () => import('../actions-panel/module').then((m) => m.devRoutes) },
    { path: 'ag-grid', loadComponent: () => import('../ag-grid/module').then((m) => m.DevApp) },
    { path: 'alert', loadComponent: () => import('../alert/module').then((m) => m.DevApp) },
    { path: 'app-switcher', loadComponent: () => import('../app-switcher/module').then((m) => m.DevApp) },
    { path: 'autocomplete', loadComponent: () => import('../autocomplete/module').then((m) => m.DevApp) },
    { path: 'badge', loadComponent: () => import('../badge/module').then((m) => m.DevApp) },
    // Nests its own pages under `<router-outlet />`.
    { path: 'breadcrumbs', loadChildren: () => import('../breadcrumbs/module').then((m) => m.devRoutes) },
    { path: 'button', loadComponent: () => import('../button/module').then((m) => m.DevApp) },
    { path: 'button-toggle', loadComponent: () => import('../button-toggle/module').then((m) => m.DevApp) },
    { path: 'checkbox', loadComponent: () => import('../checkbox/module').then((m) => m.DevApp) },
    { path: 'clamped-text', loadComponent: () => import('../clamped-text/module').then((m) => m.DevApp) },
    { path: 'code-block', loadComponent: () => import('../code-block/module').then((m) => m.DevApp) },
    { path: 'content-panel', loadComponent: () => import('../content-panel/module').then((m) => m.DevApp) },
    // Needs Luxon date formats rather than the shell's `KbqLuxonDateModule` defaults; `loadChildren` scopes
    // its providers to this route.
    { path: 'date-formatter', loadChildren: () => import('../date-formatter/module').then((m) => m.devRoutes) },
    { path: 'date-pipes', loadComponent: () => import('../date-pipes/module').then((m) => m.DevApp) },
    { path: 'datepicker', loadComponent: () => import('../datepicker/module').then((m) => m.DevApp) },
    { path: 'divider', loadComponent: () => import('../divider/module').then((m) => m.DevApp) },
    { path: 'dl', loadComponent: () => import('../dl/module').then((m) => m.DevApp) },
    { path: 'dropdown', loadComponent: () => import('../dropdown/module').then((m) => m.DevApp) },
    { path: 'dynamic-translation', loadComponent: () => import('../dynamic-translation/module').then((m) => m.DevApp) },
    { path: 'empty-state', loadComponent: () => import('../empty-state/module').then((m) => m.DevApp) },
    { path: 'file-upload', loadComponent: () => import('../file-upload/module').then((m) => m.DevApp) },
    { path: 'filesize-formatter', loadComponent: () => import('../filesize-formatter/module').then((m) => m.DevApp) },
    // Shares one chunk with 'username'; see filter-bar-chunk.ts.
    { path: 'filter-bar', loadComponent: () => import('./filter-bar-chunk').then((m) => m.DevFilterBarApp) },
    { path: 'flag', loadComponent: () => import('../flag/module').then((m) => m.DevApp) },
    { path: 'flex-layout', loadComponent: () => import('../flex-layout/module').then((m) => m.DevApp) },
    { path: 'form-field', loadComponent: () => import('../form-field/module').then((m) => m.DevApp) },
    { path: 'forms', loadComponent: () => import('../forms/module').then((m) => m.DevApp) },
    { path: 'highlight', loadComponent: () => import('../highlight/module').then((m) => m.DevApp) },
    { path: 'hint', loadComponent: () => import('../hint/module').then((m) => m.DevApp) },
    { path: 'icon', loadComponent: () => import('../icon/module').then((m) => m.DevApp) },
    {
        path: 'icon-adopted-stylesheets',
        loadComponent: () => import('../icon-adopted-stylesheets/module').then((m) => m.DevApp)
    },
    { path: 'icon-item', loadComponent: () => import('../icon-item/module').then((m) => m.DevApp) },
    { path: 'inline-edit', loadComponent: () => import('../inline-edit/module').then((m) => m.DevApp) },
    { path: 'input', loadComponent: () => import('../input/module').then((m) => m.DevApp) },
    { path: 'link', loadComponent: () => import('../link/module').then((m) => m.DevApp) },
    { path: 'list', loadComponent: () => import('../list/module').then((m) => m.DevApp) },
    { path: 'loader-overlay', loadComponent: () => import('../loader-overlay/module').then((m) => m.DevApp) },
    { path: 'locale', loadComponent: () => import('../locale/module').then((m) => m.DevApp) },
    { path: 'markdown', loadComponent: () => import('../markdown/module').then((m) => m.DevApp) },
    { path: 'modal', loadComponent: () => import('../modal/module').then((m) => m.DevApp) },
    { path: 'navbar', loadComponent: () => import('../navbar/module').then((m) => m.DevApp) },
    { path: 'notification-center', loadComponent: () => import('../notification-center/module').then((m) => m.DevApp) },
    { path: 'number-formatter', loadComponent: () => import('../number-formatter/module').then((m) => m.DevApp) },
    { path: 'overflow-items', loadComponent: () => import('../overflow-items/module').then((m) => m.DevApp) },
    { path: 'popover', loadComponent: () => import('../popover/module').then((m) => m.DevApp) },
    { path: 'progress-bar', loadComponent: () => import('../progress-bar/module').then((m) => m.DevApp) },
    { path: 'progress-spinner', loadComponent: () => import('../progress-spinner/module').then((m) => m.DevApp) },
    { path: 'radio', loadComponent: () => import('../radio/module').then((m) => m.DevApp) },
    { path: 'resizer', loadComponent: () => import('../resizer/module').then((m) => m.DevApp) },
    { path: 'scrollbar', loadComponent: () => import('../scrollbar/module').then((m) => m.DevApp) },
    { path: 'search-expandable', loadComponent: () => import('../search-expandable/module').then((m) => m.DevApp) },
    { path: 'select', loadComponent: () => import('../select/module').then((m) => m.DevApp) },
    { path: 'sidebar', loadComponent: () => import('../sidebar/module').then((m) => m.DevApp) },
    { path: 'sidepanel', loadComponent: () => import('../sidepanel/module').then((m) => m.DevApp) },
    { path: 'skeleton', loadComponent: () => import('../skeleton/module').then((m) => m.DevApp) },
    { path: 'split-button', loadComponent: () => import('../split-button/module').then((m) => m.DevApp) },
    { path: 'splitter', loadComponent: () => import('../splitter/module').then((m) => m.DevApp) },
    { path: 'table', loadComponent: () => import('../table/module').then((m) => m.DevApp) },
    { path: 'tabs', loadComponent: () => import('../tabs/module').then((m) => m.DevApp) },
    { path: 'tag', loadComponent: () => import('../tag/module').then((m) => m.DevApp) },
    { path: 'textarea', loadComponent: () => import('../textarea/module').then((m) => m.DevApp) },
    { path: 'time-range', loadComponent: () => import('../time-range/module').then((m) => m.DevApp) },
    { path: 'timepicker', loadComponent: () => import('../timepicker/module').then((m) => m.DevApp) },
    { path: 'timezone', loadComponent: () => import('../timezone/module').then((m) => m.DevApp) },
    { path: 'title', loadComponent: () => import('../title/module').then((m) => m.DevApp) },
    { path: 'toast', loadComponent: () => import('../toast/module').then((m) => m.DevApp) },
    { path: 'toggle', loadComponent: () => import('../toggle/module').then((m) => m.DevApp) },
    { path: 'tooltip', loadComponent: () => import('../tooltip/module').then((m) => m.DevApp) },
    { path: 'top-bar', loadComponent: () => import('../top-bar/module').then((m) => m.DevApp) },
    { path: 'tree', loadComponent: () => import('../tree/module').then((m) => m.DevApp) },
    { path: 'tree-select', loadComponent: () => import('../tree-select/module').then((m) => m.DevApp) },
    { path: 'typography', loadComponent: () => import('../typography/module').then((m) => m.DevApp) },
    // Shares one chunk with 'filter-bar'; see filter-bar-chunk.ts.
    { path: 'username', loadComponent: () => import('./filter-bar-chunk').then((m) => m.DevUsernameApp) },
    { path: 'validation', loadComponent: () => import('../validation/module').then((m) => m.DevApp) },
    { path: 'z-index', loadComponent: () => import('../z-index/module').then((m) => m.DevApp) }
];

/** Sidebar entries, derived from the route table so the two cannot disagree. */
export const devAppNames: string[] = devAppRoutes.map(({ path }) => path!);

export const devAllRoutes: Routes = [
    ...devAppRoutes,
    { path: '', redirectTo: devAppNames[0], pathMatch: 'full' },
    { path: '**', redirectTo: devAppNames[0] }
];
