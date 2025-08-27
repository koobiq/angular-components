import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActionsPanelExamplesModule } from 'packages/docs-examples/components/actions-panel';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [ActionsPanelExamplesModule],
    selector: 'dev-examples',
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
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        RouterLink,
        DevExamples
    ],
    selector: 'dev-page-1',
    template: `
        <h2>Page1</h2>
        <a routerLink="/page-2">Go to page-2</a>
        <hr />

        <dev-examples />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevPage1 {}

@Component({
    standalone: true,
    imports: [RouterLink],
    selector: 'dev-page-2',
    template: `
        <h2>Page2</h2>
        <a routerLink="/page-1">Go to page-1</a>
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevPage2 {}

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        DevLocaleSelector,
        RouterOutlet
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
