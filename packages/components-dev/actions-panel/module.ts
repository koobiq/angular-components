import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActionsPanelExamplesModule } from 'packages/docs-examples/components/actions-panel';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [ActionsPanelExamplesModule],
    template: `
        <actions-panel-with-dropdown-and-popover-example />
        <hr />
        <actions-panel-custom-counter-example />
        <hr />
        <actions-panel-overview-example />
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
        <a routerLink="/page-2">Go to page-2</a>
        <hr />

        <dev-examples />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevPage1 {}

@Component({
    selector: 'dev-page-2',
    imports: [RouterLink],
    template: `
        <h2>Page2</h2>
        <a routerLink="/page-1">Go to page-1</a>
        <hr />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
