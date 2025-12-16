import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DynamicTranslationExamplesModule } from 'packages/docs-examples/components/dynamic-translation';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [DynamicTranslationExamplesModule],
    template: `
        <dynamic-translation-overview-example />
        <hr />
        <dynamic-translation-with-dynamic-component-creation-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevThemeToggle,
        DevLocaleSelector,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
