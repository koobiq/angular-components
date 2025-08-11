import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { TopBarExamplesModule } from '../../docs-examples/components/top-bar';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [TopBarExamplesModule],
    selector: 'dev-examples',
    template: `
        <top-bar-actions-example />
        <!-- <top-bar-breadcrumbs-example /> -->
        <!-- <top-bar-overflow-example /> -->
        <!-- <top-bar-overview-example /> -->
        <!-- <top-bar-title-counter-example /> -->
        <!-- <top-bar-title-counter-adaptive-example /> -->
        <!-- <top-bar-breadcrumbs-adaptive-example /> -->
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        DevLocaleSelector,
        KbqLocaleServiceModule,
        DevThemeToggle,
        DevExamples
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
