import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { TopBarExamplesModule } from '../../docs-examples/components/top-bar';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [TopBarExamplesModule],
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
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevLocaleSelector,
        KbqLocaleServiceModule,
        DevThemeToggle,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
