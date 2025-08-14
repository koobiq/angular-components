import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DynamicTranslationExamplesModule } from 'packages/docs-examples/components/dynamic-translation';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [DynamicTranslationExamplesModule],
    selector: 'dev-examples',
    template: `
        <dynamic-translation-overview-example />
        <hr />
        <dynamic-translation-with-dynamic-component-creation-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        DevLocaleSelector,
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
