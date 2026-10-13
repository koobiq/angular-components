import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet, Routes } from '@angular/router';
import {
    ActionsPanelAdaptiveExample,
    ActionsPanelCloseExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelGlobalExample,
    ActionsPanelOverviewExample,
    ActionsPanelWithDropdownAndPopoverExample
} from 'packages/docs-examples/components/actions-panel';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        ActionsPanelAdaptiveExample,
        ActionsPanelCloseExample,
        ActionsPanelCustomCounterExample,
        ActionsPanelGlobalExample,
        ActionsPanelOverviewExample,
        ActionsPanelWithDropdownAndPopoverExample
    ],
    template: `
        <actions-panel-overview-example />
        <hr />
        <actions-panel-global-example />
        <hr />
        <actions-panel-with-dropdown-and-popover-example />
        <hr />
        <actions-panel-custom-counter-example />
        <hr />
        <actions-panel-adaptive-example />
        <hr />
        <actions-panel-close-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-page-1',
    imports: [
        RouterLink,
        DevDocsExamples
    ],
    template: `
        <h2>Page1</h2>
        <a routerLink="../page-2">Go to page-2</a>
        <hr />

        <dev-examples />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevPage1 {}

@Component({
    selector: 'dev-page-2',
    imports: [RouterLink],
    template: `
        <h2>Page2</h2>
        <a routerLink="../page-1">Go to page-1</a>
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevPage2 {}

@Component({
    selector: 'dev-app',
    imports: [
        DevThemeToggle,
        DevLocaleSelector,
        RouterOutlet
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}

/** Pages rendered into the `<router-outlet />` of `template.html`. */
export const devPageRoutes: Routes = [
    { path: '', redirectTo: 'page-1', pathMatch: 'full' },
    { path: 'page-1', component: DevPage1 },
    { path: 'page-2', component: DevPage2 }
];

/** Entry point for the `dev-all` shell, which mounts this app under `/actions-panel`. */
export const devRoutes: Routes = [{ path: '', component: DevApp, children: devPageRoutes }];
