import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { ClampedTextExamplesModule } from '../../docs-examples/components/clamped-text';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-examples',
    imports: [ClampedTextExamplesModule],
    template: `
        <clamped-text-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevDocsExamples,
        DevLocaleSelector,
        KbqLocaleServiceModule
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
