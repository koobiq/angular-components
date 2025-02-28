import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActionsPanelExamplesModule } from 'packages/docs-examples/components/actions-panel';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [
        ActionsPanelExamplesModule,
        RouterLink
    ],
    selector: 'page-1',
    templateUrl: './template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Page1 {}

@Component({
    standalone: true,
    imports: [RouterLink],
    selector: 'page-2',
    template: `
        <h2>Page2</h2>
        <a routerLink="/page-1">Go to page-1</a>
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Page2 {}

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        DevLocaleSelector,
        RouterOutlet
    ],
    selector: 'app',
    template: `
        <dev-theme-toggle />
        <dev-locale-selector />
        <hr />
        <router-outlet />
    `,
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelDev {}
